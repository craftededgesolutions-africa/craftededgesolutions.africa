export interface Point { x: number; y: number }

export const polarToCart = (cx: number, cy: number, r: number, angle: number): Point => ({
  x: cx + r * Math.cos(angle),
  y: cy + r * Math.sin(angle),
});

export const polygonPoints = (cx: number, cy: number, r: number, sides: number, rotation = 0): Point[] =>
  Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2 + rotation;
    return polarToCart(cx, cy, r, angle);
  });

export const polygonPath = (pts: Point[]): string =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

export const starPath = (cx: number, cy: number, r1: number, r2: number, points: number, rotation = 0): string => {
  const pts: Point[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const angle = (i / (points * 2)) * Math.PI * 2 + rotation;
    pts.push(polarToCart(cx, cy, r, angle));
  }
  return polygonPath(pts);
};

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

export const dist = (a: Point, b: Point): number =>
  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

export const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};
