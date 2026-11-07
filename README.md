# AI Photo Clicking Guide

A camera website that coaches you while you frame a shot. It overlays a grid, shows a level line, tells you which way to move ("pan left", "tilt up", "decrease exposure") and can auto-capture when the composition is good. Everything runs in the browser, so there is no upload and no lag.

**v0.1 genres:** Sunset / Sunrise and Landscape.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173 (camera works on localhost)
npm run dev:https    # self-signed HTTPS so you can test on a phone over your LAN
npm test             # unit tests for the analysis + guidance engine
npm run build        # production build in dist/
```

Phones only allow camera access on HTTPS. Easiest phone test: deploy to Netlify and open the URL, or use `npm run dev:https` and accept the certificate warning.

## How it works

```
camera <video> ──► downscale to 128 px ──► analyzeFrame()  ──► evaluate()  ──► hints + score
                                           horizon, sun,        rules per       │
device orientation (roll) ─────────────────► histogram           genre profile   ├─► arrow banner
                                                                                 ├─► auto exposure
                                                                                 └─► auto-capture (score held ≥ 0.85 for 0.7 s)
```

| File | Role |
| --- | --- |
| `src/lib/analyze.js` | Histogram, clipping, sun centroid, horizon row. Pure functions. |
| `src/lib/genres.js` | Per-genre targets and weights. Add a genre here. |
| `src/lib/guidance.js` | Rule engine: tilt → horizon → sun → exposure, plus a 0–1 score. |
| `src/hooks/useCamera.js` | `getUserMedia` and exposure control (hardware or software). |
| `src/hooks/useDeviceTilt.js` | Roll angle from the orientation sensor (iOS permission handled). |
| `src/hooks/useAutoCapture.js` | Fires the shutter when the score holds. |
| `src/components/` | Grid overlay, hint banner, controls, gallery. |

Hints follow what the photographer should do: if the sun sits right of its third line, the hint is "pan camera right"; if the horizon is above its target line, the hint is "tilt camera up".

## Deploy

**Frontend (Netlify):** connect the repo. `netlify.toml` already sets build command `npm run build`, publish dir `dist`, and a `Permissions-Policy` header that allows the camera and motion sensors.

**Backend (Render):** not needed in v0.1. Add one later for saving photos, collecting "was this hint helpful?" feedback, or serving model versions. Keep inference in the browser.

## Known limits

- **Exposure:** the browser `exposureCompensation` control exists only on Chrome for Android. Elsewhere the EV slider is a software gain applied to the preview and to the saved photo (the UI labels it "preview"). Auto ISO and shutter speed would also need manual exposure mode and are not built.
- **Tilt sensor:** portrait signs are implemented from the spec; landscape signs are a guess. Both need checking on a real phone. Desktops have no sensor, so the level line and tilt rule switch off.
- **Detection is heuristic:** the sun is the centroid of near-white pixels and the horizon is the strongest brightness edge between rows. Hazy scenes, mountains and reflections on water can fool it. That is what the ML phase replaces.
- No tests exist for the React layer or on-device behaviour yet, only for `src/lib`.

## Roadmap

1. **Now:** rule-based coach, grid, level, auto-capture (this repo).
2. **Aesthetic scorer:** a NIMA-style CNN (MobileNetV3 backbone, trained on AVA) in TF.js; blend with the rule score and use it for auto-capture. See `ml/README.md`.
3. **Better detection:** replace the heuristics with a small segmentation or horizon-regression model.
4. **More genres:** animals (COCO-SSD subject box → thirds), portraits.
5. **Backend:** feedback logging and model versioning on Render.
