import React from 'react';
import { COLORS } from '../utils/colors';
import { polygonPoints, polygonPath, starPath } from '../utils/geometry';
import { remap, easeOutExpo, easeInOutCubic, breathe } from '../utils/easing';

interface Props {
  frame: number;
  progress: number;
  opacity: number;
}

const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

export const SovereigntyScene: React.FC<Props> = ({ frame, progress, opacity }) => {
  const equilibriumP = easeInOutCubic(remap(progress, 0, 0.5));
  const logoP = easeOutExpo(remap(progress, 0.4, 0.8));
  const taglineP = easeOutExpo(remap(progress, 0.6, 0.95));

  const breatheVal = breathe(frame / 240, 0.5);

  // Sacred geometry — full flower of life derived structure
  const outerHex = polygonPoints(CX, CY, 600, 6, Math.PI / 6);
  const innerHex = polygonPoints(CX, CY, 340, 6, Math.PI / 6);
  const triangle1 = polygonPoints(CX, CY, 520, 3, -Math.PI / 2);
  const triangle2 = polygonPoints(CX, CY, 520, 3, Math.PI / 6);

  // Orbiting accent dots
  const orbitDots = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + frame * 0.004;
    const r = 480 + breatheVal * 20;
    return {
      x: CX + r * Math.cos(angle),
      y: CY + r * Math.sin(angle),
    };
  });

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="sov-glow-xl">
          <feGaussianBlur stdDeviation="20" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sov-glow-lg">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sov-glow-sm">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="sov-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.18 + breatheVal * 0.06} />
          <stop offset="60%" stopColor={COLORS.accent} stopOpacity="0.04" />
          <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {equilibriumP > 0 && (
        <g>
          {/* Background radial wash */}
          <circle cx={CX} cy={CY} r={800 + breatheVal * 40}
            fill="url(#sov-core)" opacity={equilibriumP} />

          {/* Star of David / hexagram */}
          <path d={polygonPath(triangle1)}
            fill="none" stroke={COLORS.goldDim} strokeWidth="1.5"
            opacity={0.5 * equilibriumP} />
          <path d={polygonPath(triangle2)}
            fill="none" stroke={COLORS.goldDim} strokeWidth="1.5"
            opacity={0.5 * equilibriumP} />

          {/* Outer hexagon */}
          <path d={polygonPath(outerHex)}
            fill="none" stroke={COLORS.gold} strokeWidth="2.5"
            opacity={0.7 * equilibriumP}
            filter="url(#sov-glow-sm)" />

          {/* Inner hexagon */}
          <path d={polygonPath(innerHex)}
            fill="none" stroke={COLORS.platinumDim} strokeWidth="1.5"
            opacity={0.6 * equilibriumP} />

          {/* 6-pointed star */}
          <path d={starPath(CX, CY, 200, 100, 6, -Math.PI / 2)}
            fill="none" stroke={COLORS.goldTrace} strokeWidth="1"
            opacity={0.4 * equilibriumP} />

          {/* Corner accents on outer hex */}
          {outerHex.map((pt, i) => (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={12}
                fill="none" stroke={COLORS.gold} strokeWidth="2"
                opacity={0.8 * equilibriumP} />
              <circle cx={pt.x} cy={pt.y} r={4}
                fill={COLORS.gold} opacity={equilibriumP} />
            </g>
          ))}

          {/* Orbiting dots */}
          {orbitDots.map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r={6}
              fill={i % 2 === 0 ? COLORS.gold : COLORS.platinum}
              opacity={0.7 * equilibriumP}
              filter="url(#sov-glow-sm)" />
          ))}

          {/* Central mandala rings */}
          {[60, 100, 145, 195].map((r, i) => (
            <circle key={i} cx={CX} cy={CY} r={r + breatheVal * (i + 1) * 3}
              fill="none"
              stroke={i % 2 === 0 ? COLORS.gold : COLORS.platinum}
              strokeWidth={i === 0 ? 2.5 : 1.5}
              opacity={(0.8 - i * 0.1) * equilibriumP}
              filter={i === 0 ? 'url(#sov-glow-lg)' : undefined} />
          ))}

          {/* Rotating inner detail */}
          <g transform={`rotate(${frame * 0.15} ${CX} ${CY})`}>
            {polygonPoints(CX, CY, 230, 12, 0).map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r={3}
                fill={COLORS.gold} opacity={0.4 * equilibriumP} />
            ))}
          </g>
          <g transform={`rotate(${-frame * 0.1} ${CX} ${CY})`}>
            {polygonPoints(CX, CY, 300, 8, 0).map((pt, i) => (
              <line key={i}
                x1={CX} y1={CY} x2={pt.x} y2={pt.y}
                stroke={COLORS.goldTrace} strokeWidth="1"
                opacity={0.25 * equilibriumP} />
            ))}
          </g>

          {/* Core */}
          <circle cx={CX} cy={CY} r={28 + breatheVal * 4}
            fill={COLORS.bgCard} stroke={COLORS.accent} strokeWidth="3"
            opacity={equilibriumP} filter="url(#sov-glow-xl)" />
          <circle cx={CX} cy={CY} r={10}
            fill={COLORS.accent} opacity={equilibriumP} />
        </g>
      )}

      {/* Logo mark — wordmark */}
      {logoP > 0 && (
        <g filter="url(#sov-glow-sm)">
          {/* Eyebrow */}
          <text
            x={CX} y={CY + 760}
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="28" letterSpacing="8"
            fill={COLORS.gold}
            opacity={logoP * 0.7}>
            — CRAFTED EDGE SOLUTIONS —
          </text>

          {/* Main wordmark */}
          <text
            x={CX} y={CY + 840}
            textAnchor="middle"
            fontFamily="'Instrument Serif', serif"
            fontSize="96"
            fill={COLORS.fg}
            opacity={logoP}
            style={{ fontStyle: 'italic' }}>
            Precision Engineering.
          </text>

          {/* Tagline */}
          {taglineP > 0 && (
            <text
              x={CX} y={CY + 920}
              textAnchor="middle"
              fontFamily="'Inter', sans-serif"
              fontSize="32" letterSpacing="4"
              fill={COLORS.fgMid}
              opacity={taglineP * 0.8}>
              NAIROBI · GLOBAL · EST. 2024
            </text>
          )}
        </g>
      )}
    </svg>
  );
};
