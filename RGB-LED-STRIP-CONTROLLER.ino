#include <Bridge.h>
#include <BridgeClient.h>
#include <BridgeServer.h>

//RGB-Pins
#define R 5
#define G 6
#define B 3

//Server
BridgeServer server;
BridgeClient client;

//Data
const byte MAX_SUPPORTED_COLORS = 6;
String MODE = "off";
byte COLORS[3] = { 0, 0, 0 };
byte MODECOLORS[MAX_SUPPORTED_COLORS][3];
byte MODEDATA[MAX_SUPPORTED_COLORS];

unsigned long time = millis();
unsigned int state = 0;

void setup() {
  Serial.begin(9600);
  delay(2000);

  randomSeed(analogRead(0));

  pinMode(R, OUTPUT);
  pinMode(G, OUTPUT);
  pinMode(B, OUTPUT);
  
  Serial.println("--- RGB-LED-CONTROLLER ---");
  Serial.print("Starting Linux Bridge ...");
  
  Bridge.begin();
  Serial.println(" done!");

  server.listenOnLocalhost();
  server.begin();

  Serial.println("Webserver ready on http://[Arduino IP]/sd!");
  Reset();
}

void loop() {
  client = server.accept();
  if(client) checkHttpIncommingRequest(client);

  analogWrite(R, COLORS[0]);
  analogWrite(G, COLORS[1]);
  analogWrite(B, COLORS[2]);

  if(MODE == "breathing") Breathing(MODECOLORS[0]);
  else if(MODE == "fade") Fade();

  unsigned long relativeTimeMS = millis() - time;
  state += relativeTimeMS;
  time = millis();
}

void checkHttpIncommingRequest(BridgeClient client) {
  String url = "";
  while(client.available()) url += char(client.read());
  url = url.substring(0, url.length() - 2);

  int code = processURL(url);

  sendClientResponse(String("ARDUINO_CALLBACK(") + generateJSON(code, url) + String(")"));

  client.stop();
}
int processURL(String url) {
  String mode = url.substring(0, url.indexOf('/'));

  if(mode == "off") return SetupOffMode();
  else if(mode == "static") return SetupStaticColorMode(url.substring(url.indexOf('/') + 1));
  else if(mode == "breathing") return SetupBreathingMode(url.substring(url.indexOf('/') + 1));
  else if(mode == "fade") return SetupFadeMode(url.substring(url.indexOf('/') + 1));
  else return 400;

  return 500;
}
String generateJSON(int code, String url) {
  String json = "{";
  json += String("\"code\":") + String(code) + String(",");
  json += String("\"url\":\"") + url + String("\",");
  json += String("\"mode\":\"") + MODE + String("\",");
  json += "\"colors\":[";
  for(int i = 0; i < MAX_SUPPORTED_COLORS; i++) {
    json += "{";
    json += String("\"r\":") + MODECOLORS[i][0] + String(",");
    json += String("\"g\":") + MODECOLORS[i][1] + String(",");
    json += String("\"b\":") + MODECOLORS[i][2];
    json += "}";
    if(i < MAX_SUPPORTED_COLORS - 1) json += ",";
  }
  json += "],";
  json += "\"modedata\":[";
  for(int i = 0; i < MAX_SUPPORTED_COLORS; i++) {
    json += MODEDATA[i];
    if(i < MAX_SUPPORTED_COLORS - 1) json += ",";
  }
  json += "]";
  json += "}";

  return json;
}

int SetupOffMode() {
  Reset();
  return 200;
}

int SetupStaticColorMode(String hexColor) {
  Reset();
  
  MODE = "staic";

  COLORS[0] = HexToByte(hexColor.substring(0, 2));
  COLORS[1] = HexToByte(hexColor.substring(2, 4));
  COLORS[2] = HexToByte(hexColor.substring(4, 6));
  return 200;
}

int SetupBreathingMode(String hexColor) {
  Reset();

  MODE = "breathing";

  MODECOLORS[0][0] = HexToByte(hexColor.substring(0, 2));
  MODECOLORS[0][1] = HexToByte(hexColor.substring(2, 4));
  MODECOLORS[0][2] = HexToByte(hexColor.substring(4, 6));

  return 200;
}
void Breathing(byte color[]) {
  if (state < 5000) {
    //rise on
    COLORS[0] = (int) (color[0] * lerp(state, 0, 5000));
    COLORS[1] = (int) (color[1] * lerp(state, 0, 5000));
    COLORS[2] = (int) (color[2] * lerp(state, 0, 5000));
  } else if (state < 10000) {
    //rise off
    COLORS[0] = (int) (color[0] * (1 - lerp(state, 5000, 10000)));
    COLORS[1] = (int) (color[1] * (1 - lerp(state, 5000, 10000)));
    COLORS[2] = (int) (color[2] * (1 - lerp(state, 5000, 10000)));
  } else {
    state = 0;
  }
}

int SetupFadeMode(String hexColors) {
  Reset();

  MODE = "fade";
  byte i = 0;

  while (i < 6 && hexColors.length() > 0) {
    String color = hexColors.substring(0, hexColors.indexOf('/'));

    MODECOLORS[i][0] = HexToByte(color.substring(0, 2));
    MODECOLORS[i][1] = HexToByte(color.substring(2, 4));
    MODECOLORS[i][2] = HexToByte(color.substring(4, 6));
  
    i++;

    if(hexColors.indexOf('/') < 0) break;
    hexColors = hexColors.substring(hexColors.indexOf('/') + 1);
  }

  MODEDATA[0] = i;

  return 200;
}
void Fade() {
  byte currentColorIndex = state / 5000;

  if(currentColorIndex >= MODEDATA[0]) {
    state = 0;
    currentColorIndex = 0;
  }

  double progress = lerp(state, currentColorIndex * 5000, currentColorIndex * 5000 + 5000);

  byte nextColorIndex = currentColorIndex + 1;
  if(nextColorIndex >= MODEDATA[0]) nextColorIndex = 0;

  COLORS[0] = (int) ((MODECOLORS[currentColorIndex][0] * (1 - progress)) + (MODECOLORS[nextColorIndex][0] * progress));
  COLORS[1] = (int) ((MODECOLORS[currentColorIndex][1] * (1 - progress)) + (MODECOLORS[nextColorIndex][1] * progress));
  COLORS[2] = (int) ((MODECOLORS[currentColorIndex][2] * (1 - progress)) + (MODECOLORS[nextColorIndex][2] * progress));
}

void Reset() {
  MODE = "off";

  COLORS[0] = 0;
  COLORS[1] = 0;
  COLORS[2] = 0;

  for(byte i = 0; i < MAX_SUPPORTED_COLORS; i++) {
    for(byte j = 0; j < 3; j++) {
      MODECOLORS[i][j] = 0;
    }
  }

  for(byte i = 0; i < MAX_SUPPORTED_COLORS; i++) {
    MODEDATA[i] = 0;
  }

  state = 0;
}
void sendClientResponse(String message) {
  uint8_t status[message.length()];
  
  for(int i = 0; i < message.length(); i++) {
    status[i] = message.charAt(i);
  }

  client.write(status, sizeof(status));
}

byte HexToByte(String hex) {
  byte first = 0;
  byte second = 0;

  if(hex.charAt(0) < 'a') first = hex.charAt(0) - '0';
  else first = hex.charAt(0) - 'a' + 10;

  if(hex.charAt(1) < 'a') second =  hex.charAt(1) - '0';
  else second = hex.charAt(1) - 'a' + 10;

  return first * 16 + second;
}
double lerp(int value, int start, int end) {
  return (value - start) / ((double) (end - start));
}