# Faraz Ghaffar portfolio

Midnight navy + champagne gold, liquid-glass surfaces, and an interactive 3D hero: a cartoon Faraz in a
suit sits at his laptop in an evening office. Move the cursor left or right and he swivels his chair to look;
move it to the center and he spins round in the chair, greets you, then leans toward the work below.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page |
| `styles.css` | Theme tokens, liquid glass, layout, scroll-driven reveals, responsive rules |
| `office.js` | Draws the office background (city window, shelf, lamps) as inline SVG, seeded |
| `character3d.js` | 3D scene: inflates the portrait into a mesh from its silhouette, seats it in a swivel chair behind a three.js laptop and mug, and animates it (cursor zones, swivel, chair spin, speech bubble). The desk in front is a CSS band |
| `assets/faraz-3d.webp` | The character image (transparent background); also the first frame and the no-WebGL fallback |
| `app.js` | Hero parallax, scroll-linked tech ribbon, glass sheen, card tilt, active nav, copy buttons |

## Deploy

The repository root is the site: plain HTML, CSS and JS, with no build step and no framework (three.js loads from cdnjs).

- **GitHub Pages:** Settings > Pages > Deploy from a branch > `main` / root.
- **Vercel or Netlify:** import the repo and keep the defaults (no build command, output is the root).
- **Locally:** run `python -m http.server` in this folder and open http://localhost:8000.

## Performance notes

- three.js loads after the page is up; until then, or without WebGL, the plain image shows with the same motion in CSS 3D.
- The character loop runs on `requestAnimationFrame` only while the hero is on screen and the tab is visible.
- Scroll effects use one passive listener batched per frame; everything animates `transform`/`opacity`.
- Section reveals use CSS scroll-driven animations (no JS); older browsers simply show the content.
- The office background is generated SVG; the only image is the 60 KB character WebP.
- `prefers-reduced-motion` turns off the ambient motion and parallax.

## Links used

- GitHub: https://github.com/farazghaffar811
- LinkedIn: https://www.linkedin.com/in/faraz-ghaffar-a467082a0
- Fiverr: https://www.fiverr.com/farazghaffar988/design-redesign-wordpress-website-web-development-as-a-full-stack-web-developer
- Upwork: currently a talent-search link; swap in your direct profile URL (`upwork.com/freelancers/~...`) in `index.html` when you have it.
