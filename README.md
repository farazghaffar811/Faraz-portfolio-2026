# Faraz Ghaffar portfolio

Midnight navy + champagne gold, liquid-glass surfaces, and an interactive Bitmoji-style hero:
Faraz (short trimmed beard, confident smirk) types at his laptop in an evening office; move the cursor left or right and he looks over,
move it to the center and he takes his headset off, waves, and points down to the work.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page |
| `styles.css` | Theme tokens, liquid glass, layout, scroll-driven reveals, responsive rules |
| `office.js` | Draws the office background (city window, shelf, lamps) as inline SVG, seeded |
| `character-art.js` | The character, laptop and desk artwork |
| `character.js` | Character rig: cursor zones, state machine, arm IK, blinking, mouth shapes |
| `app.js` | Hero parallax, scroll-linked tech ribbon, glass sheen, card tilt, active nav, copy buttons |

## Deploy

The repository root is the site: plain HTML, CSS and JS, with no build step, no framework and no image files.

- **GitHub Pages:** Settings > Pages > Deploy from a branch > `main` / root.
- **Vercel or Netlify:** import the repo and keep the defaults (no build command, output is the root).
- **Locally:** run `python -m http.server` in this folder and open http://localhost:8000.

## Performance notes

- The character loop runs on `requestAnimationFrame` only while the hero is on screen and the tab is visible.
- Only SVG attributes whose values changed are written each frame.
- Scroll effects use one passive listener batched per frame; everything animates `transform`/`opacity`.
- Section reveals use CSS scroll-driven animations (no JS); older browsers simply show the content.
- The background is generated SVG, so the page ships zero image files.
- `prefers-reduced-motion` turns off the ambient motion and parallax.

## Links used

- GitHub: https://github.com/farazghaffar811
- LinkedIn: https://www.linkedin.com/in/faraz-ghaffar-a467082a0
- Fiverr: https://www.fiverr.com/farazghaffar988/design-redesign-wordpress-website-web-development-as-a-full-stack-web-developer
- Upwork: currently a talent-search link; swap in your direct profile URL (`upwork.com/freelancers/~...`) in `index.html` when you have it.
