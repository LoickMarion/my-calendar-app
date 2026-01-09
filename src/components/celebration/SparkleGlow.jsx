export default function SparkleGlow({ hue = 50 }) {
  const SPARKLES = 24;

  const sparkles = Array.from({ length: SPARKLES }).map((_, i) => {
    const angle = (360 / SPARKLES) * i + Math.random() * 25 - 12;
    const radius = 40 + Math.random() * 40;

    return (
      <div
        key={i}
        className="sparkle"
        style={{
          '--angle': `${angle}deg`,
          '--radius': `${radius}px`,
          '--sparkle-hue': hue,
        }}
      />
    );
  });

  return <div className="sparkle-container">{sparkles}</div>;
}
