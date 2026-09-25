/* 3D character: Faraz seated at his laptop. The rendered portrait is lifted into a mesh (depth
   inflated from its silhouette) that swivels, spins and leans with his office chair when the
   cursor picks a zone. Chair, laptop and mug are real three.js geometry; the desk is a CSS band
   in front of the canvas. The plain image is the first frame and the no-WebGL fallback. */
(() => {
  const scene = document.getElementById('scene');
  const hero = document.querySelector('.hero');
  const img = scene && scene.querySelector('img');
  if (!img || !hero) return;

  const $ = id => document.getElementById(id);
  const bubble = $('bubble'), msg = $('msg'), callText = $('callText'), cue = document.querySelector('.cue');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stackedQ = matchMedia('(max-width: 900px), (max-aspect-ratio: 4/5)');
  const fineQ = matchMedia('(hover: hover) and (pointer: fine)');
  const now = () => performance.now() / 1000;
  const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  // Framing in world units (character 1 tall, feet at y 0). styles.css mirrors these numbers:
  // desk band = (DESK_Y - VIEW_B) / VIEW_H of the scene; image = 1 / VIEW_H tall, VIEW_B / VIEW_H below.
  const DESK_Y = .45, VIEW_B = .30, VIEW_H = .85, HIP_Y = .40;

  /* ---------- speech bubble ---------- */
  let msgKey = '';
  function say(key, text, label) {
    if (key === msgKey) return;
    msgKey = key;
    bubble.classList.remove('show');
    clearTimeout(say.t);
    if (!text) return;
    say.t = setTimeout(() => {
      msg.innerHTML = (label ? `<small>${label}</small>` : '') + text;
      bubble.classList.add('show');
    }, 160);
  }

  /* ---------- state machine: work | look (holds ~2.6s) | greet ---------- */
  const LOOK_HOLD = 2.6;
  const state = { mode: 'work', dir: 0, t0: 0 };
  let zone = null;
  function setMode(mode, dir = 0) { state.mode = mode; state.dir = dir; state.t0 = now(); wake(); }
  function enterZone(z) {
    if (z === zone) return;
    zone = z;
    if (z === 'left') setMode('look', -1);
    else if (z === 'right') setMode('look', 1);
    else if (z === 'center' && state.mode !== 'greet') setMode('greet');
  }
  const zoneAt = x => { const r = hero.getBoundingClientRect(), p = (x - r.left) / r.width; return p < 1 / 3 ? 'left' : p > 2 / 3 ? 'right' : 'center'; };
  hero.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || stackedQ.matches) return;
    enterZone(zoneAt(e.clientX));
  }, { passive: true });
  hero.addEventListener('pointerleave', e => {
    if (e.pointerType !== 'mouse') return;
    zone = null;
    if (state.mode === 'greet') setMode('work');
  });
  hero.addEventListener('pointerdown', e => { // touch and pen: tap a zone, or tap to replay on phones
    if (e.pointerType === 'mouse') return;
    if (stackedQ.matches) { setMode('greet'); return; }
    zone = null;
    enterZone(zoneAt(e.clientX));
  });
  const syncCall = () => { callText.textContent = stackedQ.matches || !fineQ.matches ? 'Tap me to say hi' : 'Move cursor to call me!'; };
  syncCall();
  stackedQ.addEventListener('change', syncCall);

  /* ---------- motion targets (the rig pivots at his hips) ---------- */
  const base = () => ({ rotY: 0, rotZ: 0, rotX: 0, x: 0, y: 0, sx: 1, sy: 1 });
  const cur = base();
  let spin = 0;
  const ease = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  function targets(t) {
    const T = base(), e = t - state.t0;
    spin = 0;
    if (!reduce) { // typing: leans toward the screen with a small bob, breathing
      T.rotX = .05;
      T.y = Math.abs(Math.sin(t * 8)) * .004;
      T.sy = 1 + Math.sin(t * 2.2) * .006;
    }
    if (state.mode === 'look') {
      if (e > LOOK_HOLD) setMode('work');
      else {
        const d = state.dir;
        Object.assign(T, { rotY: d * .45, rotZ: -d * .03, x: d * .02, rotX: 0, y: 0 });
        say(d < 0 ? 'l' : 'r', d < 0 ? 'Anyone here on the left?' : 'Anyone here on the right?');
      }
    }
    if (state.mode === 'greet') {
      if (e < .35) Object.assign(T, { rotX: -.08, y: .02 });                        // sits up, surprised
      else if (e < 1.25) {                                                          // a full spin in the chair
        Object.assign(T, { rotX: -.03, y: .02 });
        if (!reduce) spin = ease((e - .35) / .9) * Math.PI * 2;
      } else if (e < 3.4) {                                                         // bounces happily
        T.rotX = 0;
        T.rotZ = reduce ? 0 : Math.sin(e * 12) * .05;
        T.y = reduce ? 0 : Math.abs(Math.sin(e * 6)) * .012;
      } else Object.assign(T, { rotX: .1, y: 0 });                                  // leans in toward the portfolio
      if (e < 1.25) say('g1', "Hey, it's you!");
      else if (e < 3.4) say('g2', 'Hiiii!');
      else say('g3', 'Check out the portfolio', 'Scroll down');
    }
    cue.classList.toggle('nudge', state.mode === 'greet' && e >= 3.4);
    if (state.mode === 'work') say('', '');
    return T;
  }

  /* ---------- geometry helpers ---------- */
  // chamfer distance from each silhouette pixel to the nearest transparent one
  function distance(mask, w, h) {
    const d = new Float32Array(w * h), D = Math.SQRT2;
    for (let i = 0; i < w * h; i++) d[i] = mask[i] > .5 ? 1e6 : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!d[i]) continue;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, d[i - w] + 1);
        if (x > 0) v = Math.min(v, d[i - w - 1] + D);
        if (x < w - 1) v = Math.min(v, d[i - w + 1] + D);
      }
      d[i] = v;
    }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (!d[i]) continue;
      let v = d[i];
      if (x < w - 1) v = Math.min(v, d[i + 1] + 1);
      if (y < h - 1) {
        v = Math.min(v, d[i + w] + 1);
        if (x < w - 1) v = Math.min(v, d[i + w + 1] + D);
        if (x > 0) v = Math.min(v, d[i + w - 1] + D);
      }
      d[i] = v;
    }
    return d;
  }
  function blur(src, w, h, r) { // one separable box pass, clamped at the edges
    const tmp = new Float32Array(src.length), out = new Float32Array(src.length), k = 2 * r + 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0;
      for (let j = -r; j <= r; j++) s += src[y * w + Math.min(w - 1, Math.max(0, x + j))];
      tmp[y * w + x] = s / k;
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0;
      for (let j = -r; j <= r; j++) s += tmp[Math.min(h - 1, Math.max(0, y + j)) * w + x];
      out[y * w + x] = s / k;
    }
    return out;
  }
  function roundedSlab(T3, w, h, r, depth) {
    const s = new T3.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return new T3.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 4, curveSegments: 10 });
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  // the back of the laptop lid: glowing monogram plus stack stickers
  function lidDecal(T3) {
    const c = document.createElement('canvas');
    c.width = 600; c.height = 210;
    const g = c.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'italic 500 96px "Bodoni Moda", Didot, Georgia, serif';
    g.shadowColor = 'rgba(240,216,168,.85)'; g.shadowBlur = 20; g.fillStyle = '#F0D8A8';
    g.fillText('fg', 300, 100);
    g.shadowBlur = 0;
    const sticker = (x, y, rot, draw) => { g.save(); g.translate(x, y); g.rotate(rot); draw(); g.restore(); };
    sticker(86, 64, -.14, () => {
      g.fillStyle = '#0B0B0B'; g.beginPath(); g.arc(0, 0, 32, 0, 7); g.fill();
      g.lineWidth = 4; g.strokeStyle = '#fff'; g.stroke();
      g.fillStyle = '#fff'; g.font = '700 34px Geist, "Segoe UI", sans-serif'; g.fillText('N', 0, 2);
    });
    sticker(516, 66, .17, () => {
      g.fillStyle = '#1F7A5A'; roundRect(g, -36, -30, 72, 60, 14); g.fill();
      g.fillStyle = '#7CF0B8'; g.beginPath();
      g.moveTo(6, -20); g.lineTo(-15, 6); g.lineTo(0, 6); g.lineTo(-6, 22); g.lineTo(15, -4); g.lineTo(0, -4); g.closePath(); g.fill();
    });
    sticker(506, 160, -.1, () => {
      g.fillStyle = '#3178C6'; roundRect(g, -27, -27, 54, 54, 8); g.fill();
      g.fillStyle = '#fff'; g.font = '700 23px Geist, "Segoe UI", sans-serif'; g.fillText('TS', 5, 9);
    });
    sticker(98, 160, .1, () => {
      g.fillStyle = '#D6AF69'; g.beginPath();
      for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 2; g.lineTo(Math.cos(a) * 33, Math.sin(a) * 33); }
      g.closePath(); g.fill();
      g.fillStyle = '#0B1220'; g.font = '600 23px "Geist Mono", Consolas, monospace'; g.fillText('AI', 0, 2);
    });
    const tex = new T3.CanvasTexture(c);
    tex.encoding = T3.sRGBEncoding;
    tex.anisotropy = 4;
    return tex;
  }

  /* ---------- 3D scene ---------- */
  let three = null;
  function initThree() {
    const T3 = window.THREE;
    if (!T3) return;
    const aspect = img.naturalWidth / img.naturalHeight;
    const gx = 90, gy = Math.round(gx / aspect), w = gx + 1, h = gy + 1;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    let px;
    try { px = ctx.getImageData(0, 0, w, h).data; } catch (_) { return; } // file:// pages can't read pixels
    const mask = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) mask[i] = px[i * 4 + 3] / 255;
    const dist = blur(blur(distance(mask, w, h), w, h, 2), w, h, 2);

    let renderer;
    try { renderer = new T3.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); } catch (_) { return; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = T3.sRGBEncoding;
    // hex colours are sRGB; convert so they render as picked under the sRGB output encoding
    const std = (hex, roughness = .5, metalness = 0) => new T3.MeshStandardMaterial({ color: new T3.Color(hex).convertSRGBToLinear(), roughness, metalness });

    // Faraz: a plane whose vertices (row by row from the top-left, like the pixels) bulge with the silhouette
    const geo = new T3.PlaneGeometry(aspect, 1, gx, gy);
    geo.translate(0, .5, 0);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, .021 * Math.sqrt(dist[i]));
    geo.computeVertexNormals();
    const tex = new T3.Texture(img);
    tex.encoding = T3.sRGBEncoding;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    const mesh = new T3.Mesh(geo, new T3.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: .12, side: T3.DoubleSide }));

    // his office chair sits behind him and swivels with him (rig pivots at the hips)
    const chair = new T3.Mesh(roundedSlab(T3, .46, .5, .09, .04), std(0x1b2334, .55, .1));
    chair.position.set(0, .62, -.13);
    const body = new T3.Group();
    body.position.y = -HIP_Y;
    body.add(chair, mesh);
    const rig = new T3.Group();
    rig.add(body);

    // laptop: lid tilted away from him with the decal on its back, silver hinge strip on the desk
    const hinge = new T3.Group();
    hinge.position.set(0, DESK_Y + .01, .34);
    hinge.rotation.x = .2;
    const lid = new T3.Mesh(new T3.BoxGeometry(.3, .105, .008), std(0x3b4252, .38, .35));
    lid.position.y = .0525;
    const decal = new T3.Mesh(new T3.PlaneGeometry(.3, .105), new T3.MeshBasicMaterial({ map: lidDecal(T3), transparent: true }));
    decal.position.set(0, .0525, .0045);
    hinge.add(lid, decal);
    const strip = new T3.Mesh(new T3.BoxGeometry(.33, .012, .03), std(0xaab3c0, .3, .5));
    strip.position.set(0, DESK_Y + .006, .35);

    // coffee mug with a gold band
    const mug = new T3.Group();
    mug.position.set(.33, DESK_Y, .3);
    const ceramic = std(0xe9edf3, .45);
    const cup = new T3.Mesh(new T3.CylinderGeometry(.034, .031, .085, 28), ceramic);
    cup.position.y = .0425;
    const ring = new T3.Mesh(new T3.CylinderGeometry(.0347, .0337, .012, 28), std(0xd6af69, .3, .6));
    ring.position.y = .062;
    const handle = new T3.Mesh(new T3.TorusGeometry(.022, .0065, 10, 20, Math.PI), ceramic);
    handle.position.set(.034, .045, 0);
    handle.rotation.z = -Math.PI / 2;
    mug.add(cup, ring, handle);

    const world = new T3.Scene();
    world.add(rig, hinge, strip, mug);
    world.add(new T3.AmbientLight(0xffffff, .8));
    const key = new T3.DirectionalLight(0xfff1dc, .34); key.position.set(1.2, 1.6, 2.4); world.add(key);
    const rim = new T3.DirectionalLight(0xffc98a, .35); rim.position.set(-1.6, 1, -1.2); world.add(rim);
    const screen = new T3.PointLight(0xbfd6ff, .5, 1, 2); screen.position.set(0, .56, .28); world.add(screen);

    // orthographic, so the CSS desk band lines up with DESK_Y at any size
    const camera = new T3.OrthographicCamera(-.5, .5, .5, -.5, .1, 20);
    const fit = () => { // layout size, so the scroll parallax scale doesn't feed back in
      const cw = scene.clientWidth, ch = scene.clientHeight;
      if (!cw || !ch) return;
      renderer.setSize(cw, ch, false);
      const half = VIEW_H / 2;
      Object.assign(camera, { left: -half * cw / ch, right: half * cw / ch, top: half, bottom: -half });
      camera.position.set(0, VIEW_B + half, 5);
      camera.lookAt(0, VIEW_B + half, 0);
      camera.updateProjectionMatrix();
    };
    fit();
    new ResizeObserver(fit).observe(scene);

    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    scene.insertBefore(canvas, img.nextSibling);
    three = { renderer, world, camera, mesh, rig, screen };
    apply(now());
    requestAnimationFrame(() => {
      canvas.classList.add('on');
      img.style.opacity = '0';
      setTimeout(() => { img.hidden = true; }, 520);
    });
  }

  function apply(t) {
    const c = cur;
    if (three) {
      const { rig, mesh, screen } = three;
      rig.rotation.set(c.rotX, c.rotY + spin, c.rotZ);
      rig.position.set(c.x, HIP_Y + c.y, 0);
      mesh.scale.set(c.sx, c.sy, 1);
      screen.intensity = .5 + (reduce ? 0 : Math.sin(t * 7.3) * .05); // screen flicker on his face
      three.renderer.render(three.world, three.camera);
    } else { // flat fallback: same motion with CSS 3D transforms
      const hp = img.offsetHeight;
      img.style.transform = `translate3d(${(c.x * hp).toFixed(1)}px,${(-c.y * hp).toFixed(1)}px,0) rotateX(${(-c.rotX).toFixed(3)}rad) rotateY(${(c.rotY + spin).toFixed(3)}rad) rotateZ(${(-c.rotZ).toFixed(3)}rad) scale(${c.sx.toFixed(3)},${c.sy.toFixed(3)})`;
    }
  }

  /* ---------- loop: runs only while the character is on screen ---------- */
  let running = false, visible = true, prev = now();
  function wake() { if (!running && visible && !document.hidden) { running = true; prev = now(); requestAnimationFrame(tick); } }
  function tick() {
    if (!visible || document.hidden) { running = false; return; }
    const t = now(), dt = Math.min(.1, t - prev);
    prev = t;
    const T = targets(t);
    const slow = 1 - Math.exp(-dt * (reduce ? 14 : 6)), fast = 1 - Math.exp(-dt * 18);
    for (const key in T) cur[key] += (T[key] - cur[key]) * (key.startsWith('rot') || key === 'x' ? slow : fast);
    apply(t);
    requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', wake);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (stackedQ.matches) { // phones: greet when the character is mostly in view
      if (e.intersectionRatio > .55 && state.mode === 'work') setMode('greet');
      else if (!e.isIntersecting) state.mode = 'work';
    }
    wake();
  }, { threshold: [0, .55] }).observe(scene);

  // load three.js once the image and fonts are ready; the image stays as the fallback if anything fails
  const imgReady = img.complete ? Promise.resolve() : new Promise(r => img.addEventListener('load', r, { once: true }));
  Promise.all([imgReady, document.fonts ? document.fonts.ready : null]).then(() => {
    if (location.protocol === 'file:') return;
    const s = document.createElement('script');
    s.src = THREE_SRC;
    s.async = true;
    s.onload = () => { try { initThree(); } catch (_) { /* keep the image */ } };
    document.head.appendChild(s);
  });

  wake();
  window.FG_RIG = { setMode, state };
})();
