// components/celebration/GlowPulse.jsx
import React from 'react';
import './celebration.css';

export default function GlowPulse({ hue = 200 }) {
  return (
    <div className="glowpulse-container">
      <div className="glowpulse" style={{ '--pulse-hue': hue }} />
    </div>
  );
}
