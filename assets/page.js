// The booking link. Set it to the cal.com URL once it exists; every button marked data-cal on every page follows it.
// Until then those buttons keep their mailto (advercal.co@gmail.com, subject "Free consultation").
const CAL_URL = '';

(() => {
  if (CAL_URL) for (const a of document.querySelectorAll('a[data-cal]')) { a.href = CAL_URL; a.target = '_blank'; a.rel = 'noopener'; }

  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window)) return;

  // The docked action stays in thumb reach, and steps aside while another copy of it, or a form, is on screen.
  const dock = document.querySelector('.dock');
  if (dock) {
    const seen = new Set();
    const dockIo = new IntersectionObserver((list) => {
      for (const e of list) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
      dock.classList.toggle('away', seen.size > 0);
    }, { threshold: 0.2 });
    for (const el of document.querySelectorAll('.hero-act, .close, .foot, form')) dockIo.observe(el);
  }

  if (still) return;

  // Each drawn object loops while it is in view: it starts from its first frame when it arrives and pauses when it leaves.
  const loops = (el) => el.getAnimations({ subtree: true }).filter((a) => a.timeline === document.timeline && a.effect?.getTiming().iterations === Infinity);
  const sceneIo = new IntersectionObserver((list) => {
    for (const e of list) {
      const el = e.target;
      if (e.isIntersecting) {
        if (el.classList.contains('off') || !el.dataset.ran) for (const a of loops(el)) { a.currentTime = 0; a.play(); }
        el.dataset.ran = '1';
        el.classList.remove('off');
      } else if (el.dataset.ran) el.classList.add('off');
    }
  }, { threshold: 0.25 });
  for (const el of document.querySelectorAll('.scene')) sceneIo.observe(el);

  // Where the browser cannot tie animation to the scroll, the same moves play once by time as each piece arrives.
  if (window.CSS && CSS.supports('animation-timeline: view()')) return;
  root.classList.add('once');
  const onceIo = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { e.target.classList.add('play'); onceIo.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  for (const el of document.querySelectorAll('.reveal, .close, .foot')) onceIo.observe(el);
})();
