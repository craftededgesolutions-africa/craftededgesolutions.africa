import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from './utils/colors';
import { remap, easeInOutCubic, easeOutExpo } from './utils/easing';
import { BlueprintScene } from './scenes/BlueprintScene';
import { ArchitectureScene } from './scenes/ArchitectureScene';
import { IntelligenceScene } from './scenes/IntelligenceScene';
import { OrchestrationScene } from './scenes/OrchestrationScene';
import { SovereigntyScene } from './scenes/SovereigntyScene';
import { ParticleSystem } from './components/ParticleSystem';
import { VolumetricLight } from './components/VolumetricLight';
import { NoiseOverlay } from './components/NoiseOverlay';

// Scene timing (frames at 60fps, total 1500 = 25s)
const SCENES = {
  blueprint:    { start: 0,    end: 480 },   // 0–8s
  architecture: { start: 320,  end: 780 },   // 5.3–13s
  intelligence: { start: 620,  end: 1020 },  // 10.3–17s
  orchestration:{ start: 860,  end: 1260 },  // 14.3–21s
  sovereignty:  { start: 1100, end: 1500 },  // 18.3–25s (loops back)
};

const sceneOpacity = (frame: number, start: number, end: number, fadeIn = 80, fadeOut = 100): number => {
  if (frame < start || frame > end) return 0;
  const fadeInVal = easeInOutCubic(Math.min(1, (frame - start) / fadeIn));
  const fadeOutVal = easeInOutCubic(Math.min(1, (end - frame) / fadeOut));
  return Math.min(fadeInVal, fadeOutVal);
};

const sceneProgress = (frame: number, start: number, end: number): number =>
  remap(frame, start, end);

export const CESHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  void durationInFrames;

  const bpOpacity   = sceneOpacity(frame, SCENES.blueprint.start,     SCENES.blueprint.end,     60, 120);
  const archOpacity = sceneOpacity(frame, SCENES.architecture.start,   SCENES.architecture.end,  80, 100);
  const intOpacity  = sceneOpacity(frame, SCENES.intelligence.start,   SCENES.intelligence.end,  80, 100);
  const orchOpacity = sceneOpacity(frame, SCENES.orchestration.start,  SCENES.orchestration.end, 80, 100);
  const sovOpacity  = sceneOpacity(frame, SCENES.sovereignty.start,    SCENES.sovereignty.end,   80, 60);

  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: 'hidden' }}>

      {/* Volumetric lighting layer — always present */}
      <VolumetricLight frame={frame} opacity={0.8} />

      {/* Persistent particle field */}
      <ParticleSystem
        frame={frame} count={80}
        width={3840} height={2160}
        color={COLORS.accent} opacity={0.35}
      />
      <ParticleSystem
        frame={frame + 37} count={40}
        width={3840} height={2160}
        color={COLORS.platinum} opacity={0.15}
      />

      {/* Scene layers — overlapping for smooth crossfade */}
      {bpOpacity > 0 && (
        <BlueprintScene
          frame={frame}
          progress={sceneProgress(frame, SCENES.blueprint.start, SCENES.blueprint.end)}
          opacity={bpOpacity}
        />
      )}

      {archOpacity > 0 && (
        <ArchitectureScene
          frame={frame}
          progress={sceneProgress(frame, SCENES.architecture.start, SCENES.architecture.end)}
          opacity={archOpacity}
        />
      )}

      {intOpacity > 0 && (
        <IntelligenceScene
          frame={frame}
          progress={sceneProgress(frame, SCENES.intelligence.start, SCENES.intelligence.end)}
          opacity={intOpacity}
        />
      )}

      {orchOpacity > 0 && (
        <OrchestrationScene
          frame={frame}
          progress={sceneProgress(frame, SCENES.orchestration.start, SCENES.orchestration.end)}
          opacity={orchOpacity}
        />
      )}

      {sovOpacity > 0 && (
        <SovereigntyScene
          frame={frame}
          progress={sceneProgress(frame, SCENES.sovereignty.start, SCENES.sovereignty.end)}
          opacity={sovOpacity}
        />
      )}

      {/* Film grain noise — top layer */}
      <NoiseOverlay frame={frame} opacity={0.035} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, ${COLORS.bg}cc 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Global motion blur simulation via subtle duplicate frame overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `${COLORS.bg}08`,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
