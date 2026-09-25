/* Office background: an evening office with a city window, generated once as inline SVG.
   Seeded so the skyline is identical on every load; no image download needed. */
(() => {
  const host = document.getElementById('office');
  if (!host) return;
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const f = n => Math.round(n * 10) / 10;

  const WX0 = 250, WX1 = 1350, WY0 = 60, SILL = 700; // floor-to-ceiling window

  // skyline: a hazy far layer, then a near layer with lit windows
  let far = '', near = '', lit = '';
  for (let x = WX0 - 20; x < WX1;) {
    const w = 34 + rnd() * 56, h = 90 + rnd() * 210;
    far += `<rect x="${f(x)}" y="${f(SILL - h)}" width="${f(w)}" height="${f(h)}"/>`;
    x += w + 2;
  }
  for (let x = WX0 - 30; x < WX1;) {
    const w = 60 + rnd() * 70, h = 170 + rnd() * 300, top = SILL - h;
    near += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}"/>`;
    if (rnd() > .6) near += `<rect x="${f(x + w * .4)}" y="${f(top - 26)}" width="3" height="26"/>`;
    for (let wy = top + 14; wy < SILL - 10; wy += 17)
      for (let wx = x + 8; wx < x + w - 8; wx += 13)
        if (rnd() < .26) lit += `<rect x="${f(wx)}" y="${f(wy)}" width="6" height="8" fill="${rnd() < .78 ? '#F6D08C' : '#A9C8FF'}" opacity="${f(.4 + rnd() * .5)}"/>`;
    x += w + 6 + rnd() * 10;
  }

  let mullions = '';
  for (let i = 0; i <= 5; i++) mullions += `<rect x="${WX0 - 7 + i * 220}" y="${WY0 - 10}" width="14" height="${SILL - WY0 + 10}"/>`;

  // bookshelf on the left wall
  let books = '', boards = '';
  const colors = ['#2B3F6B', '#6B2E3A', '#3E5A4A', '#8C6A3A', '#4A4F63', '#233152', '#A0864F', '#5B6E8C'];
  [300, 420, 540, 660].forEach(base => {
    boards += `<rect x="40" y="${base}" width="190" height="8" fill="#1D2740"/>`;
    for (let x = 50; x < 216;) {
      if (rnd() < .1) { x += 22; continue; }
      const w = 9 + rnd() * 12, h = 56 + rnd() * 36;
      books += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h)}" rx="1.5" fill="${pick(colors)}"/>`;
      x += w + 1.5;
    }
  });

  // floor plant beside the shelf
  let leaves = '';
  for (let i = 0; i < 9; i++) {
    const a = (-150 + i * 15 + rnd() * 8) * Math.PI / 180, len = 70 + rnd() * 60;
    const cx = 290 + Math.cos(a) * len * .6, cy = 700 + Math.sin(a) * len;
    leaves += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(len * .28)}" ry="${f(len * .5)}" transform="rotate(${f(a * 180 / Math.PI + 90)} ${f(cx)} ${f(cy)})" fill="${i % 2 ? '#1E4A3C' : '#2A634F'}"/>`;
  }

  // wall screen with a dashboard: a nod to the analytics work
  let pts = '', bars = '';
  for (let i = 0; i <= 10; i++) pts += `${1394 + i * 16.4},${f(330 - i * 4 - rnd() * 16)} `;
  for (let i = 0; i < 6; i++) { const h = 10 + rnd() * 22; bars += `<rect x="${1396 + i * 29}" y="${f(370 - h)}" width="16" height="${f(h)}" rx="2" fill="#D6AF69" opacity=".6"/>`; }

  let pendants = '';
  [560, 800, 1040].forEach(x => {
    pendants += `<ellipse cx="${x}" cy="112" rx="150" ry="120" fill="url(#oWarm)" opacity=".45"/>
      <rect x="${x - 1}" y="0" width="2" height="78" fill="#2A3246"/>
      <path d="M${x - 30} 104 Q${x} 56 ${x + 30} 104Z" fill="#1C2536"/>
      <ellipse cx="${x}" cy="104" rx="16" ry="5" fill="#FFE2B0"/>`;
  });

  host.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="oSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#081230"/><stop offset=".48" stop-color="#15234B"/><stop offset=".74" stop-color="#2E3862"/><stop offset=".92" stop-color="#B9845C"/><stop offset="1" stop-color="#EDBB7B"/></linearGradient>
    <linearGradient id="oWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F182B"/><stop offset="1" stop-color="#0A111E"/></linearGradient>
    <linearGradient id="oNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#111B33"/><stop offset="1" stop-color="#0A1122"/></linearGradient>
    <linearGradient id="oFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D1424"/><stop offset="1" stop-color="#060A13"/></linearGradient>
    <radialGradient id="oWarm"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".55"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>
    <clipPath id="oWin"><rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${SILL - WY0}"/></clipPath>
  </defs>
  <rect width="1600" height="900" fill="url(#oWall)"/>
  <g clip-path="url(#oWin)">
    <rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${SILL - WY0}" fill="url(#oSky)"/>
    <circle cx="1170" cy="150" r="60" fill="#F4E6C8" opacity=".08"/>
    <circle cx="1170" cy="150" r="17" fill="#F4E6C8" opacity=".85"/>
    <g fill="#1B2848" opacity=".92">${far}</g>
    <g fill="url(#oNear)">${near}</g>
    ${lit}
    <path d="M${WX0 + 120} ${WY0} L${WX0 + 260} ${WY0} L${WX0 + 60} ${SILL} L${WX0 - 80} ${SILL}Z" fill="#fff" opacity=".035"/>
    <path d="M${WX0 + 620} ${WY0} L${WX0 + 680} ${WY0} L${WX0 + 480} ${SILL} L${WX0 + 420} ${SILL}Z" fill="#fff" opacity=".03"/>
  </g>
  <g fill="#0A0F1A">${mullions}<rect x="${WX0}" y="168" width="${WX1 - WX0}" height="10"/></g>
  <rect x="${WX0 - 14}" y="${SILL}" width="${WX1 - WX0 + 28}" height="18" fill="#141C2E"/>
  <rect x="30" y="170" width="210" height="600" fill="#121A2C"/>
  <rect x="40" y="180" width="190" height="580" fill="#0D1424"/>
  ${boards}${books}
  <rect x="0" y="770" width="1600" height="130" fill="url(#oFloor)"/>
  <rect x="${WX0}" y="770" width="${WX1 - WX0}" height="70" fill="#2E3862" opacity=".08"/>
  ${leaves}
  <path d="M262 700 L318 700 L312 772 L268 772Z" fill="#1A2236"/><rect x="258" y="694" width="64" height="10" rx="3" fill="#232C42"/>
  <ellipse cx="1480" cy="540" rx="230" ry="260" fill="url(#oWarm)" opacity=".7"/>
  <rect x="1380" y="246" width="192" height="134" rx="8" fill="#0B1120" stroke="#1F2A40" stroke-width="3"/>
  <polyline points="${pts.trim()}" fill="none" stroke="#8FB8FF" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  ${bars}
  <path d="M1450 470 L1510 470 L1528 512 L1432 512Z" fill="#D9B77A"/>
  <rect x="1478" y="512" width="4" height="258" fill="#2A3246"/>
  <ellipse cx="1480" cy="772" rx="30" ry="6" fill="#2A3246"/>
  ${pendants}
</svg>`;
})();
