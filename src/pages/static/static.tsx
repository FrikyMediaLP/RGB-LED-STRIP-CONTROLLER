import { useContext, useState } from 'react';
import { hsvaToHex, HsvaColor, ColorResult } from '@uiw/color-convert';
import { sendStaticColor } from '../../helper/ArduinoAPI';
import { StatusMessageContext } from '../../Layout';
import ColorPicker from '../../components/ColorPicker/ColorPicker';
import SendButton from '../../components/SendButton/SendButton';
import './static.scss';

export default function Static() {
  const [color, setColor] = useState<HsvaColor>({ h: 0, s: 0, v: 100, a: 0 });
  const setStatusMessage = useContext(StatusMessageContext);

  async function sendCommand() {
    return sendStaticColor(hsvaToHex(color).split('#').pop());
  }

  return <div className='mode static-color-mode'>
    <h1>Static Color</h1>
    <ColorPicker color={color} onChange={(c: ColorResult) => setColor({ ...color, ...c.hsva })} />
    <SendButton
      onClick={sendCommand}
      onSuccess={() => setStatusMessage({ text: "Color changed!", type: 'info' })}
      onError={() => setStatusMessage({ text: "Failed to change color!", type: 'error' })}
    />
  </div>;
}