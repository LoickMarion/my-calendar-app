// components/celebration/CelebrationPreview.jsx
import React from 'react';

import ConfettiBurst from './ConfettiBurst.jsx';
import SparkleGlow from './SparkleGlow.jsx';
import Fireworks from './Fireworks.jsx';
import RibbonBurst from './RibbonBurst.jsx';
import GlowPulse from './GlowPulse.jsx';
import CelebrationSpawner from './CelebrationSpawner.jsx';

export default function CelebrationPreview({ mode }) {
  if (mode === 'confetti') return <ConfettiBurst />;
  if (mode === 'sparkle') return <SparkleGlow />;
  if (mode === 'fireworks') return <Fireworks />;
  if (mode === 'ribbon') return <RibbonBurst />;
  if (mode === 'glow') return <GlowPulse />;
  if (mode === 'party') return <CelebrationSpawner />;

  return null;
}
