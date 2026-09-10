export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const easeInOutQuart = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

export const easeOutQuint = (t: number): number =>
  1 - Math.pow(1 - t, 5);

export const easeInOutSine = (t: number): number =>
  -(Math.cos(Math.PI * t) - 1) / 2;

export const breathe = (t: number, speed = 1): number =>
  (Math.sin(t * Math.PI * 2 * speed) + 1) / 2;

export const clamp = (v: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, v));

export const remap = (v: number, inMin: number, inMax: number, outMin = 0, outMax = 1): number => {
  const t = clamp((v - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
};
