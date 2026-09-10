import React from 'react';
import { breathe } from '../utils/easing';

interface Props {
  frame: number;
  opacity?: number;
}

export const VolumetricLight: React.FC<Props> = ({ frame, opacity = 1 }) => {
  const pulse = breathe(frame / 360, 0.3);
  const pulse2 = breathe(frame / 360 + 0.33, 0.2);

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      viewBox="0 0 3840 2160"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="vl-center" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#e89240" stopOpacity={0.06 + pulse * 0.03} />
          <stop offset="40%" stopColor="#e89240" stopOpacity={0.02} />
          <stop offset="100%" stopColor="#e89240" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vl-top" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="#d4d4cc" stopOpacity={0.05 + pulse2 * 0.02} />
          <stop offset="100%" stopColor="#d4d4cc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vl-side-l" cx="0%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e89240" stopOpacity={0.04} />
          <stop offset="100%" stopColor="#e89240" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vl-side-r" cx="100%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e89240" stopOpacity={0.03} />
          <stop offset="100%" stopColor="#e89240" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="3840" height="2160" fill="url(#vl-center)" />
      <rect width="3840" height="2160" fill="url(#vl-top)" />
      <rect width="3840" height="2160" fill="url(#vl-side-l)" />
      <rect width="3840" height="2160" fill="url(#vl-side-r)" />
    </svg>
  );
};
