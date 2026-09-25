/* Page motion: hero parallax, scroll-linked tech ribbon, progress fallback, card sheen and tilt,
   compact nav with a gliding pill, active nav link and copy buttons. Scrolling itself stays native
   (compositor-threaded), with one passive listener batched per frame; html.scrolling pauses the
   ambient backdrop while you scroll so every frame goes to the scroll. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineQ = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = s => document.querySelector(s);
  const hero = $('.hero'), office = $('#office'), scene = $('#scene'), intro = $('.intro'), bubble = $('#bubble'), cue = $('.cue');
  const ribbon = $('.ribbon'), track = $('.ribbon .track'), progress = $('.progress'), nav = $('.nav');
  const cssProgress = !reduce && window.CSS && CSS.supports('animation-timeline: scroll()');

  /* ---------- scroll ---------- */
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  function update() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    if (!reduce) {
      const hh = hero.offsetHeight;
      if (y < hh + 60) {
        const p = Math.min(1, y / hh);
        office.style.transform = `translate3d(0,${(y * .35).toFixed(1)}px,0) scale(1.06)`;
        scene.style.transform = `translate3d(0,${(y * .12).toFixed(1)}px,0)`;
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
  let idle = 0;
  addEventListener('scroll', () => {
    if (!idle) document.documentElement.classList.add('scrolling');
    clearTimeout(idle);
    idle = setTimeout(() => { idle = 0; document.documentElement.classList.remove('scrolling'); }, 180);
    onScroll();
  }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();

  /* ---------- office footage: plays only while the hero is on screen ---------- */
  const vid = document.getElementById('officeVideo');
  if (vid) {
    if (reduce) { vid.removeAttribute('autoplay'); vid.pause(); } // the poster frame stays
    else new IntersectionObserver(([e]) => { if (e.isIntersecting) vid.play().catch(() => {}); else vid.pause(); }).observe(hero);
  }

  /* ---------- depth: the office background drifts against the cursor ---------- */
  if (!reduce) hero.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - .5, my = (e.clientY - r.top) / r.height - .5;
    office.style.translate = `${(-mx * 26).toFixed(1)}px ${(-my * 14).toFixed(1)}px`; // the 3D camera adds its own parallax
  }, { passive: true });

  /* ---------- project cards: the specular bloom follows the pointer, the card lifts and tilts ---------- */
  if (fineQ.matches && !reduce) {
    let raf = 0, last = null;
    document.addEventListener('pointermove', e => {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = last.target.closest && last.target.closest('.card');
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (last.clientX - r.left) / r.width, y = (last.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        el.style.transform = `perspective(1100px) translateY(-6px) rotateX(${((.5 - y) * 4).toFixed(2)}deg) rotateY(${((x - .5) * 5).toFixed(2)}deg)`;
      });
    }, { passive: true });
    document.querySelectorAll('.card').forEach(c => c.addEventListener('pointerleave', () => { c.style.transform = ''; }));
  }

  /* ---------- nav: a liquid glass pill glides to the hovered or current section link ---------- */
  const pill = $('.nav-pill'), secLinks = [...document.querySelectorAll('.links .sec')];
  let hovered = null;
  function placePill() {
    const target = hovered || secLinks.find(a => a.classList.contains('on'));
    if (!pill || !target || !target.offsetWidth) { if (pill) pill.style.opacity = '0'; return; }
    const box = target.parentElement.getBoundingClientRect(), r = target.getBoundingClientRect();
    pill.style.width = r.width.toFixed(1) + 'px';
    pill.style.transform = `translate(${(r.left - box.left).toFixed(1)}px,${(r.top - box.top + (r.height - 36) / 2).toFixed(1)}px)`;
    pill.style.opacity = '1';
  }
  secLinks.forEach(a => {
    a.addEventListener('pointerenter', () => { hovered = a; placePill(); });
    a.addEventListener('pointerleave', () => { hovered = null; placePill(); });
  });
  nav.addEventListener('transitionend', e => { if (e.target === nav) placePill(); });
  addEventListener('resize', placePill, { passive: true });

  /* ---------- active nav link ---------- */
  const links = [...document.querySelectorAll('.links a[href^="#"]:not(.cta)')];
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { const a = byId.get(en.target.id); links.forEach(l => l.classList.toggle('on', l === a)); placePill(); }
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
