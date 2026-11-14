// Plays the work clips only while they are on screen, and never under reduced motion (the poster stays).
// Each [data-frame] gets one pause button. A frame holding several clips (data-venue on each) plays the one
// whose [data-for] row crosses the middle of the screen.
(() => {
  if (!('IntersectionObserver' in window)) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const frames = [...document.querySelectorAll('[data-frame]')];
  const icon = '<svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.6" height="12" rx="1"/><rect x="9.4" y="2" width="3.6" height="12" rx="1"/></svg><svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.2v11.6c0 .6.7 1 1.2.7l9-5.8c.5-.3.5-1.1 0-1.4l-9-5.8C4.7 1.2 4 1.6 4 2.2z"/></svg>';
  const state = new Map();

  const active = (f) => f.querySelector('video.on') || f.querySelector('video');
  const sync = (f) => {
    const s = state.get(f);
    f.querySelectorAll('video').forEach((v) => {
      const go = !still.matches && s.seen && !s.held && !document.hidden && v === active(f);
      if (go) { if (v.paused) v.play().catch(() => {}); } else if (!v.paused) v.pause();
    });
  };

  const io = new IntersectionObserver((list) => list.forEach((e) => { state.get(e.target).seen = e.isIntersecting; sync(e.target); }), { threshold: 0.2 });
  frames.forEach((f) => {
    state.set(f, { seen: false, held: false });
    io.observe(f);
    if (still.matches) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hold'; b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Pause the clip'); b.innerHTML = icon;
    b.addEventListener('click', () => {
      const s = state.get(f); s.held = !s.held;
      b.setAttribute('aria-pressed', String(s.held));
      b.setAttribute('aria-label', s.held ? 'Play the clip' : 'Pause the clip');
      sync(f);
    });
    f.append(b);
  });

  // Rows that pick which clip a shared frame shows.
  const rows = [...document.querySelectorAll('[data-for]')];
  if (rows.length) {
    const pick = new IntersectionObserver((list) => list.forEach((e) => {
      if (!e.isIntersecting) return;
      const slug = e.target.dataset.for;
      rows.forEach((r) => r.classList.toggle('is-on', r === e.target));
      frames.forEach((f) => {
        const next = f.querySelector(`video[data-venue="${slug}"]`);
        if (!next || next.classList.contains('on')) return;
        f.querySelectorAll('video').forEach((v) => v.classList.toggle('on', v === next));
        (f.closest('.panel') || f).dataset.venue = slug;
        if (!still.matches) { try { next.currentTime = 0; } catch {} }
        sync(f);
      });
    }), { rootMargin: '-50% 0px -50% 0px' });
    rows.forEach((r) => pick.observe(r));
  }

  document.addEventListener('visibilitychange', () => frames.forEach(sync));
  still.addEventListener?.('change', () => frames.forEach(sync));
})();
