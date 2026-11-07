import { MIN_HORIZON_CONFIDENCE } from '../lib/guidance.js';

const GRID_LINES = {
  thirds: [100 / 3, (100 * 2) / 3],
  golden: [38.2, 61.8],
};

const pct = (v) => `${(v * 100).toFixed(2)}%`;

export default function GridOverlay({ grid, genre, analysis, tilt }) {
  const lines = GRID_LINES[grid];
  const horizonFound = analysis && analysis.horizon.confidence >= MIN_HORIZON_CONFIDENCE;
  const sunFound = analysis?.sun.found && genre.sunTargets;
  const level = tilt != null && Math.abs(tilt) <= 1.5;

  return (
    <div className="overlay" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {lines &&
          lines.flatMap((p) => [
            <line key={`v${p}`} x1={p} y1="0" x2={p} y2="100" className="grid-line" />,
            <line key={`h${p}`} x1="0" y1={p} x2="100" y2={p} className="grid-line" />,
          ])}
        {genre.horizonTargets.map((t) => (
          <line
            key={`ht${t}`}
            x1="0"
            y1={t * 100}
            x2="100"
            y2={t * 100}
            className="target-line"
          />
        ))}
        {horizonFound && (
          <line
            x1="0"
            y1={analysis.horizon.y * 100}
            x2="100"
            y2={analysis.horizon.y * 100}
            className="detected-line"
          />
        )}
      </svg>

      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />

      {sunFound && (
        <div
          className="sun-marker"
          style={{ left: pct(analysis.sun.x), top: pct(analysis.sun.y) }}
        />
      )}

      {tilt != null && (
        <div className={`level ${level ? 'level-ok' : ''}`}>
          <span className="level-label">
            {tilt > 0 ? '+' : ''}
            {tilt.toFixed(1)}°
          </span>
          <div className="level-line" style={{ transform: `rotate(${-tilt}deg)` }} />
        </div>
      )}
    </div>
  );
}
