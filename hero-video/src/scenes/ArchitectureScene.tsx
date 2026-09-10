import React from 'react';
import { COLORS } from '../utils/colors';
import { seededRandom } from '../utils/geometry';
import { easeOutExpo, easeInOutCubic, remap } from '../utils/easing';

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
  type: 'core' | 'service' | 'data' | 'edge';
  radius: number;
}

interface Edge {
  from: number;
  to: number;
  active: boolean;
}

interface Props {
  frame: number;
  progress: number;
  opacity: number;
}

const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

const LABELS = [
  'API Gateway', 'Auth Service', 'Event Bus', 'PostgreSQL',
  'Redis Cache', 'ML Pipeline', 'Worker Queue', 'WebSocket',
  'Object Store', 'CDN Edge', 'Monitoring', 'Scheduler',
];

const NODES: Node[] = [
  { id: 0, x: CX,        y: CY,        label: 'Platform Core', type: 'core',    radius: 52 },
  { id: 1, x: CX - 600,  y: CY - 320,  label: LABELS[0],       type: 'service', radius: 36 },
  { id: 2, x: CX + 600,  y: CY - 280,  label: LABELS[1],       type: 'service', radius: 36 },
  { id: 3, x: CX - 900,  y: CY + 80,   label: LABELS[2],       type: 'service', radius: 32 },
  { id: 4, x: CX + 860,  y: CY + 120,  label: LABELS[3],       type: 'data',    radius: 32 },
  { id: 5, x: CX - 420,  y: CY + 500,  label: LABELS[4],       type: 'data',    radius: 28 },
  { id: 6, x: CX + 440,  y: CY + 480,  label: LABELS[5],       type: 'service', radius: 34 },
  { id: 7, x: CX - 1100, y: CY - 500,  label: LABELS[6],       type: 'edge',    radius: 26 },
  { id: 8, x: CX + 1100, y: CY - 460,  label: LABELS[7],       type: 'edge',    radius: 26 },
  { id: 9, x: CX,        y: CY - 680,  label: LABELS[8],       type: 'edge',    radius: 28 },
  { id: 10, x: CX - 700, y: CY + 700,  label: LABELS[9],       type: 'edge',    radius: 24 },
  { id: 11, x: CX + 720, y: CY + 680,  label: LABELS[10],      type: 'data',    radius: 26 },
];

const EDGES: Edge[] = [
  { from: 0, to: 1, active: true }, { from: 0, to: 2, active: true },
  { from: 0, to: 3, active: true }, { from: 0, to: 4, active: true },
  { from: 0, to: 5, active: false }, { from: 0, to: 6, active: true },
  { from: 1, to: 7, active: true }, { from: 2, to: 8, active: true },
  { from: 1, to: 9, active: false }, { from: 2, to: 9, active: true },
  { from: 3, to: 7, active: false }, { from: 4, to: 8, active: false },
  { from: 5, to: 10, active: true }, { from: 6, to: 11, active: true },
  { from: 3, to: 5, active: true }, { from: 4, to: 6, active: true },
  { from: 1, to: 3, active: false }, { from: 2, to: 4, active: false },
];

export const ArchitectureScene: React.FC<Props> = ({ frame, progress, opacity }) => {
  const rand = seededRandom(55);
  void rand;

  const nodeAppear = (i: number) => easeOutExpo(remap(progress, i * 0.04, i * 0.04 + 0.15));
  const edgeAppear = (i: number) => easeInOutCubic(remap(progress, 0.2 + i * 0.03, 0.2 + i * 0.03 + 0.2));

  const nodeColor = (type: Node['type']) => {
    switch (type) {
      case 'core':    return COLORS.accent;
      case 'service': return COLORS.platinum;
      case 'data':    return COLORS.fgMid;
      case 'edge':    return COLORS.fgDim;
    }
  };

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="edge-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLORS.goldDim} />
        </marker>
      </defs>

      {/* Edges */}
      {EDGES.map((edge, i) => {
        const p = edgeAppear(i);
        if (p <= 0) return null;
        const n1 = NODES[edge.from];
        const n2 = NODES[edge.to];
        const len = Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2));
        const mx = (n1.x + n2.x) / 2;
        const my = (n1.y + n2.y) / 2;

        // Animated data packet along edge
        const packetT = ((frame * 0.6 + i * 47) % 100) / 100;
        const px = n1.x + (n2.x - n1.x) * packetT;
        const py = n1.y + (n2.y - n1.y) * packetT;

        return (
          <g key={`edge-${i}`}>
            <line
              x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
              stroke={edge.active ? COLORS.goldTrace : COLORS.gridStrong}
              strokeWidth={edge.active ? 2 : 1}
              strokeDasharray={`${len * p} ${len}`}
              opacity={0.7}
              filter={edge.active ? 'url(#edge-glow)' : undefined}
              markerEnd={p > 0.9 && edge.active ? 'url(#arrowhead)' : undefined}
            />
            {/* Data flow label */}
            {p > 0.8 && edge.active && (
              <text x={mx} y={my - 16} textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace" fontSize="18"
                fill={COLORS.gold} opacity={0.4} letterSpacing="1">
                {['HTTP/2', 'gRPC', 'WS', 'TCP', 'UDP'][i % 5]}
              </text>
            )}
            {/* Packet dot */}
            {p > 0.9 && edge.active && (
              <circle cx={px} cy={py} r={5} fill={COLORS.gold} opacity={0.8} />
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {NODES.map((node, i) => {
        const p = nodeAppear(i);
        if (p <= 0) return null;
        const r = node.radius * p;
        const color = nodeColor(node.type);
        const pulseR = r + 12 * (0.5 + 0.5 * Math.sin(frame * 0.05 + i));

        return (
          <g key={`node-${i}`} filter={node.type === 'core' ? 'url(#node-glow)' : undefined}>
            {/* Pulse ring */}
            <circle cx={node.x} cy={node.y} r={pulseR}
              fill="none" stroke={color}
              strokeWidth="1" opacity={0.2 * p} />
            {/* Outer ring */}
            <circle cx={node.x} cy={node.y} r={r + 14}
              fill="none" stroke={color} strokeWidth="1" opacity={0.4 * p} />
            {/* Node body */}
            <circle cx={node.x} cy={node.y} r={r}
              fill={COLORS.bgCard} stroke={color} strokeWidth={node.type === 'core' ? 2.5 : 1.5}
              opacity={p} />
            {/* Center dot */}
            <circle cx={node.x} cy={node.y} r={node.type === 'core' ? 8 : 4}
              fill={color} opacity={p} />
            {/* Label */}
            {p > 0.6 && (
              <text x={node.x} y={node.y + r + 36}
                textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={node.type === 'core' ? 26 : 20}
                fill={color} opacity={p * 0.85}
                letterSpacing="1.5">
                {node.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
