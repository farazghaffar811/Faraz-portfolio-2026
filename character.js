/* Character rig: cursor zones drive a small state machine; every frame the pose eases toward
   its target and only attributes whose value changed are written. The loop sleeps whenever
   the hero is off screen or the tab is hidden. */
(() => {
  const scene = document.getElementById('scene');
  const hero = document.querySelector('.hero');
  if (!scene || !hero || !window.FG_ART) return;
  scene.innerHTML = window.FG_ART;

  const $ = id => document.getElementById(id);
  const bubble = $('bubble'), msg = $('msg'), callText = $('callText');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stackedQ = matchMedia('(max-width: 900px), (max-aspect-ratio: 4/5)');
  const fineQ = matchMedia('(hover: hover) and (pointer: fine)');
  const now = () => performance.now() / 1000;
  const n = v => Math.round(v * 100) / 100;

  const cache = new WeakMap();
  const set = (el, attr, val) => {
    let c = cache.get(el);
    if (!c) cache.set(el, (c = {}));
    if (c[attr] !== val) { c[attr] = val; el.setAttribute(attr, val); }
  };

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

  /* ---------- poses (viewBox 800 x 800) ---------- */
  const SH = { L: { x: 268, y: 510 }, R: { x: 532, y: 510 } };
  const IDLE = { L: { x: 338, y: 662 }, R: { x: 462, y: 662 } };
  const base = () => ({ yaw: 0, gx: 0, gy: 3, brow: .12, tilt: 0, smile: .45, smirk: .7, wink: 0, open: 0, headset: 0, bounce: 0, nod: 2, lid: .2, glow: 1,
    lx: IDLE.L.x, ly: IDLE.L.y, rx: IDLE.R.x, ry: IDLE.R.y, wob: 0 });
  const cur = base();
  let handL = 'fist', handR = 'fist';

  function targets(t) {
    const T = base(), e = t - state.t0;
    handL = handR = 'fist';
    if (!reduce) { // typing: wrists tick behind the lid, head bobs a little
      T.ly += Math.sin(t * 16) * 6; T.ry += Math.sin(t * 16 + 2.2) * 6;
      T.nod += Math.sin(t * 2.1) * 1.2;
    }
    if (state.mode === 'look') {
      if (e > LOOK_HOLD) setMode('work');
      else {
        const d = state.dir;
        Object.assign(T, { yaw: d, gx: d, gy: -.4, brow: .55, tilt: d, smile: .35, smirk: .5, nod: 0, lid: 0, glow: .35, ly: IDLE.L.y, ry: IDLE.R.y });
        say(d < 0 ? 'l' : 'r', d < 0 ? 'Anyone here on the left?' : 'Anyone here on the right?');
      }
    }
    if (state.mode === 'greet') {
      Object.assign(T, { gy: -.2, nod: 0, lid: 0, glow: .25, ly: IDLE.L.y, ry: IDLE.R.y });
      if (e < .5) Object.assign(T, { brow: 1, smile: .5, smirk: .2, open: .25 });                          // notices you
      else if (e < 1.1) Object.assign(T, { brow: .9, smile: 1, smirk: .15, open: .5, wink: e > .6 && e < 1 ? 1 : 0, bounce: reduce ? 0 : -Math.abs(Math.sin((e - .5) * 10.5)) * 9 }); // excited
      else if (e < 1.6) Object.assign(T, { brow: .6, smile: .9, smirk: .3, open: .15, rx: 516, ry: 292 });        // reaches for the headset
      else if (e < 2.4) Object.assign(T, { brow: .6, smile: 1, smirk: .3, open: .2, headset: 1, rx: 506, ry: 452 }); // headset down to the neck
      else if (e < 4.7) {                                                                               // waves hello
        const w = reduce ? 0 : Math.sin(e * 11);
        Object.assign(T, { brow: .85, smile: 1, smirk: .1, open: .8, headset: 1, rx: 640 + w * 24, ry: 322, wob: w });
        handR = 'open';
      } else {                                                                                          // points down at the portfolio
        Object.assign(T, { brow: .45, smile: .9, smirk: .6, open: .2, headset: 1, lx: 150, ly: 604, gx: -1.2, gy: 2.6, yaw: -.3 });
        handL = 'point';
      }
      if (e < 2.4) say('g1', "Hey, it's you!");
      else if (e < 4.7) say('g2', 'Hiiii!');
      else say('g3', 'Check out the portfolio', 'Scroll down');
    }
    if (state.mode === 'work') say('', '');
    return T;
  }

  /* ---------- rig parts ---------- */
  const P = {
    person: $('cPerson'), head: $('cHead'), face: $('cFace'), beard: $('cBeardG'), hair: $('cHair'),
    earL: $('cEarL'), earR: $('cEarR'), browL: $('cBrowL'), browR: $('cBrowR'), glow: $('cGlowFace'),
    mouth: $('cMouth'), clip: $('cMouthClipPath'), teeth: $('cTeeth'), tongue: $('cTongue'), lip: $('cLip'),
    headset: $('cHeadset'), band: $('cBandG'), mic: $('cMic'), slotHead: $('cSlotHead'), slotNeck: $('cSlotNeck'),
  };
  const irises = [...scene.querySelectorAll('.iris')];
  const lids = [...scene.querySelectorAll('.lid')].map(el => ({ el, top: +el.getAttribute('y') }));
  const lashes = [...scene.querySelectorAll('.lash')];
  const armOf = id => {
    const g = $(id), q = s => g.querySelector(s);
    return { so: q('.so'), sl: q('.sl'), cf: q('.cf'), hd: q('.hd'), h: { fist: q('.h-fist'), open: q('.h-open'), point: q('.h-point') }, shape: 'fist' };
  };
  const armL = armOf('cArmL'), armR = armOf('cArmR');

  // two-bone IK; side picks the elbow that sits outward (-1 = viewer's left)
  function ik(S, W, side, L1 = 128, L2 = 118) {
    let dx = W.x - S.x, dy = W.y - S.y, d = Math.hypot(dx, dy);
    const max = L1 + L2 - .5;
    if (d > max) { dx *= max / d; dy *= max / d; d = max; }
    d = Math.max(d, 1);
    const a = Math.atan2(dy, dx);
    const b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const e1 = { x: S.x + Math.cos(a + b) * L1, y: S.y + Math.sin(a + b) * L1 };
    const e2 = { x: S.x + Math.cos(a - b) * L1, y: S.y + Math.sin(a - b) * L1 };
    return { E: (side > 0 ? e1.x > e2.x : e1.x < e2.x) ? e1 : e2, W: { x: S.x + dx, y: S.y + dy } };
  }
  function drawArm(arm, S, target, side, hand, twist) {
    const { E, W } = ik(S, target, side);
    const fx = W.x - E.x, fy = W.y - E.y, fl = Math.hypot(fx, fy) || 1, ux = fx / fl, uy = fy / fl;
    const d = `M${n(S.x)} ${n(S.y)}L${n(E.x)} ${n(E.y)}L${n(W.x - ux * 18)} ${n(W.y - uy * 18)}`;
    set(arm.so, 'd', d); set(arm.sl, 'd', d);
    set(arm.cf, 'd', `M${n(W.x - ux * 14)} ${n(W.y - uy * 14)}L${n(W.x - ux * 2)} ${n(W.y - uy * 2)}`);
    const rot = Math.atan2(ux, -uy) * 180 / Math.PI + twist;
    set(arm.hd, 'transform', `translate(${n(W.x)} ${n(W.y)}) rotate(${n(rot)}) scale(${side} 1)`);
    if (arm.shape !== hand) {
      arm.shape = hand;
      for (const k in arm.h) arm.h[k].setAttribute('display', k === hand ? 'inline' : 'none');
    }
  }
  function mouth(s, o, k) {
    const w = 22 + s * 9, cy = 362 - s * 3, up = cy + 2 + s * 5, d = 2.2 + o * 24, L = 400 - w, R = 400 + w;
    const yl = cy + k * 2, yr = cy - k * 6, low = up + 2 * d + s * 4;
    const dark = `M${n(L)} ${n(yl)}Q400 ${n(up)} ${n(R)} ${n(yr)}Q400 ${n(low)} ${n(L)} ${n(yl)}Z`;
    set(P.mouth, 'd', dark); set(P.clip, 'd', dark);
    const t = Math.min(10, d * .55);
    set(P.teeth, 'd', `M${n(L)} ${n(yl - 2)}Q400 ${n(up - 2)} ${n(R)} ${n(yr - 2)}L${n(R)} ${n(yr + t)}Q400 ${n(up + t + 2)} ${n(L)} ${n(yl + t)}Z`);
    set(P.tongue, 'cy', n(up + d * .9)); set(P.tongue, 'rx', n(w * .5)); set(P.tongue, 'ry', n(Math.max(1, d * .35)));
    set(P.lip, 'cx', n(400 + k * 3)); set(P.lip, 'cy', n((cy + low) / 2 + 4 - k * 1.5)); set(P.lip, 'rx', n(w * .52));
  }


  let hsSlot = 'head', blinkAt = now() + 2;
  function render(t) {
    const c = cur;
    set(P.person, 'transform', `translate(0 ${n(c.bounce)})`);
    const headT = `rotate(${n(c.yaw * 4)} 400 420) translate(${n(c.yaw * 5)} ${n(c.nod)})`;
    set(P.head, 'transform', headT);
    set(P.slotHead, 'transform', headT); // the headset rides on the head until it drops to the neck
    set(P.face, 'transform', `translate(${n(c.yaw * 15)} ${n(c.gy * .7)})`);
    set(P.beard, 'transform', `translate(${n(c.yaw * 7)} 0)`);
    set(P.hair, 'transform', `translate(${n(c.yaw * 6)} 0)`);
    set(P.earL, 'transform', `translate(${n(-c.yaw * 5)} 0)`);
    set(P.earR, 'transform', `translate(${n(-c.yaw * 5)} 0)`);
    set(P.glow, 'opacity', n(c.glow));
    irises.forEach(el => set(el, 'transform', `translate(${n(c.gx * 6)} ${n(c.gy * 2.2)})`));
    const bl = c.brow * 8 + Math.max(0, -c.tilt) * 4, br = c.brow * 8 + Math.max(0, c.tilt) * 4;
    set(P.browL, 'transform', `translate(0 ${n(-bl)})`);
    set(P.browR, 'transform', `translate(0 ${n(-br)})`);

    let blink = 0;
    if (t > blinkAt) { const p = (t - blinkAt) / .16; if (p >= 1) blinkAt = t + 2.2 + Math.random() * 3; else blink = Math.sin(p * Math.PI); }
    const b = Math.max(c.lid, blink);
    lids.forEach(({ el, top }, i) => { const v = i ? Math.max(b, c.wink) : b; set(el, 'transform', `matrix(1 0 0 ${n(v)} 0 ${n(top * (1 - v))})`); });
    lashes.forEach((el, i) => set(el, 'transform', `translate(0 ${n((i ? Math.max(b, c.wink) : b) * 23)})`));
    mouth(c.smile, c.open, c.smirk);

    const h = c.headset;
    set(P.headset, 'transform', `translate(400 ${n(270 + h * 186)}) scale(${n(1 - .08 * h)} ${n(1 - .12 * h)}) translate(-400 -270)`);
    set(P.band, 'opacity', n(Math.max(0, 1 - h * 1.7)));
    set(P.mic, 'opacity', n(Math.max(0, 1 - h * 1.4)));
    const want = h > .5 ? 'neck' : 'head';
    if (want !== hsSlot) { (want === 'neck' ? P.slotNeck : P.slotHead).appendChild(P.headset); hsSlot = want; }

    drawArm(armL, SH.L, { x: c.lx, y: c.ly }, -1, handL, 0);
    drawArm(armR, SH.R, { x: c.rx, y: c.ry }, 1, handR, c.wob * 16);
  }

  /* ---------- loop: runs only while the scene is on screen ---------- */
  let running = false, visible = true, prev = now();
  function wake() { if (!running && visible && !document.hidden) { running = true; prev = now(); requestAnimationFrame(tick); } }
  function tick() {
    if (!visible || document.hidden) { running = false; return; }
    const t = now(), dt = Math.min(.1, t - prev);
    prev = t;
    const T = targets(t);
    const k = 1 - Math.exp(-dt * (reduce ? 16 : 8)), ka = 1 - Math.exp(-dt * (reduce ? 18 : 10));
    for (const key in T) cur[key] += (T[key] - cur[key]) * (key.length === 2 && (key[0] === 'l' || key[0] === 'r') ? ka : k);
    render(t);
    requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', wake);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (stackedQ.matches) { // phones: greet when the scene is mostly in view
      if (e.intersectionRatio > .55 && state.mode === 'work') setMode('greet');
      else if (!e.isIntersecting) state.mode = 'work';
    }
    wake();
  }, { threshold: [0, .55] }).observe(scene);

  render(now());
  wake();
  window.FG_RIG = { setMode, state };
})();
