import React from 'react';
import { seededRandom } from '../utils/geometry';
import { COLORS } from '../utils/colors';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  seed: number;
}

interface Props {
  frame: number;
  count?: number;
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

export const ParticleSystem: React.FC<Props> = ({
  frame,
  count = 120,
  width = 3840,
  height = 2160,
  color = COLORS.accent,
  opacity = 1,
}) => {
  const rand = seededRandom(42);
  const particles: Particle[] = Array.from({ length: count }, (_, i) => {
    const r = seededRandom(i * 31 + 7);
    return {
      x: r() * width,
      y: r() * height,
      vx: (r() - 0.5) * 0.4,
      vy: -(r() * 0.3 + 0.05),
      size: r() * 3 + 0.5,
      opacity: r() * 0.6 + 0.1,
      seed: i,
    };
  });
  void rand;

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {particles.map((p, i) => {
        const t = (frame * 0.5 + i * 17.3) % height;
        const x = p.x + Math.sin((frame * 0.008 + i * 0.4)) * 30 + p.vx * frame * 0.3;
        const y = ((p.y - t * p.vy * 60) % height + height) % height;
        const flicker = 0.5 + 0.5 * Math.sin(frame * 0.07 + i * 1.3);
        const alpha = p.opacity * flicker;

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={p.size}
            fill={color}
            opacity={alpha}
          />
        );
      })}
    </svg>
  );
};
