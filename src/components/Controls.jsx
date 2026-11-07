import { GENRE_LIST } from '../lib/genres.js';
import Mark from './Mark.jsx';
import { Readout } from './HintBanner.jsx';

const GRIDS = [
  { id: 'thirds', label: 'Thirds' },
  { id: 'golden', label: 'Golden' },
  { id: 'off', label: 'Off' },
];

// The dot-matrix face draws "." as a tiny cross, so the point is set in the text face.
function EvNumber({ value }) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const [whole, frac] = Math.abs(value).toFixed(1).split('.');
  return (
    <>
      {sign}
      {whole}
      <span className="pt">.</span>
      {frac}
    </>
  );
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function TopBar({ genreId, onGenre, grid, onGrid }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Mark />
        <span className="brand-name">AI Photo Guide</span>
      </div>
      <div className="top-ctl">
        <label className="select">
          <span className="sr-only">Genre</span>
          <select value={genreId} onChange={(e) => onGenre(e.target.value)}>
            {GENRE_LIST.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <div className="seg" role="group" aria-label="Grid">
          {GRIDS.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={grid === g.id}
              className={grid === g.id ? 'on' : ''}
              onClick={() => onGrid(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function ExposureMeter({ exposure, onEv, evDelta }) {
  const { min, max, step, value, mode } = exposure;
  const span = max - min;
  const pos = (v) => ((v - min) / span) * 100;
  const every = span > 8 ? 2 : 1;

  const ticks = [];
  for (let v = Math.ceil(min); v <= max; v++) ticks.push(v);

  const target = evDelta ? clamp(value + evDelta, min, max) : null;

  return (
    <div className="meter">
      <div className="meter-head">
        <label htmlFor="ev">Exposure</label>
        <output className="lcd-num" htmlFor="ev">
          <EvNumber value={value} />
        </output>
      </div>

      <div className="meter-scale">
        {ticks.map((v) => (
          <span key={v} className={`tick ${v === 0 ? 'zero' : ''}`} style={{ left: `${pos(v)}%` }}>
            {v % every === 0 && <em>{v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v)}`}</em>}
          </span>
        ))}
        {target != null && target !== value && (
          <span className="suggest" style={{ left: `${pos(target)}%` }} title="Suggested" />
        )}
        <input
          id="ev"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onEv(parseFloat(e.target.value))}
        />
      </div>

      <p className="meter-note">
        {mode === 'hardware'
          ? 'Adjusts the camera.'
          : 'Adjusts the preview and saved photo. This browser cannot change camera exposure.'}
      </p>
    </div>
  );
}

function Switch({ label, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-track">
        <span className="switch-knob" />
      </span>
      <span>{label}</span>
    </button>
  );
}

const RING = 2 * Math.PI * 36;

export default function Controls({
  guidance,
  autoCapture,
  onAutoCapture,
  autoExposure,
  onAutoExposure,
  exposure,
  onEv,
  evDelta,
  onShutter,
  holdProgress,
  tiltNeedsPermission,
  onEnableTilt,
}) {
  return (
    <div className="deck">
      {tiltNeedsPermission && (
        <div className="notice">
          <span>The level line needs access to motion sensors.</span>
          <button type="button" onClick={onEnableTilt}>
            Allow
          </button>
        </div>
      )}

      <Readout guidance={guidance} />

      <ExposureMeter exposure={exposure} onEv={onEv} evDelta={evDelta} />

      <div className="deck-row">
        <Switch label="Auto-capture" checked={autoCapture} onChange={onAutoCapture} />

        <button type="button" className="shutter" onClick={onShutter} aria-label="Take photo">
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle className="ring-bg" cx="40" cy="40" r="36" />
            <circle
              className="ring"
              cx="40"
              cy="40"
              r="36"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - holdProgress)}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <span className="shutter-core" />
        </button>

        <Switch label="Auto exposure" checked={autoExposure} onChange={onAutoExposure} />
      </div>
    </div>
  );
}
