import { useContext, useState } from 'react';
import { hsvaToHex, HsvaColor } from '@uiw/color-convert';
import { sendBreathingColor } from '../../helper/ArduinoAPI';
import { StatusMessageContext } from '../../Layout';
import ColorPicker from '../../components/ColorPicker/ColorPicker';
import SendButton from '../../components/SendButton/SendButton';
import './breathing.scss';

export default function Breathing() {
  const [color, setColor] = useState<HsvaColor>({ h: 0, s: 0, v: 100, a: 0 });
  const setStatusMessage = useContext(StatusMessageContext);

  async function sendCommand() {
    return sendBreathingColor(hsvaToHex(color).split('#').pop());
  }

  return <div className='mode breathing-color-mode'>
    <h1>Breathing Color</h1>
    <ColorPicker color={color} onChange={(c) => setColor({ ...color, ...c.hsva })} />
    <SendButton
      onClick={sendCommand}
      onSuccess={() => setStatusMessage({ text: "Color changed!", type: 'info' })}
      onError={() => setStatusMessage({ text: "Failed to change color!", type: 'error' })}
    />
  </div>;
}