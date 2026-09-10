import React from 'react';
import { COLORS } from '../utils/colors';
import { polygonPoints, polygonPath, seededRandom } from '../utils/geometry';
import { easeOutExpo, remap, easeInOutCubic } from '../utils/easing';

interface Props {
  frame: number;
  progress: number; // 0–1 scene progress
  opacity: number;
}

const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

export const BlueprintScene: React.FC<Props> = ({ frame, progress, opacity }) => {
  const rand = seededRandom(99);

  // Grid lines — major
  const gridSpacing = 120;
  const cols = Math.ceil(W / gridSpacing) + 1;
  const rows = Math.ceil(H / gridSpacing) + 1;

  // Grid reveal: lines draw in from center outward
  const gridProgress = easeOutExpo(remap(progress, 0, 0.4));

  // Sacred geometry — nested hexagons
  const hexProgress = easeOutExpo(remap(progress, 0.15, 0.65));
  const hexLayers = 6;

  // Construction tick marks
  const tickProgress = remap(progress, 0.3, 0.8);

  // Diagonal construction lines
  const diagProgress = easeInOutCubic(remap(progress, 0.1, 0.5));

  // Fine grid
  const fineSpacing = 30;
  const fineProgress = easeOutExpo(remap(progress, 0.05, 0.35));

  void rand;

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="bp-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bp-glow-strong">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="bp-fade" cx="50%" cy="50%" r="50%">
          <stop offset="30%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0.2" />
        </radialGradient>
        <mask id="bp-mask">
          <rect width={W} height={H} fill="url(#bp-fade)" />
        </mask>
      </defs>

      <g mask="url(#bp-mask)">
        {/* Fine grid */}
        {fineProgress > 0 && Array.from({ length: Math.ceil(W / fineSpacing) + 1 }, (_, i) => {
          const x = i * fineSpacing;
          const distFromCenter = Math.abs(x - CX) / (W / 2);
          const show = distFromCenter < fineProgress;
          return show ? (
            <line key={`fg-v-${i}`} x1={x} y1={0} x2={x} y2={H}
              stroke={COLORS.gridLine} strokeWidth="0.5" opacity={0.6} />
          ) : null;
        })}
        {fineProgress > 0 && Array.from({ length: Math.ceil(H / fineSpacing) + 1 }, (_, i) => {
          const y = i * fineSpacing;
          const distFromCenter = Math.abs(y - CY) / (H / 2);
          const show = distFromCenter < fineProgress;
          return show ? (
            <line key={`fg-h-${i}`} x1={0} y1={y} x2={W} y2={y}
              stroke={COLORS.gridLine} strokeWidth="0.5" opacity={0.6} />
          ) : null;
        })}

        {/* Major grid */}
        {Array.from({ length: cols }, (_, i) => {
          const x = i * gridSpacing;
          const distFromCenter = Math.abs(x - CX) / (W / 2);
          const show = distFromCenter < gridProgress;
          return show ? (
            <line key={`v-${i}`} x1={x} y1={0} x2={x} y2={H}
              stroke={COLORS.gridStrong} strokeWidth="1" opacity={0.8} />
          ) : null;
        })}
        {Array.from({ length: rows }, (_, i) => {
          const y = i * gridSpacing;
          const distFromCenter = Math.abs(y - CY) / (H / 2);
          const show = distFromCenter < gridProgress;
          return show ? (
            <line key={`h-${i}`} x1={0} y1={y} x2={W} y2={y}
              stroke={COLORS.gridStrong} strokeWidth="1" opacity={0.8} />
          ) : null;
        })}

        {/* Diagonal construction lines */}
        {diagProgress > 0 && [
          [0, 0, W, H], [W, 0, 0, H],
          [CX, 0, CX, H], [0, CY, W, CY],
          [0, CY - 400, W, CY + 400], [0, CY + 400, W, CY - 400],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={`diag-${i}`}
            x1={x1} y1={y1}
            x2={x1 + (x2 - x1) * diagProgress}
            y2={y1 + (y2 - y1) * diagProgress}
            stroke={COLORS.goldTrace} strokeWidth="1" opacity={0.5}
          />
        ))}

        {/* Sacred geometry — nested hexagons */}
        {hexProgress > 0 && Array.from({ length: hexLayers }, (_, layer) => {
          const r = 160 + layer * 180;
          const layerProgress = easeOutExpo(remap(hexProgress, layer / hexLayers, (layer + 1.5) / hexLayers));
          if (layerProgress <= 0) return null;
          const pts = polygonPoints(CX, CY, r, 6, Math.PI / 6);
          const fullPath = polygonPath(pts);
          const strokeColor = layer % 2 === 0 ? COLORS.goldDim : COLORS.platinumDim;
          return (
            <g key={`hex-${layer}`} filter={layer === 0 ? 'url(#bp-glow)' : undefined}>
              <path
                d={fullPath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={layer === 0 ? 2.5 : 1.5}
                strokeDasharray={`${2000 * layerProgress} 2000`}
                opacity={0.9 - layer * 0.08}
              />
              {/* Corner accent dots */}
              {pts.map((p, pi) => (
                <circle key={pi} cx={p.x} cy={p.y} r={4 - layer * 0.3}
                  fill={strokeColor} opacity={layerProgress * (0.9 - layer * 0.1)} />
              ))}
            </g>
          );
        })}

        {/* Central circle + crosshair */}
        {hexProgress > 0 && (
          <g filter="url(#bp-glow-strong)">
            <circle cx={CX} cy={CY} r={320 * hexProgress}
              fill="none" stroke={COLORS.gold} strokeWidth="2" opacity={0.4 * hexProgress} />
            <circle cx={CX} cy={CY} r={16 * hexProgress}
              fill="none" stroke={COLORS.gold} strokeWidth="2" opacity={0.9} />
            <circle cx={CX} cy={CY} r={4}
              fill={COLORS.gold} opacity={hexProgress} />
            {/* Crosshair ticks */}
            {[[CX, CY - 340], [CX, CY + 340], [CX - 340, CY], [CX + 340, CY]].map(([tx, ty], ti) => (
              <circle key={ti} cx={tx} cy={ty} r={6 * hexProgress}
                fill="none" stroke={COLORS.gold} strokeWidth="1.5" opacity={0.6 * hexProgress} />
            ))}
          </g>
        )}

        {/* Tick marks along axes */}
        {tickProgress > 0 && Array.from({ length: 32 }, (_, i) => {
          const x = CX - 1800 + i * 120;
          const visible = remap(tickProgress, i / 32, (i + 1) / 32) > 0.5;
          return visible ? (
            <g key={`tick-x-${i}`}>
              <line x1={x} y1={CY - 16} x2={x} y2={CY + 16}
                stroke={COLORS.gold} strokeWidth="1.5" opacity={0.5} />
            </g>
          ) : null;
        })}

        {/* Measurement label stubs */}
        {tickProgress > 0.5 && [
          { x: CX - 960, y: CY - 60, label: '— 1920' },
          { x: CX + 960, y: CY - 60, label: '1920 —' },
          { x: CX - 60, y: CY - 380, label: '1080' },
        ].map(({ x, y, label }, i) => (
          <text key={i} x={x} y={y}
            fontFamily="'JetBrains Mono', monospace" fontSize="24"
            fill={COLORS.gold} opacity={tickProgress * 0.5}
            textAnchor="middle" letterSpacing="3">
            {label}
          </text>
        ))}

        {/* Animated scan line */}
        <line
          x1={0} y1={CY + Math.sin(frame * 0.02) * 400}
          x2={W} y2={CY + Math.sin(frame * 0.02) * 400}
          stroke={COLORS.gold} strokeWidth="1" opacity={0.08 * gridProgress}
        />
      </g>
    </svg>
  );
};
