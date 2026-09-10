import React from 'react';
import { COLORS } from '../utils/colors';
import { seededRandom, polygonPoints, polygonPath } from '../utils/geometry';
import { remap, easeInOutCubic, easeOutExpo, breathe } from '../utils/easing';

interface Props {
  frame: number;
  progress: number;
  opacity: number;
}

const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

const PIPELINE_STAGES = ['Ingest', 'Transform', 'Validate', 'Enrich', 'Route', 'Persist', 'Notify', 'Archive'];
const INFRA_LABELS = ['3 Regions', '99.99% SLA', '< 12ms p99', 'Auto-scale', 'Zero downtime', 'Encrypted'];

export const OrchestrationScene: React.FC<Props> = ({ frame, progress, opacity }) => {
  const rand = seededRandom(77);
  void rand;

  const pipelineProgress = easeOutExpo(remap(progress, 0, 0.6));
  const networkProgress = easeInOutCubic(remap(progress, 0.3, 0.9));
  const metricsProgress = remap(progress, 0.5, 1.0);

  // Orbital ring system
  const rings = [
    { r: 420, nodes: 6, speed: 0.003 },
    { r: 680, nodes: 9, speed: -0.002 },
    { r: 920, nodes: 12, speed: 0.0015 },
  ];

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="orch-glow">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="orch-glow-sm">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.15" />
          <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Orbital rings */}
      {rings.map((ring, ri) => {
        const p = easeOutExpo(remap(networkProgress, ri * 0.15, ri * 0.15 + 0.5));
        if (p <= 0) return null;
        const rotation = frame * ring.speed;
        const pts = polygonPoints(CX, CY, ring.r, ring.nodes, rotation);

        return (
          <g key={ri}>
            {/* Ring track */}
            <circle cx={CX} cy={CY} r={ring.r}
              fill="none" stroke={COLORS.gridStrong} strokeWidth="1"
              strokeDasharray={`${2 * Math.PI * ring.r * p} ${2 * Math.PI * ring.r}`}
              opacity={0.5} />
            {/* Ring nodes */}
            {pts.map((pt, pi) => {
              const pulse = breathe(frame / 80 + ri * 0.4 + pi * 0.8);
              return (
                <g key={pi}>
                  <circle cx={pt.x} cy={pt.y} r={18 + pulse * 6}
                    fill="none" stroke={ri === 0 ? COLORS.gold : COLORS.platinumDim}
                    strokeWidth="1" opacity={0.3 * p} />
                  <circle cx={pt.x} cy={pt.y} r={10}
                    fill={COLORS.bgCard}
                    stroke={ri === 0 ? COLORS.gold : COLORS.platinumDim}
                    strokeWidth="1.5" opacity={0.9 * p} />
                  <circle cx={pt.x} cy={pt.y} r={3}
                    fill={ri === 0 ? COLORS.gold : COLORS.platinum}
                    opacity={p} />
                  {/* Connection to center */}
                  <line x1={CX} y1={CY} x2={pt.x} y2={pt.y}
                    stroke={COLORS.goldTrace} strokeWidth="0.8" opacity={0.2 * p} />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Central core glow */}
      {networkProgress > 0 && (
        <g filter="url(#orch-glow)">
          <circle cx={CX} cy={CY} r={200}
            fill="url(#core-grad)" opacity={networkProgress} />
          <circle cx={CX} cy={CY} r={80}
            fill="none" stroke={COLORS.accent} strokeWidth="2"
            opacity={0.6 * networkProgress} />
          <circle cx={CX} cy={CY} r={32}
            fill={COLORS.bgCard} stroke={COLORS.accent} strokeWidth="3"
            opacity={networkProgress} />
          <circle cx={CX} cy={CY} r={10}
            fill={COLORS.accent} opacity={networkProgress} />
        </g>
      )}

      {/* Data pipeline — horizontal */}
      {pipelineProgress > 0 && (
        <g>
          <rect x={CX - 1400} y={H - 380} width={2800} height={80} rx={6}
            fill={COLORS.bgElev} stroke={COLORS.gridStrong} strokeWidth="1"
            opacity={pipelineProgress * 0.8} />
          {PIPELINE_STAGES.map((stage, i) => {
            const stageP = easeOutExpo(remap(pipelineProgress, i / PIPELINE_STAGES.length, (i + 1.5) / PIPELINE_STAGES.length));
            const x = CX - 1300 + i * 380;
            const active = ((frame / 18 | 0) % PIPELINE_STAGES.length) === i;
            return (
              <g key={i}>
                {/* Connector line */}
                {i > 0 && (
                  <line x1={x - 290} y1={H - 340} x2={x - 40} y2={H - 340}
                    stroke={active ? COLORS.gold : COLORS.fgDim}
                    strokeWidth={active ? 2 : 1}
                    strokeDasharray={active ? '8 4' : undefined}
                    opacity={stageP * 0.6} />
                )}
                <rect x={x - 40} y={H - 370} width={80} height={60} rx={4}
                  fill={active ? COLORS.accentSoft : COLORS.bgCard}
                  stroke={active ? COLORS.accent : COLORS.platinumDim}
                  strokeWidth={active ? 2 : 1}
                  opacity={stageP} />
                <text x={x} y={H - 294}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace" fontSize="22"
                  fill={active ? COLORS.accent : COLORS.fgMid}
                  letterSpacing="1" opacity={stageP * 0.9}>
                  {stage}
                </text>
                {active && (
                  <circle cx={x} cy={H - 340} r={5}
                    fill={COLORS.accent} opacity={0.9}
                    filter="url(#orch-glow-sm)" />
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* Metrics strip — top */}
      {metricsProgress > 0 && (
        <g>
          {INFRA_LABELS.map((label, i) => {
            const p = easeOutExpo(remap(metricsProgress, i * 0.08, i * 0.08 + 0.3));
            const x = 340 + i * 520;
            return (
              <g key={i}>
                <rect x={x - 180} y={60} width={360} height={80} rx={4}
                  fill={COLORS.bgCard} stroke={COLORS.gridStrong} strokeWidth="1"
                  opacity={p * 0.9} />
                <text x={x} y={110}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace" fontSize="26"
                  fill={i % 2 === 0 ? COLORS.accent : COLORS.platinum}
                  letterSpacing="2" opacity={p}>
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Network effect lines — background */}
      {networkProgress > 0.3 && Array.from({ length: 30 }, (_, i) => {
        const r = seededRandom(i * 13 + 3);
        const x1 = r() * W;
        const y1 = r() * H;
        const x2 = r() * W;
        const y2 = r() * H;
        const p = remap(networkProgress, 0.3 + i * 0.01, 0.3 + i * 0.01 + 0.3);
        if (p <= 0) return null;
        const len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return (
          <line key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={COLORS.gridLine} strokeWidth="0.8"
            strokeDasharray={`${len * p} ${len}`}
            opacity={0.4} />
        );
      })}
    </svg>
  );
};
