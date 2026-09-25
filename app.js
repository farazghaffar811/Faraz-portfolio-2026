/* Page motion: hero parallax, scroll-linked tech ribbon, progress fallback, glass sheen,
   card tilt, active nav link and copy buttons. One passive scroll listener, batched per frame. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineQ = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = s => document.querySelector(s);
  const hero = $('.hero'), office = $('#office'), scene = $('#scene'), intro = $('.intro'), bubble = $('#bubble'), cue = $('.cue');
  const ribbon = $('.ribbon'), track = $('.ribbon .track'), progress = $('.progress');
  const cssProgress = !reduce && window.CSS && CSS.supports('animation-timeline: scroll()');

  /* ---------- scroll ---------- */
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  function update() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    if (!reduce) {
      const hh = hero.offsetHeight;
      if (y < hh + 60) {
        const p = Math.min(1, y / hh);
        office.style.transform = `translate3d(0,${(y * .35).toFixed(1)}px,0) scale(1.06)`;
        scene.style.transform = `translate3d(0,${(y * .12).toFixed(1)}px,0) scale(${(1 - p * .06).toFixed(4)})`;
        intro.style.opacity = Math.max(0, 1 - p * 1.6).toFixed(3);
        intro.style.translate = `0 ${(-y * .25).toFixed(1)}px`;
        bubble.style.translate = `0 ${(-y * .25).toFixed(1)}px`;
        cue.style.opacity = Math.max(0, 1 - p * 3).toFixed(3);
      }
      const r = ribbon.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const q = (vh - r.top) / (vh + r.height);
        track.style.transform = `translate3d(${(-q * (track.scrollWidth - ribbon.clientWidth) * .6).toFixed(1)}px,0,0)`;
      }
    }
    if (!cssProgress) {
      const max = document.documentElement.scrollHeight - vh;
      progress.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();

  /* ---------- depth: the office drifts against the cursor ---------- */
  if (!reduce) hero.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - .5, my = (e.clientY - r.top) / r.height - .5;
    office.style.translate = `${(-mx * 26).toFixed(1)}px ${(-my * 14).toFixed(1)}px`;
    scene.style.translate = `${(mx * 8).toFixed(1)}px 0`;
  }, { passive: true });

  /* ---------- liquid glass: sheen follows the pointer, cards tilt ---------- */
  if (fineQ.matches && !reduce) {
    let raf = 0, last = null;
    document.addEventListener('pointermove', e => {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = last.target.closest && last.target.closest('.glass');
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (last.clientX - r.left) / r.width, y = (last.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (el.classList.contains('card')) el.style.transform = `perspective(1000px) rotateX(${((.5 - y) * 5).toFixed(2)}deg) rotateY(${((x - .5) * 6).toFixed(2)}deg)`;
      });
    }, { passive: true });
    document.querySelectorAll('.card').forEach(c => c.addEventListener('pointerleave', () => { c.style.transform = ''; }));
  }

  /* ---------- active nav link ---------- */
  const links = [...document.querySelectorAll('.links a[href^="#"]:not(.cta)')];
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { const a = byId.get(en.target.id); links.forEach(l => l.classList.toggle('on', l === a)); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'work', 'experience', 'skills', 'contact'].forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const node = document.getElementById(b.dataset.copy), text = node.textContent.trim();
    const done = label => { b.textContent = label; setTimeout(() => { b.textContent = 'Copy'; }, 1600); };
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents(node);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected');
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => done('Copied'), fallback);
    else fallback();
  }));
})();
