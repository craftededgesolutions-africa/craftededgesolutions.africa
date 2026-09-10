import React from 'react';
import { Composition } from 'remotion';
import { CESHero } from './CESHero';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CESHero"
      component={CESHero}
      durationInFrames={1500}
      fps={60}
      width={3840}
      height={2160}
    />
    {/* 1080p preview version */}
    <Composition
      id="CESHeroPreview"
      component={CESHero}
      durationInFrames={1500}
      fps={60}
      width={1920}
      height={1080}
    />
  </>
);
