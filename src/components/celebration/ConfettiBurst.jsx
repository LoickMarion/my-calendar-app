// components/celebration/ConfettiBurst.jsx
import React from 'react';
import './celebration.css';

const PARTICLES = 60;

export default function ConfettiBurst() {
  const pieces = Array.from({ length: PARTICLES }).map((_, i) => {
    const angle = (360 / PARTICLES) * i + Math.random() * 20 - 10;
    const distance = 140 + Math.random() * 80;
    const hue = Math.floor(Math.random() * 360);

    return (
      <div
        key={i}
        className="confetti-piece"
        style={{
          '--angle': `${angle}deg`,
          '--distance': `${distance}px`,
          '--hue': hue,
        }}
      />
    );
  });

  return <div className="confetti-container">{pieces}</div>;
}
