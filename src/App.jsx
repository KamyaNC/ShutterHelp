import { useCallback, useEffect, useRef, useState } from 'react';
import { useCamera } from './hooks/useCamera.js';
import { useDeviceTilt } from './hooks/useDeviceTilt.js';
import { useAutoCapture } from './hooks/useAutoCapture.js';
import { analyzeFrame } from './lib/analyze.js';
import { evaluate } from './lib/guidance.js';
import { captureFrame } from './lib/capture.js';
import { GENRES } from './lib/genres.js';
import Intro from './components/Intro.jsx';
import GridOverlay from './components/GridOverlay.jsx';
import HintBanner from './components/HintBanner.jsx';
import Controls, { TopBar } from './components/Controls.jsx';
import Gallery from './components/Gallery.jsx';

const ANALYSIS_WIDTH = 128; // frames are downscaled to this width for analysis
const ANALYSIS_INTERVAL_MS = 100; // ~10 analyses per second
const MAX_SHOTS = 12;

export default function App() {
  const camera = useCamera();
  const { tilt, needsPermission, requestPermission } = useDeviceTilt();

  const [genreId, setGenreId] = useState('sunset');
  const [grid, setGrid] = useState('thirds');
  const [autoCapture, setAutoCapture] = useState(false);
  const [autoExposure, setAutoExposure] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [shots, setShots] = useState([]);
  const [flash, setFlash] = useState(false);

  const genre = GENRES[genreId];
  const live = camera.status === 'live';

  // The analysis loop reads these through a ref so it never needs to restart.
  const latest = useRef({});
  latest.current = { tilt, genre, gain: camera.softGain, score: guidance?.score ?? 0 };

  // Analysis loop: downscale the live frame, measure it, score it.
  useEffect(() => {
    if (!live) return undefined;
    const video = camera.videoRef.current;
    const w = ANALYSIS_WIDTH;
    const h = Math.max(1, Math.round((w * (video.videoHeight || 9)) / (video.videoWidth || 16)));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let raf;
    let last = 0;
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (t - last < ANALYSIS_INTERVAL_MS || video.readyState < 2) return;
      last = t;
      ctx.drawImage(video, 0, 0, w, h);
      const result = analyzeFrame(ctx.getImageData(0, 0, w, h), { gain: latest.current.gain });
      setAnalysis(result);
      setGuidance(
        evaluate({ analysis: result, tilt: latest.current.tilt, genre: latest.current.genre }),
      );
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, camera.videoRef]);

  // Auto exposure: nudge EV one step at a time so the camera can settle between moves.
  const lastAdjust = useRef(0);
  const { exposure, setEv } = camera;
  useEffect(() => {
    if (!autoExposure || !guidance || guidance.evDelta === 0) return;
    const now = performance.now();
    if (now - lastAdjust.current < 800) return;
    lastAdjust.current = now;
    setEv(exposure.value + Math.sign(guidance.evDelta) * exposure.step);
  }, [guidance, autoExposure]); // eslint-disable-line react-hooks/exhaustive-deps

  const takePhoto = useCallback(async () => {
    const video = camera.videoRef.current;
    if (!video || video.readyState < 2) return;
    try {
      const blob = await captureFrame(video, { gain: latest.current.gain });
      const shot = {
        id: Date.now(),
        url: URL.createObjectURL(blob),
        score: latest.current.score,
      };
      setShots((prev) => {
        const next = [shot, ...prev];
        next.slice(MAX_SHOTS).forEach((s) => URL.revokeObjectURL(s.url));
        return next.slice(0, MAX_SHOTS);
      });
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    } catch {
      /* capture failed; the next shutter press will try again */
    }
  }, [camera.videoRef]);

  const holdProgress = useAutoCapture({
    score: guidance?.score,
    enabled: autoCapture && live,
    onCapture: takePhoto,
  });

  const ratio = camera.size.width / camera.size.height;

  return (
    <>
      {!live && <Intro onStart={camera.start} status={camera.status} error={camera.error} />}

      {/* The camera UI stays mounted (hidden) before the camera starts, because the
          <video> element must exist when the stream is attached. */}
      <div className="cam" hidden={!live}>
        <TopBar genreId={genreId} onGenre={setGenreId} grid={grid} onGrid={setGrid} />

        <div className="stage-wrap">
          <div className="stage" style={{ '--ratio': ratio }}>
            <video
              ref={camera.videoRef}
              playsInline
              muted
              autoPlay
              style={
                exposure.mode === 'software'
                  ? { filter: `brightness(${camera.softGain})` }
                  : undefined
              }
            />
            {live && <GridOverlay grid={grid} genre={genre} analysis={analysis} tilt={tilt} />}
            {live && <HintBanner guidance={guidance} />}
            {flash && <div className="flash" />}
          </div>
        </div>

        <Controls
          guidance={guidance}
          autoCapture={autoCapture}
          onAutoCapture={setAutoCapture}
          autoExposure={autoExposure}
          onAutoExposure={setAutoExposure}
          exposure={exposure}
          onEv={setEv}
          evDelta={guidance?.evDelta ?? 0}
          onShutter={takePhoto}
          holdProgress={holdProgress}
          tiltNeedsPermission={needsPermission}
          onEnableTilt={requestPermission}
        />

        <Gallery shots={shots} />
      </div>
    </>
  );
}
