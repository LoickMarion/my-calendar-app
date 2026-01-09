import React, { useMemo } from 'react';
import { useThemeStore } from '../state/themeStore.jsx';

// Simple deterministic PRNG from a seed
function mulberry32(a) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate positions
function makePositions(seed, count) {
  const rnd = mulberry32(Number(seed) || 1);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: Math.round(rnd() * 10000) / 100,
      y: Math.round(rnd() * 10000) / 100,
      r: Math.round(rnd() * 360),
      s: Math.round(18 + rnd() * 90),
    });
  }
  return out;
}

// SVG shapes
function Shape({ type, x, y, r, s, color, opacity = 0.18, blend = 'multiply' }) {
  const style = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%,-50%) rotate(${r}deg)`,
    width: `${s}px`,
    height: `${s}px`,
    opacity: opacity,
    mixBlendMode: blend,
    filter: 'blur(0.2px)',
    pointerEvents: 'none',
  };

  switch (type) {
    case 'hearts':
      return (
        <svg viewBox="0 0 24 24" style={style} aria-hidden>
          <path fill={color} d="M12 21s-7-4.35-9.33-7.02C-0.13 10.7 3.1 6 8 6c2.2 0 3.78 1.12 4 2 .22-.88 1.8-2 4-2 4.9 0 8.13 4.7 5.33 7.98C19 16.65 12 21 12 21z" />
        </svg>
      );
    case 'circles':
      return (
        <svg viewBox="0 0 24 24" style={style} aria-hidden>
          <circle cx="12" cy="12" r="10" fill={color} />
        </svg>
      );
    case 'stars':
      return (
        <svg viewBox="0 0 24 24" style={style} aria-hidden>
          <path fill={color} d="M12 2l2.9 6.2L21 9.2l-5 3.9L17 21l-5-3.2L7 21l1-7.9L3 9.2l6.1-.98L12 2z" />
        </svg>
      );
    case 'clouds':
      return (
        <svg viewBox="0 0 24 24" style={style} aria-hidden>
          <path fill={color} d="M19 18H6a4 4 0 010-8 5.5 5.5 0 019.9-1.5A3.5 3.5 0 0119 18z" />
        </svg>
      );
    case 'triangles':
      return (
        <svg viewBox="0 0 24 24" style={style} aria-hidden>
          <path fill={color} d="M12 4l8 14H4l8-14z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" style={style} aria-hidden>
          <path fill={color} d="M12 2l1.8 4.1L18 8l-4.2 1.9L12 14l-1.8-4.1L6 8l4.2-1.9L12 2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BackgroundShapes() {
  const { theme } = useThemeStore();

  const seed = theme['shapes-seed'] || '1';
  const onTop = theme['shapes-on-top'] === 'true' || theme['shapes-on-top'] === true;

  const shapes = ['hearts', 'circles', 'stars', 'clouds', 'triangles', 'sparkles'].filter(
    (s) => theme[`shape-${s}-enabled`] === 'true' || theme[`shape-${s}-enabled`] === true
  );

  const layout = useMemo(() => {
    const out = {};
    shapes.forEach((s, idx) => {
      const count = Math.max(0, Math.floor(Number(theme[`shape-${s}-density`]) || 18));
      const positions = makePositions(Number(seed) + idx * 1009, count);
      const opacity = Number(theme[`shape-${s}-opacity`] || 0.18);
      const sizeMul = Number(theme[`shape-${s}-size`] || 1.0);

      out[s] = positions.map((p) => ({
        ...p,
        opacity,
        sizeMul,
      }));
    });
    return out;
  }, [shapes.join(','), theme, seed]);

  if (shapes.length === 0) return null;

  return (
    <div className="background-shapes" aria-hidden>
      {shapes.map((type) =>
        layout[type].map((p, i) => (
          <Shape
            key={`${type}-${i}`}
            type={type}
            x={p.x}
            y={p.y}
            r={p.r}
            s={Math.max(6, Math.round(p.s * p.sizeMul))}
            color={theme[`shape-${type}-color`] || '#cbd5e1'}
            opacity={p.opacity}
            blend={onTop ? 'normal' : 'multiply'}
          />
        ))
      )}

      <style>{`
        .background-shapes { position: fixed; inset: 0; z-index: ${onTop ? 9999 : 0}; pointer-events: none; }
        .app-shell { position: relative; z-index: 1; }
      `}</style>
    </div>
  );
}
