import { useContext, useState } from 'react';
import { hsvaToHex, HsvaColor, ColorResult } from '@uiw/color-convert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { sendFadeColors } from '../../helper/ArduinoAPI';
import { StatusMessageContext } from '../../Layout';
import ColorPicker from '../../components/ColorPicker/ColorPicker';
import SendButton from '../../components/SendButton/SendButton';
import './fade.scss';

type COLORS = Array<HsvaColor | null>;
const EMPTY_COLOR : HsvaColor = { h: 0, s: 0, v: 100, a: 0 };

export default function Fade() {
  const [colors, setColors] = useState<COLORS>([EMPTY_COLOR, EMPTY_COLOR, null, null, null, null]);
  const setStatusMessage = useContext(StatusMessageContext);

  async function sendCommand() {
    const hexColors: Array<string> = [];
    for (const color of colors.filter(elt => elt !== null)) hexColors.push(hsvaToHex(color).split('#').pop());
    return sendFadeColors(...hexColors);
  }
  function addStep() {
    setColors((cs) => {
      let i = -1;
      cs.find((elt, ind) => {
        if (elt === null) {
          i = ind;
          return true;
        }
        return false;
      });

      const _cs = [...cs];
      _cs[i] = EMPTY_COLOR;
      return _cs;
    });
  }
  function removeStep(index: number) {
    setColors((cs) => {
      const _cs = [];
      for (let i = 0; i < index; i++) {
        _cs.push(cs[i]);
      }
      for (let i = index + 1; i < colors.length; i++) {
        _cs.push(cs[i]);
      }
      _cs.push(null);
      return _cs;
    });
  }
  function changeColor(color: ColorResult, index: number) {
    setColors((cs) => {
      const _cs = [...cs];
      _cs[index] = color.hsva;
      return _cs;
    });
  }

  return <div className='mode fade-color-mode'>
    <h1>Fade Color</h1>
    <div className='steps'>
      {
        colors.filter(elt => elt !== null).map((color, i) => {
          return <div key={i} className='step'>
            <h2>
              Step {i + 1}
              {
                colors.filter(elt => elt !== null).length > 2 &&
                <button className='remove-button' onClick={() => removeStep(i)}><FontAwesomeIcon icon={faTrash} /></button>
              }
            </h2>
            <ColorPicker color={color} onChange={(c) => changeColor(c, i)} />
          </div>;
        })
      }
      {
        colors.filter(elt => elt === null).length > 0 &&
        <div>
          <button className='add-button' onClick={addStep}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      }
    </div>
    <SendButton
      onClick={sendCommand}
      onSuccess={() => setStatusMessage({ text: "Color changed!", type: 'info' })}
      onError={() => setStatusMessage({ text: "Failed to change color!", type: 'error' })}
    />
  </div>;
}