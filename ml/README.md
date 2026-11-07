# ML plan

Nothing is trained yet. The app currently runs on rules; this folder is where training code will live. Models must run in the browser at 10+ fps on a mid-range phone, so keep them small (MobileNetV3-Small or EfficientNet-Lite0, input 224×224 or smaller, under ~5 MB after quantisation).

## 1. Aesthetic scorer (first model)

- **Goal:** predict how good a frame looks, 1–10, so auto-capture fires on genuinely good photos rather than rule-perfect ones.
- **Approach:** NIMA. Backbone predicts a distribution over 10 score buckets; train with earth mover's distance loss; the score is the mean of the distribution.
- **Data:** AVA (check its terms before shipping anything trained on it). Filter to landscape/sunset-like images by tag or by a quick pretrained classifier. For fine-tuning on your own genre, collect permissively licensed photos (Unsplash, Wikimedia Commons) and rate a few hundred yourself.
- **Train:** PyTorch in Colab, pretrained ImageNet weights, freeze the backbone for the first epochs.
- **Export:** PyTorch → ONNX → `onnxruntime-web`, or Keras → `tensorflowjs_converter` for TF.js. Quantise to int8/float16 and measure on a real phone.

## 2. Plugging it in

1. Put the exported model in `public/models/aesthetic/`.
2. Load it once in `App.jsx`; run it on the same downscaled canvas, at a lower rate than the rule loop (about 2–3 per second is enough).
3. Blend in `evaluate()`: `score = 0.5 * ruleScore + 0.5 * mlScore`, and feed the blended score to `useAutoCapture`.

## 3. Later models

- Horizon/sun detection: a tiny segmentation head (sky vs ground) to replace the brightness heuristics.
- Direction hints learned from data: take well-rated photos, crop or shift them randomly, and train a model to predict the shift that restores the original. This gives learned "move left / tilt up" without hand-written rules, but needs a lot of rated photos per genre.

## Evaluation

Hold out a set of photos you personally rate. Track correlation between predicted and human score, and test the app outdoors at golden hour on the target phone before trusting any number.
