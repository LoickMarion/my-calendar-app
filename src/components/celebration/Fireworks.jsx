// components/celebration/Fireworks.jsx
import React from 'react';
import './celebration.css';

const PARTICLES = 40;

export default function Fireworks() {
  const particles = Array.from({ length: PARTICLES }).map((_, i) => {
    const angle = (360 / PARTICLES) * i;
    const radius = 70 + Math.random() * 40;
    const hue = Math.floor(200 + Math.random() * 120);

    return (
      <div
        key={i}
        className="firework-particle"
        style={{
          '--angle': `${angle}deg`,
          '--radius': `${radius}px`,
          '--hue': hue,
        }}
      />
    );
  });

  return (
    <div className="fireworks-container">
      <div className="fireworks-launch" />
      <div className="fireworks-burst">
        {particles}
        <div className="fireworks-ring" />
      </div>
    </div>
  );
}
