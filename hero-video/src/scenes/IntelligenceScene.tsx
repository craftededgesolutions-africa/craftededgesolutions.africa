import React from 'react';
import { COLORS } from '../utils/colors';
import { remap, easeOutExpo, breathe } from '../utils/easing';

interface Props {
  frame: number;
  progress: number;
  opacity: number;
}

const W = 3840;
const H = 2160;

const CODE_FRAGMENTS = [
  'await orchestrator.dispatch(event)',
  'pipeline.transform(data, schema)',
  'agent.reason(context, tools)',
  'graph.traverse(topology)',
  'inference.run(model, input)',
  'stream.emit(EventType.COMPLETE)',
  'session.authorize(scope)',
  'cache.invalidate(pattern)',
  'worker.queue(task, priority)',
  'monitor.observe(metric)',
  'db.transaction(async tx => {',
  'router.handle(req, middleware)',
  'compiler.emit(ast, target)',
  'scheduler.cron(expression)',
  'webhook.verify(signature)',
];

const EVENT_TYPES = [
  'USER_ACTION', 'PAYMENT_COMPLETED', 'AGENT_RESPONSE',
  'PIPELINE_STAGE', 'CACHE_MISS', 'AUTH_TOKEN',
  'WORKER_DONE', 'METRIC_FLUSH', 'SCHEMA_VALID',
];

interface StreamEvent {
  id: number;
  x: number;
  type: string;
  speed: number;
  opacity: number;
  color: string;
}

export const IntelligenceScene: React.FC<Props> = ({ frame, progress, opacity }) => {
  const streamEvents: StreamEvent[] = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 200 + (i % 9) * 380,
    type: EVENT_TYPES[i % EVENT_TYPES.length],
    speed: 1.2 + (i % 4) * 0.4,
    opacity: 0.4 + (i % 3) * 0.2,
    color: i % 3 === 0 ? COLORS.accent : i % 3 === 1 ? COLORS.platinum : COLORS.fgDim,
  }));

  const codeProgress = easeOutExpo(remap(progress, 0, 0.5));
  const streamProgress = remap(progress, 0.2, 0.7);

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="code-glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="stream-fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="20%" stopColor="white" stopOpacity="1" />
          <stop offset="80%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="stream-mask">
          <rect width={W} height={H} fill="url(#stream-fade)" />
        </mask>
      </defs>

      {/* Event stream columns */}
      {streamProgress > 0 && (
        <g mask="url(#stream-mask)">
          {streamEvents.map((ev) => {
            const yOffset = ((frame * ev.speed * 28) % H);
            return (
              <g key={ev.id}>
                {Array.from({ length: 8 }, (_, row) => {
                  const y = (row * 240 + yOffset) % H;
                  const pulse = breathe(frame / 60 + ev.id * 0.3);
                  return (
                    <g key={row}>
                      {/* Event badge */}
                      <rect
                        x={ev.x - 120} y={y - 22}
                        width={240} height={40} rx={4}
                        fill={COLORS.bgCard}
                        stroke={ev.color} strokeWidth="1"
                        opacity={ev.opacity * streamProgress * (0.6 + pulse * 0.3)}
                      />
                      <text x={ev.x} y={y + 4}
                        textAnchor="middle"
                        fontFamily="'JetBrains Mono', monospace"
                        fontSize="17" letterSpacing="1.5"
                        fill={ev.color}
                        opacity={ev.opacity * streamProgress}>
                        {ev.type}
                      </text>
                    </g>
                  );
                })}
                {/* Vertical stream line */}
                <line
                  x1={ev.x} y1={0} x2={ev.x} y2={H}
                  stroke={ev.color} strokeWidth="1"
                  opacity={0.1 * streamProgress}
                />
              </g>
            );
          })}
        </g>
      )}

      {/* Code fragments — left panel */}
      {codeProgress > 0 && CODE_FRAGMENTS.slice(0, 10).map((fragment, i) => {
        const lineProgress = easeOutExpo(remap(codeProgress, i * 0.06, i * 0.06 + 0.2));
        if (lineProgress <= 0) return null;
        const y = 400 + i * 100;
        const typeLength = Math.floor(fragment.length * lineProgress);
        const displayText = fragment.slice(0, typeLength);
        const showCursor = lineProgress < 0.99 && typeLength < fragment.length;

        return (
          <g key={i} filter="url(#code-glow)">
            <rect x={60} y={y - 32} width={W * 0.38} height={54} rx={3}
              fill={COLORS.bgCard} opacity={0.6 * lineProgress} />
            <text x={90} y={y + 6}
              fontFamily="'JetBrains Mono', monospace"
              fontSize="28" letterSpacing="0.5"
              fill={i % 4 === 0 ? COLORS.accent : i % 4 === 1 ? COLORS.platinum : COLORS.fgMid}
              opacity={lineProgress}>
              {displayText}{showCursor ? '▎' : ''}
            </text>
            {/* Line number */}
            <text x={32} y={y + 6}
              fontFamily="'JetBrains Mono', monospace"
              fontSize="22"
              fill={COLORS.fgDim}
              opacity={lineProgress * 0.5}
              textAnchor="middle">
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}

      {/* Neural-style connection lines (right side) */}
      {progress > 0.4 && Array.from({ length: 24 }, (_, i) => {
        const t = remap(progress, 0.4 + i * 0.01, 0.4 + i * 0.01 + 0.3);
        if (t <= 0) return null;
        const x1 = W * 0.62 + Math.sin(i * 1.3) * 280;
        const y1 = 200 + i * 80;
        const x2 = W * 0.78 + Math.cos(i * 0.9) * 240;
        const y2 = 160 + (i + 4) % 24 * 80;
        const pulse = breathe(frame / 120 + i * 0.2);
        const len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        return (
          <line key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i % 3 === 0 ? COLORS.gold : COLORS.platinumDim}
            strokeWidth={1 + pulse * 0.5}
            strokeDasharray={`${len * t} ${len}`}
            opacity={0.3 + pulse * 0.2}
          />
        );
      })}
    </svg>
  );
};
