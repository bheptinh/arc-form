import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';

import classes from './ColorPicker.module.css';

type Props = {
  // a hex colour, e.g. #aaaaaa; anything else is ignored
  value: string;
  // a drag on the palette or slider ended, or a typed hex was committed
  onChangeEnd: (hex: string) => void;
  size?: 'normal' | 'small';
};

type Hsv = { h: number; s: number; v: number };

const SIZES = {
  normal: { width: 200, height: 150, sliderWidth: 20, sliderPointerWidth: 28 },
  small: { width: 140, height: 80, sliderWidth: 10, sliderPointerWidth: 18 },
};
const PALETTE_POINTER = 12;
const SLIDER_POINTER = 8;

export function hsvToRgb(h: number, s: number, v: number) {
  const u = 255 * (v / 100);
  h /= 60;
  s /= 100;
  const i = Math.floor(h);
  const f = i % 2 ? h - i : 1 - (h - i);
  const m = u * (1 - s);
  const n = u * (1 - s * f);
  switch (i) {
    case 6:
    case 0:
      return [Math.round(u), Math.round(n), Math.round(m)];
    case 1:
      return [Math.round(n), Math.round(u), Math.round(m)];
    case 2:
      return [Math.round(m), Math.round(u), Math.round(n)];
    case 3:
      return [Math.round(m), Math.round(n), Math.round(u)];
    case 4:
      return [Math.round(n), Math.round(m), Math.round(u)];
    case 5:
      return [Math.round(u), Math.round(m), Math.round(n)];
  }
  return null;
}

export function rgbToHsv(r: number, g: number, b: number): Hsv {
  r /= 255;
  g /= 255;
  b /= 255;
  const n = Math.min(r, g, b);
  const v = Math.max(r, g, b);
  const m = v - n;
  if (m === 0) return { h: 0, s: 0, v: 100 * v };
  const h = r === n ? 3 + (b - g) / m : g === n ? 5 + (r - b) / m : 1 + (g - r) / m;
  const round = (x: number) => Math.round(+x.toFixed(2) * 10) / 10;
  return { h: round(60 * (h === 6 ? 0 : h)), s: round(100 * (m / v)), v: round(100 * v) };
}

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

const hsvToHex = ({ h, s, v }: Hsv) => {
  const rgb = hsvToRgb(h, s, v);
  return rgb ? rgbToHex(rgb[0], rgb[1], rgb[2]) : '';
};

const hexToHsv = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsv(rgb[0], rgb[1], rgb[2]) : null;
};

/** Hue/saturation palette, brightness slider and hex field. */
export default function ColorPicker({ value, onChangeEnd, size = 'normal' }: Props) {
  const { width, height, sliderWidth, sliderPointerWidth } = SIZES[size];
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 0, s: 0, v: 100 });
  const [text, setText] = useState(value);
  const [dragging, setDragging] = useState<'palette' | 'slider' | null>(null);
  const palette = useRef<HTMLCanvasElement>(null);
  const slider = useRef<HTMLCanvasElement>(null);

  // a new value from outside moves the pointers, unless it's the colour already shown
  useEffect(() => {
    const next = hexToHsv(value);
    if (!next || value.toLowerCase() == hsvToHex(hsv)) return;
    setHsv(next);
    setText(value);
  }, [value]);

  useEffect(() => {
    const ctx = palette.current?.getContext('2d');
    if (!ctx) return;
    const hue = ctx.createLinearGradient(0, 0, width, 0);
    ['#F00', '#FF0', '#0F0', '#0FF', '#00F', '#F0F', '#F00'].forEach((c, i) =>
      hue.addColorStop(i / 6, c)
    );
    ctx.fillStyle = hue;
    ctx.fillRect(0, 0, width, height);
    const white = ctx.createLinearGradient(0, 0, 0, height);
    white.addColorStop(0, 'rgba(255,255,255,0)');
    white.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = white;
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  // the slider runs from the palette colour at full brightness down to black
  useEffect(() => {
    const ctx = slider.current?.getContext('2d');
    const rgb = hsvToRgb(hsv.h, hsv.s, 100);
    if (!ctx || !rgb) return;
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
    grad.addColorStop(1, '#000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, sliderWidth, height);
  }, [hsv.h, hsv.s, sliderWidth, height]);

  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(null);
    window.addEventListener('mouseup', stop);
    return () => window.removeEventListener('mouseup', stop);
  }, [dragging]);

  const pick = (target: 'palette' | 'slider', e: MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const next =
      target == 'palette'
        ? { ...hsv, h: (offsetX / width) * 360, s: (1 - offsetY / height) * 100 }
        : { ...hsv, v: (1 - offsetY / height) * 100 };
    setHsv(next);
    setText(hsvToHex(next));
    return next;
  };

  const handlers = (target: 'palette' | 'slider') => ({
    onMouseDown: (e: MouseEvent) => {
      if (target == 'slider') e.preventDefault();
      setDragging(target);
      pick(target, e);
    },
    onMouseMove: (e: MouseEvent) => dragging == target && pick(target, e),
    // leaving the canvas mid-drag commits too, as letting go would
    onMouseUp: (e: MouseEvent) => onChangeEnd(hsvToHex(dragging == target ? pick(target, e) : hsv)),
    onMouseLeave: () => dragging == target && onChangeEnd(hsvToHex(hsv)),
  });

  const commitText = () => {
    const hex = text.trim();
    const next = hexToHsv(hex);
    if (!next) return setText(hsvToHex(hsv));
    if (hex.toLowerCase() == hsvToHex(hsv)) return;
    setHsv(next);
    setText(hex);
    onChangeEnd(hex);
  };

  return (
    <div>
      <div className={classes.pickers}>
        <div className={classes.palette}>
          <canvas
            ref={palette}
            className={classes.canvas}
            width={width}
            height={height}
            {...handlers('palette')}
          />
          <div
            className={classes.pointer}
            style={{
              width: PALETTE_POINTER,
              height: PALETTE_POINTER,
              left: Math.floor((hsv.h / 360) * width - Math.floor(PALETTE_POINTER / 2)),
              top: Math.floor((1 - hsv.s / 100) * height - Math.floor(PALETTE_POINTER / 2)),
            }}
          />
        </div>
        <div className={classes.slider}>
          <canvas
            ref={slider}
            className={classes.canvas}
            width={sliderWidth}
            height={height}
            {...handlers('slider')}
          />
          <div
            className={classes.pointer}
            style={{
              width: sliderPointerWidth,
              height: SLIDER_POINTER,
              left: -4,
              top: Math.floor((1 - hsv.v / 100) * height - Math.floor(SLIDER_POINTER / 2)),
            }}
          />
        </div>
      </div>
      <input
        type="text"
        name="color"
        className={classes.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commitText}
        onKeyUp={(e: KeyboardEvent) => e.code == 'Enter' && commitText()}
      />
    </div>
  );
}
