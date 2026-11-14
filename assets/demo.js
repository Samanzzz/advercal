// Loaded in the head, before the body paints. Marks the page as scripted so each drawn site can wait at its first
// frame, then starts it once a third of it is on screen. Without this script, or under reduced motion, every drawn
// site shows its finished state.
document.documentElement.classList.add('js');
addEventListener('DOMContentLoaded', () => {
  const demos = document.querySelectorAll('.demo');
  if (!('IntersectionObserver' in window)) { demos.forEach((d) => d.classList.add('is-on')); return; }
  const io = new IntersectionObserver((list) => list.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-on'); io.unobserve(e.target); }
  }), { threshold: 0.35 });
  demos.forEach((d) => io.observe(d));
});
