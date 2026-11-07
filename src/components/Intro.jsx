import Mark from './Mark.jsx';

// The one animated moment on the start screen: a tiny viewfinder that shows what the
// app does. The sun starts right of the third line, the hint says "Pan camera right",
// the sun settles on the line, the lamp turns teal, then the camera drifts and it repeats.
function Demo() {
  return (
    <div className="demo">
      <svg viewBox="0 0 400 356" role="img" aria-label="Animated example: the sun drifts onto the right third line and the hint changes from Pan camera right to Hold steady.">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#262C7A" />
            <stop offset="0.45" stopColor="#8A3F98" />
            <stop offset="0.8" stopColor="#F2637C" />
            <stop offset="1" stopColor="#FFB45C" />
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3A2F6E" />
            <stop offset="1" stopColor="#141836" />
          </linearGradient>
          <radialGradient id="glow">
            <stop offset="0" stopColor="#FFE3A0" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFE3A0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFC66B" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FFC66B" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="400" height="200" fill="url(#sky)" />
        <rect y="200" width="400" height="100" fill="url(#sea)" />

        <g className="demo-sun">
          <rect x="-5" y="200" width="10" height="84" fill="url(#reflect)" />
          <circle cx="0" cy="184" r="46" fill="url(#glow)" />
          <circle cx="0" cy="184" r="15" fill="#FFF1C8" />
        </g>

        <g className="demo-grid">
          <line x1="133.3" y1="0" x2="133.3" y2="300" />
          <line x1="266.7" y1="0" x2="266.7" y2="300" />
          <line x1="0" y1="100" x2="400" y2="100" />
          <line x1="0" y1="200" x2="400" y2="200" />
        </g>
        <line className="demo-target" x1="266.7" y1="0" x2="266.7" y2="300" />

        <g className="demo-corners">
          <path d="M16 36V16h20M364 16h20v20M384 264v20h-20M36 284H16v-20" />
        </g>

        <g className="demo-arrow">
          <path d="M360 132l18 18-18 18" />
        </g>

        <rect y="300" width="400" height="56" className="demo-lcd" />
        <circle cx="24" cy="328" r="5" className="demo-lamp demo-lamp-off" />
        <circle cx="24" cy="328" r="5" className="demo-lamp demo-lamp-on" />
        <text x="42" y="334" className="demo-text demo-text-a">Pan camera right</text>
        <text x="42" y="334" className="demo-text demo-text-b">Looks good. Hold steady</text>
      </svg>
    </div>
  );
}

export default function Intro({ onStart, status, error }) {
  return (
    <main className="intro">
      <header className="brand">
        <Mark />
        <span>AI Photo Guide</span>
      </header>

      <div className="intro-grid">
        <div className="intro-copy">
          <h1>Line up the shot before the light goes.</h1>
          <p className="lede">
            Open your camera and get live arrows for tilt, horizon, sun position and exposure.
            It all runs in your browser, so no photo leaves your phone.
          </p>
          <button
            type="button"
            className="btn-start"
            onClick={onStart}
            disabled={status === 'starting'}
          >
            {status === 'starting' ? 'Opening camera…' : 'Open camera'}
          </button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <p className="fine">Sunset and landscape for now. Works best on a phone.</p>
        </div>

        <Demo />
      </div>
    </main>
  );
}
