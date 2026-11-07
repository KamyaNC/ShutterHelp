// Guidance drawn like a real viewfinder: an arrow on the edge of the frame that points
// the way to move, and a readout strip along the bottom with a lamp and score ticks.

const ROTATIONS = { right: 0, down: 90, left: 180, up: 270 };

function EdgeArrow({ direction }) {
  return (
    <div className={`edge edge-${direction}`} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="44"
        height="44"
        style={{ transform: `rotate(${ROTATIONS[direction]}deg)` }}
      >
        <path d="M8 3l9 9-9 9" />
      </svg>
    </div>
  );
}

function TurnArrow({ direction }) {
  return (
    <div className={`turn turn-${direction}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="56" height="56">
        <path d="M10 28a15 15 0 1 0 6-13" />
        <path d="M8 8l8 7-9 4" />
      </svg>
    </div>
  );
}

// Arrows drawn on the camera view.
export default function HintBanner({ guidance }) {
  if (!guidance) return null;
  const { primary } = guidance;
  return (
    <>
      {['left', 'right', 'up', 'down'].includes(primary.direction) && (
        <EdgeArrow direction={primary.direction} />
      )}
      {(primary.direction === 'cw' || primary.direction === 'ccw') && (
        <TurnArrow direction={primary.direction} />
      )}
    </>
  );
}

// Text hint, lamp and score. Lives in the control deck so it never covers the scene.
export function Readout({ guidance }) {
  const primary = guidance?.primary ?? { direction: 'wait', text: 'Point the camera at the sky' };
  const score = guidance?.score ?? 0;
  const ok = primary.direction === 'ok';
  const lit = Math.round(score * 10);

  return (
    <div className={`lcd ${ok ? 'lcd-ok' : ''}`}>
      <div className="lcd-main">
        <span className="lamp" aria-hidden="true" />
        <span className="lcd-text" role="status" aria-live="polite">
          {primary.text}
        </span>
        <span className="lcd-score" aria-hidden="true">
          {Math.round(score * 100)}
        </span>
      </div>
      <div className="ticks" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={i < lit ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}
