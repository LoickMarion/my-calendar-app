// components/celebration/CelebrationSpawner.jsx
import React, { useEffect, useState } from 'react';

import ConfettiBurst from './ConfettiBurst.jsx';
import SparkleGlow from './SparkleGlow.jsx';
import Fireworks from './Fireworks.jsx';
import RibbonBurst from './RibbonBurst.jsx';
import GlowPulse from './GlowPulse.jsx';

export default function CelebrationSpawner({ duration = 10000 }) {
  const [instances, setInstances] = useState([]);

  // Weighted animation selection
  function pickWeightedAnimation() {
    const r = Math.random() * 100;

    if (r < 30) return 'fireworks';   // 30%
    if (r < 55) return 'confetti';    // next 25%
    if (r < 75) return 'sparkle';     // next 20%
    if (r < 90) return 'glow';        // next 15%
    return 'ribbon';                  // last 10%
  }

  useEffect(() => {
    const start = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - start > duration) {
        clearInterval(interval);
        return;
      }

      const id = crypto.randomUUID();

      // Random screen position
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 70 + 15;

      const mode = pickWeightedAnimation();
      const hue = Math.floor(Math.random() * 360);

      // Add instance
      setInstances((prev) => [
        ...prev,
        { id, mode, x, y, hue }
      ]);

      // Remove after animation finishes
      setTimeout(() => {
        setInstances((prev) => prev.filter((i) => i.id !== id));
      }, duration + 2000); // slightly longer than your CSS animations
    }, 200); // spawn rate

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <>
      {instances.map(({ id, mode, x, y, hue }) => {
        const style = {
          position: 'fixed',
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 999999,
          pointerEvents: 'none',
        };

        if (mode === 'confetti') {
          return <div key={id} style={style}><ConfettiBurst /></div>;
        }
        if (mode === 'sparkle') {
          return <div key={id} style={style}><SparkleGlow hue={hue} /></div>;
        }
        if (mode === 'fireworks') {
          return <div key={id} style={style}><Fireworks /></div>;
        }
        if (mode === 'ribbon') {
          return <div key={id} style={style}><RibbonBurst /></div>;
        }
        if (mode === 'glow') {
          return <div key={id} style={style}><GlowPulse hue={hue} /></div>;
        }

        return null;
      })}
    </>
  );
}
