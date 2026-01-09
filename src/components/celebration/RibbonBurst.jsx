// components/celebration/RibbonBurst.jsx
import React from 'react';
import './celebration.css';

const RIBBONS = 18;

export default function RibbonBurst() {
  const ribbons = Array.from({ length: RIBBONS }).map((_, i) => {
    const angle = -60 + (120 / (RIBBONS - 1)) * i + (Math.random() * 20 - 10);
    const hue = Math.floor(200 + Math.random() * 100);

    return (
      <div
        key={i}
        className="ribbon"
        style={{
          '--angle': `${angle}deg`,
          '--hue': hue,
        }}
      />
    );
  });

  return <div className="ribbon-container">{ribbons}</div>;
}
