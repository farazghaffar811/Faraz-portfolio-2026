# Faraz Ghaffar portfolio

Midnight navy + champagne gold, Apple-style liquid glass on every section over a real ultra-HD Milky Way that drifts in slow motion, spring-eased motion with native (compositor-smooth) scrolling, and an interactive 3D hero: a Pixar-style Faraz
(brown quiff, Chaplin mustache, grey-blue suit) types at his laptop in front of a real, softly focused office full of people at work. He is modelled in
code, not drawn from a picture, so he stays sharp at any resolution. Move the cursor left or right and he
looks over; move it to the center and he spins round in his chair, waves, and points down at the portfolio.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page |
| `styles.css` | Theme tokens, the Milky Way backdrop (slow drift, twinkling stars, a rare shooting star), the liquid glass system (`.glass` panels with thickness, grain, a dispersive rim and a scroll light sweep; `.tile` inner panes), spring-eased reveals and morphs, responsive rules |
| `assets/office.mp4` | Background footage: a seamless 11 s loop, soft focus and navy grade baked in (0.55 MB) |
| `assets/office-poster.webp` | First frame, shown instantly and for reduced-motion visitors |
| `assets/milkyway.avif` / `.webp` | Page backdrop: a 4K still of the real Milky Way (AVIF 0.97 MB, WebP fallback), graded dark |
| `assets/milkyway-1080.avif` / `.webp` | The same still at 1080p for phones and tablets |
| `avatar-model.js` | Builds the 3D character, chair, desk, laptop, mug and plant from three.js primitives and high-res canvas textures |
| `avatar.js` | Loads three.js, lights and renders the scene, and animates it: cursor zones, arm IK (typing, waving, pointing), blinking, gaze, expressions |
| `app.js` | Hero parallax, scroll-linked tech ribbon, card sheen, lift and tilt, compact nav with a gliding liquid pill, active nav link, copy buttons; pauses ambient motion while you scroll |

## Deploy

The repository root is the site: plain HTML, CSS and JS, with no build step and no framework (three.js loads from cdnjs).

- **GitHub Pages:** Settings > Pages > Deploy from a branch > `main` / root.
- **Vercel or Netlify:** import the repo and keep the defaults (no build command, output is the root).
- **Locally:** run `python -m http.server` in this folder and open http://localhost:8000.

## Performance notes

- three.js loads after the page is up and the scene fades in; the rest of the page never waits for it.
- The 3D loop runs only while the hero is on screen and the tab is visible; idle typing renders at ~30fps and pixel ratio is capped for large screens.
- Scroll effects use one passive listener batched per frame; everything animates `transform`/`opacity`.
- Only the outer panels use `backdrop-filter` (a light 16px blur); the panes inside them are plain translucent layers.
- Scrolling is native, so it runs on the compositor thread and stays smooth even when the page is busy.
- While you scroll, the Milky Way drift, twinkles and the 3D hero pause, so every frame goes to the scroll.
- Section reveals use CSS scroll-driven animations (no JS); older browsers simply show the content.
- The office video is 960x540 with the blur baked in, so the browser does no per-frame filtering; it pauses when the hero scrolls away.
- The Milky Way is a still image moved by a compositor-only transform over minutes (no video decoding), so it stays razor sharp and costs almost nothing; phones get the 1080p version.
- `prefers-reduced-motion` turns off the ambient motion and parallax, and shows the poster instead of the video.

## Links used

- GitHub: https://github.com/farazghaffar811
- LinkedIn: https://www.linkedin.com/in/faraz-ghaffar-a467082a0
- Fiverr: https://www.fiverr.com/farazghaffar988/design-redesign-wordpress-website-web-development-as-a-full-stack-web-developer
- Upwork: currently a talent-search link; swap in your direct profile URL (`upwork.com/freelancers/~...`) in `index.html` when you have it.

## Credits

- Background video: "Busy office space" by Mixkit (https://mixkit.co/free-stock-video/busy-office-space-918/),
  used under the Mixkit Stock Video Free License. Trimmed, looped, blurred and colour graded.
- Milky Way backdrop: a frame from "Copious stars of the milky way seen in the distance" by Mixkit
  (https://mixkit.co/free-stock-video/copious-stars-of-the-milky-way-seen-in-the-distance-30084/),
  used under the Mixkit Stock Video Free License. Colour graded and vignetted.
