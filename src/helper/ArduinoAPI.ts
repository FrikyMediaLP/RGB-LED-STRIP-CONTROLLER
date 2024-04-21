export const ARDUINO_BASE =  window.location.origin + '/arduino/';
const REQUEST_TIMEOUT_DURATION = 10;

export type JSON_RESPONSE = {
  code: Number,
  url: string,
  mode: string,
  colors: Array<{r: Number, g: Number, b: Number}>,
  modedata: Array<Number>
};

declare global {
  interface Window { ARDUINO_CALLBACK: (json: JSON_RESPONSE) => void ; }
}

export async function sendStaticColor(hexColor: string) {
  return sendRequest('static/' + hexColor);
}

export async function sendFadeColors(...hexColors: Array<string>) {
  return sendRequest('fade/' + hexColors.join('/'));
}

export async function sendBreathingColor(hexColor: string) {
  return sendRequest('breathing/' + hexColor);
}

export async function sendRequest(endpoint: string): Promise<JSON_RESPONSE> {
  removeJSONP();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      removeJSONP();
      reject({ err: 'request timeout' });
    }, REQUEST_TIMEOUT_DURATION * 1000);

    window.ARDUINO_CALLBACK = (json: JSON_RESPONSE) => {
      clearTimeout(timeout);
      removeJSONP();

      if (json.code !== 200) reject(json);
      else resolve(json);
    };

    appendJSONP(ARDUINO_BASE + endpoint);
  });
}

function appendJSONP(src: string) {
  let s = document.createElement("script");
  s.id = "ARDUINO_REQUEST";
  s.src = src;
  document.body.appendChild(s);
}

function removeJSONP() {
  if (document.querySelector('#ARDUINO_REQUEST')) {
    document.querySelector('#ARDUINO_REQUEST').remove();
  }
}