import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { hsvaToHex, hexToHsva, HsvaColor, ColorResult } from '@uiw/color-convert';
import ShadeSlider from '@uiw/react-color-shade-slider';
import Wheel from '@uiw/react-color-wheel';
import './ColorPicker.scss';

type Props = {
  onChange: (c: ColorResult) => void,
  color: HsvaColor
};

export default function ColorPicker({ color, onChange }: Props) {
  const ref = useRef(null);
  const [input, setInput] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(200);

  useEffect(() => {
    setInput(null);
  }, [color]);

  function inputChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;

    if (value.startsWith('#') && value.length === 7 && CSS.supports("color", value)) {
      onChange({ hsva: hexToHsva(value) } as ColorResult);
    }
    else {
      setInput(value);
    }
  }

  function checkWidth() {
    const size = ref.current.clientWidth;
    setRadius(Math.min(Math.max(200, size), 400));
  }

  useEffect(() => {
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return <div ref={ref} className='color-picker'>
    <Wheel
      color={color}
      onChange={onChange}
      width={radius} height={radius}
    />
    <ShadeSlider
      hsva={color}
      style={{ width: radius, marginTop: 20 }}
      onChange={(newShade: { v: number }) => onChange({ hsva: { ...color, ...newShade } } as ColorResult)}
    />
    <input
      value={input || hsvaToHex(color)}
      style={{ color: hsvaToHex(color) }}
      onInput={inputChange}
    />
  </div>;
}