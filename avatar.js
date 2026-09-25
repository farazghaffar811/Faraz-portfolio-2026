/* Avatar runtime: loads three.js, builds the model from avatar-model.js and runs the hero
   interaction. Cursor zones pick a mood: left/right he looks over, center he greets you, waves
   and points down at the portfolio. Arms use two-bone IK; rendering pauses off screen and idle
   frames are throttled to ~30fps. */
(() => {
  const scene = document.getElementById('scene');
  const hero = document.querySelector('.hero');
  if (!scene || !hero) return;

  const $ = id => document.getElementById(id);
  const bubble = $('bubble'), msg = $('msg'), callText = $('callText'), cue = document.querySelector('.cue');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stackedQ = matchMedia('(max-width: 900px), (max-aspect-ratio: 4/5)');
  const fineQ = matchMedia('(hover: hover) and (pointer: fine)');
  const now = () => performance.now() / 1000;
  const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

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
  const state = { mode: 'work', dir: 0, t0: now() };
  let zone = null, camX = 0, camY = 0;
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
    const r = hero.getBoundingClientRect(); // gentle camera parallax
    camX = (e.clientX - r.left) / r.width - .5;
    camY = (e.clientY - r.top) / r.height - .5;
  }, { passive: true });
  hero.addEventListener('pointerleave', e => {
    if (e.pointerType !== 'mouse') return;
    zone = null; camX = camY = 0;
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

  /* ---------- pose targets (wrists are in body space) ---------- */
  const base = () => ({
    swivel: 0, lean: .06, bob: 0, headYaw: 0, headPitch: .2, headRoll: 0,
    gazeX: 0, gazeY: -.6, lid: .8, brow: .1, browTilt: 0,
    lx: -.1, ly: .745, lz: .21, rx: .1, ry: .745, rz: .21, wave: 0,
  });
  const cur = base();
  let spin = 0, mouthKind = 'calm', handL = 'fist', handR = 'fist';
  const ease = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  function targets(t) {
    const T = base(), e = t - state.t0;
    spin = 0; mouthKind = 'calm'; handL = handR = 'fist';
    if (!reduce) { // typing, breathing, and a glance up at you every few seconds
      T.ly += Math.abs(Math.sin(t * 13)) * .008; T.ry += Math.abs(Math.sin(t * 13 + 1.7)) * .008;
      T.lean += Math.sin(t * 1.6) * .006;
      if (state.mode === 'work' && t % 7 > 5.7) Object.assign(T, { gazeY: .05, headPitch: .1, lid: .9, brow: .3 });
    }
    if (state.mode === 'look') {
      if (e > LOOK_HOLD) setMode('work');
      else {
        const d = state.dir;
        Object.assign(T, { swivel: d * .28, headYaw: d * .5, headPitch: 0, headRoll: -d * .05, gazeX: d, gazeY: .05, lid: .86, brow: .6, browTilt: d, lean: 0 });
        mouthKind = 'smile';
        say(d < 0 ? 'l' : 'r', d < 0 ? 'Anyone here on the left?' : 'Anyone here on the right?');
      }
    }
    if (state.mode === 'greet') {
      Object.assign(T, { headPitch: -.04, gazeY: .05, lid: .95, lean: 0 });
      if (e < .45) { Object.assign(T, { brow: 1 }); mouthKind = 'o'; }                          // notices you
      else if (e < 1.35) {                                                                         // a happy spin in the chair
        Object.assign(T, { brow: .8, bob: .015 }); mouthKind = 'open';
        if (!reduce) spin = ease((e - .45) / .9) * Math.PI * 2;
      } else if (e < 3.5) {                                                                        // waves hello
        const w = reduce ? 0 : Math.sin(e * 10);
        Object.assign(T, { brow: .7, rx: .33 + w * .03, ry: 1.23, rz: .1, wave: w, headRoll: .06, swivel: -.08 });
        mouthKind = 'open'; handR = 'open';
      } else {                                                                                     // points down at the portfolio
        Object.assign(T, { brow: .45, lx: -.29, ly: .87, lz: .36, headYaw: -.22, headPitch: .12, gazeX: -.4, gazeY: -.3, swivel: -.1 });
        mouthKind = 'smile'; handL = 'point';
      }
      if (e < 1.35) say('g1', "Hey, it's you!");
      else if (e < 3.5) say('g2', 'Hiiii!');
      else say('g3', 'Check out the portfolio', 'Scroll down');
    }
    cue.classList.toggle('nudge', state.mode === 'greet' && e >= 3.5);
    if (state.mode === 'work') say('', '');
    return T;
  }

  /* ---------- three.js ---------- */
  let T3 = null, three = null;
  const V = () => new T3.Vector3();
  let tmp = null;

  function init() {
    T3 = window.THREE;
    if (!T3 || !window.FG3D) return;
    let renderer;
    try { renderer = new T3.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (_) { return; }
    renderer.outputEncoding = T3.sRGBEncoding;
    renderer.toneMapping = T3.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .96;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T3.PCFSoftShadowMap;

    const model = FG3D.build(T3), W = model.world;
    const pmrem = new T3.PMREMGenerator(renderer);
    W.environment = pmrem.fromScene(FG3D.studio(T3), .04).texture;
    pmrem.dispose();

    W.add(new T3.HemisphereLight(0xbfd3ff, 0x2a1d14, .25));
    const key = new T3.DirectionalLight(0xfff0dc, 1.15);
    key.position.set(1.4, 2.6, 2.8); key.target.position.set(0, .9, .2);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: .5, far: 8 });
    key.shadow.bias = -.0004; key.shadow.normalBias = .02;
    W.add(key, key.target);
    const fill = new T3.DirectionalLight(0x9db8ff, .5); fill.position.set(-2.4, 1.3, 1.6); W.add(fill);
    const rim = new T3.DirectionalLight(0xffc27a, 1.05); rim.position.set(-1.3, 2, -2.6); W.add(rim);
    const rim2 = new T3.DirectionalLight(0x9fc4ff, .6); rim2.position.set(1.6, 1.6, -2.2); W.add(rim2);
    const screenLight = new T3.PointLight(0x9fc4ff, 1.1, 1.3, 2); screenLight.position.set(0, .92, .36); W.add(screenLight);

    model.headPivot.rotation.order = 'YXZ';
    model.brows.forEach(b => { b.userData.y = b.position.y; });
    model.arms.L.hand.scale.x = -1; // mirrored so both thumbs point inward

    const camera = new T3.PerspectiveCamera(28, 1, .05, 30);
    const fit = () => {
      const cw = scene.clientWidth, ch = scene.clientHeight;
      if (!cw || !ch) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75, Math.sqrt(3.6e6 / (cw * ch)));
      renderer.setPixelRatio(dpr);
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      camera.userData.dist = 2.15 + Math.max(0, ch / cw - .7) * 1.1; // pull back on tall screens
      camera.updateProjectionMatrix();
    };
    fit();
    new ResizeObserver(fit).observe(scene);

    tmp = { S: V(), E: V(), W: V(), d: V(), p: V(), fd: V(), q: new T3.Quaternion(), m: new T3.Matrix4(), x: V(), y: V(), z: V(), up: new T3.Vector3(0, 1, 0), look: V() };
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    scene.appendChild(canvas);
    three = { renderer, W, model, camera, screenLight };
    render(now());
    requestAnimationFrame(() => canvas.classList.add('on'));
  }

  // two-bone IK: elbow bends toward the pole; writes the (clamped) wrist into tmp.W
  function ik(S, target, L1, L2, pole) {
    const { d, p, E, W } = tmp;
    d.copy(target).sub(S);
    const len = Math.max(.05, Math.min(d.length(), L1 + L2 - 1e-4));
    d.normalize();
    const a = (L1 * L1 - L2 * L2 + len * len) / (2 * len), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    p.copy(pole).addScaledVector(d, -pole.dot(d)).normalize();
    E.copy(S).addScaledVector(d, a).addScaledVector(p, h);
    W.copy(S).addScaledVector(d, len);
  }
  function limb(m, A, B, r) {
    const { fd } = tmp;
    fd.copy(B).sub(A);
    const L = fd.length();
    m.position.copy(A).addScaledVector(fd, .5);
    m.quaternion.setFromUnitVectors(tmp.up, fd.normalize());
    m.scale.set(r, L, r);
  }
  function aimHand(hand, finger, palm) { // fingers along +y, palm facing +z
    const { x, y, z, m, q } = tmp;
    y.copy(finger).normalize();
    z.copy(palm).addScaledVector(y, -palm.dot(y)).normalize();
    x.crossVectors(y, z);
    m.makeBasis(x, y, z);
    q.setFromRotationMatrix(m);
    hand.quaternion.slerp(q, .3);
  }
  const POLE = { typeL: [-1, -.6, -.8], typeR: [1, -.6, -.8], wave: [1, -1, -.3], point: [-1, .3, -.2] };
  function poseArm(a, S, tx, ty, tz, poleArr, kind, t) {
    const target = tmp.look.set(tx, ty, tz);
    const pole = new T3.Vector3(...poleArr);
    ik(S, target, .21, .21, pole);
    const { E, W, fd } = tmp;
    limb(a.upper, S, E, .05);
    limb(a.fore, E, W, .045);
    a.shoulder.position.copy(S);
    a.elbow.position.copy(E);
    fd.copy(W).sub(E).normalize();
    a.cuff.position.copy(W).addScaledVector(fd, -.012);
    a.cuff.quaternion.setFromUnitVectors(tmp.up, fd);
    a.hand.position.copy(W);
    if (kind === 'open') aimHand(a.hand, new T3.Vector3(Math.sin(cur.wave * .35), 1, 0), new T3.Vector3(0, 0, 1));
    else if (kind === 'point') aimHand(a.hand, new T3.Vector3(-.15, -1, .3), new T3.Vector3(-1, 0, 0));
    else aimHand(a.hand, new T3.Vector3(fd.x, fd.y - .45, fd.z), new T3.Vector3(0, -1, 0));
    const P = a.poses;
    P.open.visible = kind === 'open'; P.point.visible = kind === 'point'; P.fist.visible = kind === 'fist';
  }

  let blinkAt = now() + 2, shownMouth = 'calm';
  function render(t) {
    const { renderer, W, model, camera, screenLight } = three, c = cur;
    model.swivel.rotation.y = c.swivel + spin;
    model.swivel.position.y = c.bob;
    model.lean.rotation.x = c.lean;
    model.headPivot.rotation.set(c.headPitch, c.headYaw, c.headRoll);
    model.eyes.forEach(eye => eye.rotation.set(-c.gazeY * .3, c.gazeX * .38, 0));
    let blink = 0;
    if (t > blinkAt) { const p = (t - blinkAt) / .15; if (p >= 1) blinkAt = t + 2.4 + Math.random() * 3; else blink = Math.sin(p * Math.PI); }
    const open = Math.max(0, c.lid * (1 - blink));
    model.lids.forEach(l => { l.rotation.x = 1.45 - open * 2.375; });
    model.glints.forEach(g => { g.visible = open > .42; });
    model.brows.forEach((b, i) => { b.position.y = b.userData.y + .013 * c.brow + .006 * Math.max(0, (i ? 1 : -1) * c.browTilt); });
    if (mouthKind !== shownMouth) { shownMouth = mouthKind; model.mouth.material.map = model.mouthTextures[mouthKind]; model.mouth.material.needsUpdate = true; }
    poseArm(model.arms.L, model.shoulders.L, c.lx, c.ly, c.lz, handL === 'point' ? POLE.point : POLE.typeL, handL, t);
    poseArm(model.arms.R, model.shoulders.R, c.rx, c.ry, c.rz, handR === 'open' ? POLE.wave : POLE.typeR, handR, t);
    screenLight.intensity = 1.05 + (reduce ? 0 : Math.sin(t * 7.3) * .08);
    const dist = camera.userData.dist || 2.15;
    camera.position.set(camX * .14, 1.3 - camY * .04, dist);
    camera.lookAt(0, 1.07, .15);
    renderer.render(W, camera);
  }

  /* ---------- loop: renders only while the hero is on screen ---------- */
  let running = false, visible = true, prev = now(), frame = 0;
  function wake() { if (!running && visible && !document.hidden) { running = true; prev = now(); requestAnimationFrame(tick); } }
  function tick() {
    if (!visible || document.hidden) { running = false; return; }
    requestAnimationFrame(tick);
    const t = now();
    const scrolling = document.documentElement.classList.contains('scrolling');
    ++frame;
    if (scrolling || (state.mode === 'work' && t - state.t0 > 1.5 && frame & 1)) return; // paused while scrolling, ~30fps idle
    const dt = Math.min(.1, t - prev);
    prev = t;
    const T = targets(t);
    const slow = 1 - Math.exp(-dt * (reduce ? 14 : 7)), fast = 1 - Math.exp(-dt * 16);
    for (const k in T) cur[k] += (T[k] - cur[k]) * (k === 'swivel' || k.startsWith('head') ? slow : fast);
    if (three) render(t);
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

  // three.js loads after fonts (the laptop decal uses them); the page is fully usable meanwhile
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    const s = document.createElement('script');
    s.src = THREE_SRC;
    s.async = true;
    s.onload = () => { try { init(); } catch (err) { console.error(err); } wake(); };
    document.head.appendChild(s);
  });

  wake();
  window.FG_RIG = { setMode, state, get three() { return three; } };
})();
