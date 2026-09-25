/* Faraz's 3D avatar, modelled in code from three.js primitives so it stays sharp at any resolution:
   a Pixar-style young developer in a grey-blue suit, seated in a swivel chair at a walnut desk with
   his laptop and a coffee mug. avatar.js poses and animates the named parts. Units are roughly metres. */
(() => {
  const FG3D = (window.FG3D = window.FG3D || {});

  FG3D.build = function (T) {
    const lin = hex => new T.Color(hex).convertSRGBToLinear();
    const mat = (hex, roughness = .6, metalness = 0, extra = {}) =>
      new T.MeshStandardMaterial(Object.assign({ color: lin(hex), roughness, metalness }, extra));
    const tex = (w, h, draw) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new T.CanvasTexture(c);
      t.encoding = T.sRGBEncoding;
      t.anisotropy = 8;
      return t;
    };
    const mesh = (geo, m, shadow = true) => { const o = new T.Mesh(geo, m); o.castShadow = shadow; o.receiveShadow = true; return o; };
    const ball = (m, sx, sy, sz, seg = 32) => { const g = new T.SphereGeometry(1, seg, Math.round(seg * .7)); g.scale(sx, sy, sz); return mesh(g, m); };

    const M = {
      skin: mat(0xd8956a, .55, 0, { envMapIntensity: .55 }), hair: mat(0xffffff, .5), brow: mat(0x3b2516, .7), stache: mat(0x1c120d, .85),
      suit: mat(0x53627e, .8), lapel: mat(0x48566f, .82), shirt: mat(0xf5f6f8, .7),
      eye: mat(0xffffff, .1, 0, { envMapIntensity: 1.2 }), lash: mat(0x24160e, .5),
      chair: mat(0x141a28, .72, 0, { envMapIntensity: .4 }), steel: mat(0x4a5263, .3, .7), silver: mat(0xbac2cd, .26, .85),
      ceramic: mat(0xeef1f5, .28), gold: mat(0xd6af69, .28, .9), pot: mat(0x2b3448, .6), leaf: mat(0x3f8a67, .55),
    };

    /* ---------- head shape: one deformed sphere, shared by the hair so they fit ---------- */
    const R = .165;
    const shape = v => { // unit direction -> point on the unit-scale head surface
      let sx = 1, sy = 1, sz = 1;
      if (v.y < 0) { const k = v.y * v.y; sx = 1 - .2 * k; sz = 1 - .05 * k; sy = 1 + .07 * k; } // softer, narrower chin
      else sx = 1 + .035 * v.y;                                                                  // roomy cranium
      const cheek = .055 * Math.exp(-((Math.abs(v.x) - .6) ** 2 + (v.y + .3) ** 2 + (v.z - .7) ** 2) / .05);
      return new T.Vector3(v.x * sx * (1 + cheek), v.y * sy, v.z * sz * (1 + cheek * .4));
    };
    const surface = (x, y, z, lift = 1) => shape(new T.Vector3(x, y, z).normalize()).multiplyScalar(R * lift);
    const fitHead = (geo, lift) => {
      const p = geo.attributes.position, v = new T.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const s = shape(v).multiplyScalar(R * lift); p.setXYZ(i, s.x, s.y, s.z); }
      geo.computeVertexNormals();
      return geo;
    };
    // a flat texture wrapped onto the face: vertices are re-projected onto the head surface
    const decal = (map, dir, w, h, lift = 1.008) => {
      const g = new T.PlaneGeometry(1, 1, 18, 10), p = g.attributes.position, c = new T.Vector3(...dir).normalize();
      for (let i = 0; i < p.count; i++) {
        const s = surface(c.x + p.getX(i) * w, c.y + p.getY(i) * h, c.z, lift);
        p.setXYZ(i, s.x, s.y, s.z);
      }
      g.computeVertexNormals();
      const m = new T.MeshStandardMaterial({ map, transparent: true, roughness: .6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
      return new T.Mesh(g, m);
    };

    /* ---------- textures, drawn at high resolution ---------- */
    const irisTex = tex(512, 256, (g, w, h) => { // polar map: top rows are the pupil, bottom rows the rim
      g.fillStyle = '#0b0705'; g.fillRect(0, 0, w, h * .34);
      const grd = g.createLinearGradient(0, h * .34, 0, h);
      grd.addColorStop(0, '#3b2112'); grd.addColorStop(.35, '#7a4a26'); grd.addColorStop(.8, '#5b3419'); grd.addColorStop(1, '#1d110a');
      g.fillStyle = grd; g.fillRect(0, h * .34, w, h * .66);
      for (let i = 0; i < 220; i++) { // radial fibres
        const x = Math.random() * w;
        g.strokeStyle = `rgba(${Math.random() < .5 ? '210,150,90' : '40,22,12'},${.15 + Math.random() * .25})`;
        g.lineWidth = 1 + Math.random() * 2;
        g.beginPath(); g.moveTo(x, h * (.36 + Math.random() * .1)); g.lineTo(x + (Math.random() - .5) * 6, h * (.7 + Math.random() * .22)); g.stroke();
      }
      g.fillStyle = '#140b06'; g.fillRect(0, h * .9, w, h * .1);
    });
    const mouthTex = kind => tex(512, 256, g => {
      g.lineJoin = 'round'; g.lineCap = 'round';
      if (kind === 'calm') { // closed, easy smile with dimples
        g.strokeStyle = '#7b3530'; g.lineWidth = 11;
        g.beginPath(); g.moveTo(118, 104); g.quadraticCurveTo(256, 190, 394, 98); g.stroke();
        g.lineWidth = 6; g.strokeStyle = 'rgba(160,80,60,.55)';
        g.beginPath(); g.moveTo(140, 100); g.quadraticCurveTo(146, 114, 158, 118); g.stroke();
        g.beginPath(); g.moveTo(372, 94); g.quadraticCurveTo(366, 108, 354, 112); g.stroke();
        return;
      }
      const path = new Path2D();
      if (kind === 'o') path.ellipse(256, 138, 44, 54, 0, 0, Math.PI * 2);
      else {
        const big = kind === 'open', top = big ? 70 : 84, bot = big ? 252 : 214, l = big ? 84 : 96, r = 512 - l;
        path.moveTo(l, top); path.quadraticCurveTo(256, top + 26, r, top);
        path.bezierCurveTo(r - 30, bot - 10, l + 30, bot - 10, l, top); path.closePath();
      }
      g.fillStyle = '#4c1414'; g.fill(path);
      g.save(); g.clip(path);
      g.fillStyle = '#d8706a'; g.beginPath(); g.ellipse(256, kind === 'o' ? 190 : 232, 96, 52, 0, 0, Math.PI * 2); g.fill();
      if (kind !== 'o') { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, 512, kind === 'open' ? 136 : 140); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, kind === 'open' ? 128 : 132, 512, 8); }
      g.restore();
      g.strokeStyle = '#8c3b35'; g.lineWidth = 7; g.stroke(path);
    });
    const strandTex = tex(1024, 512, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#6b4429'); grd.addColorStop(1, '#4a2d1a');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * w, sway = (Math.random() - .5) * 26;
        g.strokeStyle = `rgba(${Math.random() < .55 ? '150,104,66' : '36,20,11'},${.18 + Math.random() * .3})`;
        g.lineWidth = .8 + Math.random() * 1.8;
        g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + sway, h * .33, x - sway, h * .66, x + sway * .5, h); g.stroke();
      }
    });
    strandTex.wrapS = T.RepeatWrapping; strandTex.repeat.set(3, 1);
    M.hair.map = strandTex;
    const blushTex = tex(128, 128, (g) => {
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(236,120,110,.35)'); grd.addColorStop(1, 'rgba(236,120,110,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    });
    const tieTex = tex(128, 512, (g, w, h) => {
      g.fillStyle = '#1d2a49'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#dfe6f3'; g.lineWidth = 9;
      for (let y = -w; y < h + w; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + w * .8); g.stroke(); }
    });
    const woodTex = tex(2048, 256, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#5a3d2a'); grd.addColorStop(1, '#46301f');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 140; i++) {
        const y = Math.random() * h, amp = 2 + Math.random() * 6;
        g.strokeStyle = `rgba(${Math.random() < .5 ? '30,18,10' : '120,86,58'},${.12 + Math.random() * .2})`;
        g.lineWidth = .8 + Math.random() * 2.2;
        g.beginPath(); g.moveTo(0, y);
        for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x / (80 + Math.random() * 60) + i) * amp);
        g.stroke();
      }
    });
    woodTex.wrapS = T.RepeatWrapping;
    const monogram = (g, w, h) => {
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = 'italic 500 250px "Bodoni Moda", Didot, Georgia, serif';
      g.shadowColor = 'rgba(240,216,168,.9)'; g.shadowBlur = 50; g.fillStyle = '#F0D8A8';
      g.fillText('fg', w / 2, h / 2);
      g.shadowBlur = 0;
    };
    const lidGlow = tex(1200, 716, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); monogram(g, w, h); });
    const lidTex = tex(1200, 716, (g, w, h) => { // back of the laptop lid: brushed metal, glowing monogram, stack stickers
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#4a5264'); grd.addColorStop(1, '#343b49');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      monogram(g, w, h);
      const st = (x, y, rot, draw) => { g.save(); g.translate(x, y); g.rotate(rot); draw(); g.restore(); };
      const rr = (x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath(); };
      st(190, 160, -.14, () => { g.fillStyle = '#0b0b0b'; g.beginPath(); g.arc(0, 0, 78, 0, 7); g.fill(); g.lineWidth = 9; g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#fff'; g.font = '700 84px Geist, "Segoe UI", sans-serif'; g.fillText('N', 0, 4); });
      st(1010, 166, .17, () => { g.fillStyle = '#1f7a5a'; rr(-86, -72, 172, 144, 30); g.fill(); g.fillStyle = '#7cf0b8'; g.beginPath(); g.moveTo(14, -48); g.lineTo(-36, 14); g.lineTo(0, 14); g.lineTo(-14, 52); g.lineTo(36, -10); g.lineTo(0, -10); g.closePath(); g.fill(); });
      st(990, 556, -.1, () => { g.fillStyle = '#3178c6'; rr(-64, -64, 128, 128, 18); g.fill(); g.fillStyle = '#fff'; g.font = '700 56px Geist, "Segoe UI", sans-serif'; g.fillText('TS', 12, 22); });
      st(210, 556, .1, () => { g.fillStyle = '#d6af69'; g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 2; g.lineTo(Math.cos(a) * 80, Math.sin(a) * 80); } g.closePath(); g.fill(); g.fillStyle = '#0b1220'; g.font = '600 56px "Geist Mono", Consolas, monospace'; g.fillText('AI', 0, 4); });
    });

    /* ---------- the character ---------- */
    const swivel = new T.Group();                  // turns with the chair
    const lean = new T.Group(); lean.position.y = .56; swivel.add(lean); // pivots at the hips
    const body = new T.Group(); body.position.y = -.56; lean.add(body);

    // chair back
    const cs = new T.Shape(), cw = .52, ch = .64, cr = .1;
    cs.moveTo(-cw / 2 + cr, -ch / 2); cs.lineTo(cw / 2 - cr, -ch / 2); cs.quadraticCurveTo(cw / 2, -ch / 2, cw / 2, -ch / 2 + cr);
    cs.lineTo(cw / 2, ch / 2 - cr); cs.quadraticCurveTo(cw / 2, ch / 2, cw / 2 - cr, ch / 2); cs.lineTo(-cw / 2 + cr, ch / 2);
    cs.quadraticCurveTo(-cw / 2, ch / 2, -cw / 2, ch / 2 - cr); cs.lineTo(-cw / 2, -ch / 2 + cr); cs.quadraticCurveTo(-cw / 2, -ch / 2, -cw / 2 + cr, -ch / 2);
    const chair = mesh(new T.ExtrudeGeometry(cs, { depth: .05, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 5, curveSegments: 14 }), M.chair);
    chair.position.set(0, .98, -.22);
    body.add(chair);

    // torso: a lathe profile flattened front to back
    const prof = [[0, .5], [.15, .52], [.165, .62], [.17, .72], [.175, .82], [.182, .9], [.172, .955], [.135, .995], [.075, 1.02], [0, 1.028]].map(([r, y]) => new T.Vector2(r, y));
    const torsoGeo = new T.LatheGeometry(prof, 48); torsoGeo.scale(1.16, 1, .64);
    const torso = mesh(torsoGeo, M.suit); torso.position.z = -.02; body.add(torso);
    [-1, 1].forEach(s => { const pad = ball(M.suit, .072, .058, .064); pad.position.set(s * .192, .948, -.018); body.add(pad); });
    const zFront = y => { const i = prof.findIndex(p => p.y >= y); const a = prof[i - 1], b = prof[i]; return (a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y)) * .64 - .02; };

    // shirt, tie, collar and lapels: flat pieces in a group tilted to the upper-chest slope (pivot at y .93)
    const PY = .93, cz = zFront(PY) + .002;
    const chest = new T.Group(); chest.position.set(0, PY, cz); chest.rotation.x = -.34; body.add(chest);
    const shapeOf = pts => new T.Shape(pts.map(([x, y]) => new T.Vector2(x, y - PY)));
    const flat = (pts, m, z, depth = .004) => {
      const g = new T.ExtrudeGeometry(shapeOf(pts), { depth, bevelEnabled: true, bevelThickness: .002, bevelSize: .002, bevelSegments: 2 });
      const o = mesh(g, m, false); o.position.z = z; return o;
    };
    chest.add(flat([[-.06, 1.01], [.06, 1.01], [0, .78]], M.shirt, -.006));
    const tieMat = new T.MeshStandardMaterial({ map: tieTex, roughness: .55 });
    const tieGeo = new T.ShapeGeometry(shapeOf([[-.013, .965], [.013, .965], [.024, .78], [0, .755], [-.024, .78]]));
    const uv = tieGeo.attributes.uv, tp = tieGeo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (tp.getX(i) + .025) / .05, (tp.getY(i) + PY - .755) / .21);
    const tie = mesh(tieGeo, tieMat, false); tie.position.z = .002; chest.add(tie);
    const knot = ball(tieMat, .02, .019, .013); knot.position.set(0, .968 - PY, .008); chest.add(knot);
    [-1, 1].forEach(s => {
      chest.add(flat([[s * .012, .985], [s * .062, 1.015], [s * .076, .956]], M.shirt, .001, .006));
      chest.add(flat([[s * .064, 1.012], [s * .128, .972], [s * .112, .905], [s * .126, .895], [s * .07, .78], [s * .03, .78]], M.lapel, .003, .006));
    });

    // neck and head (the head pivots at the base of the neck)
    const neck = mesh(new T.CylinderGeometry(.047, .054, .13, 24), M.skin); neck.position.set(0, 1.035, -.005); body.add(neck);
    const headPivot = new T.Group(); headPivot.position.set(0, 1.05, -.005); body.add(headPivot);
    const head = new T.Group(); head.position.y = .145; headPivot.add(head);
    head.add(mesh(fitHead(new T.SphereGeometry(1, 72, 54), 1), M.skin));
    [-1, 1].forEach(s => {
      const ear = ball(M.skin, .027, .041, .02); ear.position.copy(surface(s, -.05, -.06)); ear.position.x += s * -.004; ear.rotation.y = s * .35; head.add(ear);
      const inner = ball(mat(0xbf7c56, .6), .014, .025, .009); inner.position.copy(ear.position); inner.position.x += s * .012; inner.position.z += .004; inner.rotation.y = s * .35; head.add(inner);
    });
    const nose = ball(M.skin, .028, .023, .023); nose.position.copy(surface(0, -.16, .99)).multiplyScalar(1.03); head.add(nose);
    [-1, 1].forEach(s => { const b = decal(blushTex, [s * .56, -.2, .8], .34, .24, 1.004); head.add(b); });
    const mouthTextures = { calm: mouthTex('calm'), smile: mouthTex('smile'), open: mouthTex('open'), o: mouthTex('o') };
    const mouth = decal(mouthTextures.calm, [0, -.49, .87], .62, .3, 1.01);
    head.add(mouth);

    // Charlie Chaplin toothbrush mustache: a short, nose-wide block resting on the upper lip,
    // with a little skin showing between it and the nose
    const shell = (dir, w, h, th, m) => {
      const g = new T.BoxGeometry(1, 1, 1, 14, 6, 2), p = g.attributes.position, c = new T.Vector3(...dir).normalize();
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const edge = Math.max(0, 1 - .9 * Math.pow(Math.pow(Math.abs(2 * x), 6) + Math.pow(Math.abs(2 * y), 6), 1 / 6));
        const q = surface(c.x + x * w, c.y + y * h, c.z, 1 + (z + .5) * th * (.35 + .65 * Math.sqrt(edge)));
        p.setXYZ(i, q.x, q.y, q.z);
      }
      g.computeVertexNormals();
      return mesh(g, m, false);
    };
    head.add(shell([0, -.39, .95], .3, .08, .065, M.stache));

    // eyes: glossy eyeballs with a polar iris cap; catchlights stay put while the eyes move
    const re = .044, eyes = [], lids = [], brows = [], glints = [];
    [-1, 1].forEach(s => {
      const c = surface(s * .375, .07, .924).multiplyScalar(1 - .5 * re / R);
      const eye = new T.Group(); eye.position.copy(c); head.add(eye);
      const ball3 = new T.Mesh(new T.SphereGeometry(re, 40, 28), M.eye); ball3.scale.set(1, 1.08, .92); eye.add(ball3);
      const irisGeo = new T.SphereGeometry(re * 1.006, 48, 12, 0, Math.PI * 2, 0, .64); irisGeo.rotateX(Math.PI / 2); irisGeo.scale(1, 1.08, .92);
      const iris = new T.Mesh(irisGeo, new T.MeshStandardMaterial({ map: irisTex, roughness: .15, envMapIntensity: 1.2 })); eye.add(iris);
      const glint = new T.Mesh(new T.SphereGeometry(.0085, 16, 12), new T.MeshBasicMaterial({ color: 0xffffff }));
      glint.position.set(c.x + .012, c.y + .016, c.z + re * .86); head.add(glint);
      const glint2 = new T.Mesh(new T.SphereGeometry(.0042, 12, 8), new T.MeshBasicMaterial({ color: 0xffffff }));
      glint2.position.set(c.x - .012, c.y - .012, c.z + re * .9); head.add(glint2);
      glints.push(glint, glint2);
      eyes.push(eye);
      const lid = new T.Group(); lid.position.copy(c); head.add(lid);
      const dome = new T.Mesh(new T.SphereGeometry(re * 1.08, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.skin); dome.scale.set(1, 1.08, .95); lid.add(dome);
      const lash = new T.Mesh(new T.TorusGeometry(re * 1.08, .0042, 8, 40, Math.PI), M.lash); lash.rotation.x = Math.PI / 2; lash.scale.set(1, .95, 1); lid.add(lash);
      lids.push(lid);
      const brow = new T.Group(); brow.position.copy(surface(s * .37, .45, .81, 1.02)); head.add(brow);
      const bm = ball(M.brow, .04, .0125, .014, 24), bp = bm.geometry.attributes.position; // bend into an arch
      for (let i = 0; i < bp.count; i++) bp.setY(i, bp.getY(i) + (1 - (bp.getX(i) / .04) ** 2) * .007);
      bm.geometry.computeVertexNormals();
      bm.rotation.z = s * .08; brow.add(bm);
      brow.rotation.x = -.45; brows.push(brow);
    });

    // hair: a cap fitted to the head, then a swept-up quiff built from overlapping clumps
    const capGeo = new T.SphereGeometry(1, 72, 30, 0, Math.PI * 2, 0, 1.32); capGeo.rotateX(-.46);
    head.add(mesh(fitHead(capGeo, 1.04), M.hair));
    const lock = (x, y, z, sx, sy, sz, rx, ry, rz) => {
      const g = new T.SphereGeometry(1, 40, 28); g.rotateX(Math.PI / 2); g.scale(sx, sy, sz);
      const o = mesh(g, M.hair); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); head.add(o);
    };
    lock(0, .128, .03, .152, .078, .13, -.12, 0, -.06);   // main volume over the crown
    lock(.018, .13, .1, .128, .066, .075, .42, 0, -.16);  // front lift of the quiff
    lock(.098, .114, .086, .07, .052, .062, .3, .2, -.62); // curl sweeping to his left
    lock(-.078, .11, .088, .07, .05, .06, .3, -.2, .5);    // softer side on his right
    lock(0, .1, -.07, .142, .076, .1, .2, 0, 0);          // back fill

    // arms: unit cylinders and joints that avatar.js stretches between IK points each frame
    const arm = () => {
      const unit = new T.CylinderGeometry(1, 1, 1, 22, 1, true);
      const upper = mesh(unit, M.suit), fore = mesh(unit, M.suit);
      const shoulder = ball(M.suit, .056, .056, .056, 24), elbow = ball(M.suit, .049, .049, .049, 24);
      const cuff = mesh(new T.CylinderGeometry(.043, .043, .03, 22), M.shirt);
      const hand = new T.Group();
      const palm = ball(M.skin, .033, .036, .019, 24); palm.position.y = .034;
      const thumb = ball(M.skin, .011, .025, .011, 16); thumb.position.set(-.031, .03, .012); thumb.rotation.z = .7;
      const fist = ball(M.skin, .034, .022, .024, 20); fist.position.set(0, .064, .006);
      const open = new T.Group();
      [-.024, -.008, .008, .024].forEach((x, i) => { const f = ball(M.skin, .0085, .027, .0092, 14); f.position.set(x, .092 + (i === 1 || i === 2 ? .006 : 0), 0); f.rotation.z = -x * 4; open.add(f); });
      const point = new T.Group();
      const index = ball(M.skin, .0088, .032, .0095, 14); index.position.set(-.012, .1, .002); point.add(index);
      const curled = ball(M.skin, .026, .018, .02, 16); curled.position.set(.008, .062, .008); point.add(curled);
      hand.add(palm, thumb, fist, open, point);
      [upper, fore, shoulder, elbow, cuff, hand].forEach(o => body.add(o));
      return { upper, fore, shoulder, elbow, cuff, hand, poses: { fist, open, point } };
    };
    const arms = { L: arm(), R: arm() };

    /* ---------- desk, laptop, mug and plant (these stay put) ---------- */
    const world = new T.Scene();
    world.add(swivel);
    const deskMat = new T.MeshStandardMaterial({ map: woodTex, roughness: .5 });
    const top = mesh(new T.BoxGeometry(4.4, .05, .92), deskMat, false); top.position.set(0, .675, .58); world.add(top);
    const front = mesh(new T.BoxGeometry(4.4, 1.1, .04), new T.MeshStandardMaterial({ map: woodTex, roughness: .55, color: lin(0xb89a86) }), false);
    front.position.set(0, .12, 1.02); world.add(front);
    const edge = mesh(new T.BoxGeometry(4.4, .006, .006), mat(0xc49a72, .4), false); edge.position.set(0, .7, 1.04); world.add(edge);

    const laptop = new T.Group(); world.add(laptop);
    const base = mesh(new T.BoxGeometry(.42, .016, .28), M.silver); base.position.set(0, .708, .3); laptop.add(base);
    const keys = mesh(new T.BoxGeometry(.37, .002, .15), mat(0x1a1e26, .6), false); keys.position.set(0, .717, .27); laptop.add(keys);
    const hinge = new T.Group(); hinge.position.set(0, .716, .44); hinge.rotation.x = .26; laptop.add(hinge);
    const lid = mesh(new T.BoxGeometry(.42, .25, .012), M.silver); lid.position.y = .125; hinge.add(lid);
    const lidBack = mesh(new T.PlaneGeometry(.39, .233), new T.MeshStandardMaterial({ map: lidTex, roughness: .35, metalness: .45, emissive: lin(0xffffff), emissiveMap: lidGlow, emissiveIntensity: 1 }), false);
    lidBack.position.set(0, .125, .0065); hinge.add(lidBack);
    const screen = new T.Mesh(new T.PlaneGeometry(.39, .22), new T.MeshBasicMaterial({ color: lin(0x9fc4ff) }));
    screen.position.set(0, .125, -.0065); screen.rotation.y = Math.PI; hinge.add(screen);

    const mugG = new T.Group(); mugG.position.set(.48, .7, .52); world.add(mugG);
    const cup = mesh(new T.CylinderGeometry(.036, .032, .092, 40), M.ceramic); cup.position.y = .046; mugG.add(cup);
    const ring = mesh(new T.CylinderGeometry(.0366, .0356, .012, 40), M.gold, false); ring.position.y = .066; mugG.add(ring);
    const handle = mesh(new T.TorusGeometry(.023, .007, 12, 24, Math.PI), M.ceramic); handle.position.set(.036, .048, 0); handle.rotation.z = -Math.PI / 2; mugG.add(handle);
    const coffee = mesh(new T.CircleGeometry(.032, 32), mat(0x3b2416, .2), false); coffee.rotation.x = -Math.PI / 2; coffee.position.y = .088; mugG.add(coffee);

    const plant = new T.Group(); plant.position.set(-.5, .7, .5); world.add(plant);
    const potM = mesh(new T.CylinderGeometry(.052, .04, .09, 32), M.pot); potM.position.y = .045; plant.add(potM);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2, tilt = .35 + (i % 3) * .18;
      const leafM = ball(M.leaf, .018, .07, .01, 16);
      const holder = new T.Group(); holder.position.y = .09; holder.rotation.set(Math.cos(a) * tilt, 0, Math.sin(a) * tilt);
      leafM.position.y = .06; holder.add(leafM); plant.add(holder);
    }

    return {
      world, swivel, lean, headPivot, head, eyes, lids, brows, glints, mouth, mouthTextures, arms, screen, hinge,
      chestTop: new T.Vector3(0, .95, 0),
      shoulders: { L: new T.Vector3(-.2, .945, -.015), R: new T.Vector3(.2, .945, -.015) },
    };
  };

  // a soft studio room, prefiltered into the environment map so glossy parts have something to reflect
  FG3D.studio = function (T) {
    const s = new T.Scene(), lin = hex => new T.Color(hex).convertSRGBToLinear();
    s.add(new T.Mesh(new T.BoxGeometry(12, 7, 12), new T.MeshBasicMaterial({ color: lin(0x1c2436), side: T.BackSide })));
    const panel = (w, h, pos, rot, hex, k) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: lin(hex).multiplyScalar(k), side: T.DoubleSide }));
      m.position.set(...pos); m.rotation.set(...rot); s.add(m);
    };
    panel(5, 2.5, [0, 3.4, 0], [Math.PI / 2, 0, 0], 0xffffff, 2.2);
    panel(3.5, 2.5, [-5.9, 1.6, 0], [0, Math.PI / 2, 0], 0x9fbfff, 1.6);
    panel(2.5, 2, [5.9, 1.4, 1.2], [0, -Math.PI / 2, 0], 0xffd29a, 2.2);
    panel(4, 2, [0, 1.4, 5.9], [0, Math.PI, 0], 0xffffff, 1.1);
    return s;
  };
})();
