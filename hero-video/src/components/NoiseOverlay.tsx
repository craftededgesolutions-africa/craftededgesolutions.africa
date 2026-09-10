import React from 'react';

interface Props {
  opacity?: number;
  frame: number;
}

export const NoiseOverlay: React.FC<Props> = ({ opacity = 0.04, frame }) => {
  const seed = frame % 4;
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={`noise-${seed}`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          seed={seed}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#noise-${seed})`} />
    </svg>
  );
};
