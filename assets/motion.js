// Motion fallback. Where the browser ties animation to the scroll (CSS scroll timelines), this file
// does nothing. Elsewhere it marks the page .once and plays each scene once as it arrives, ending on
// the same still the CSS shows without it. Without this file every page shows those stills.
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.CSS && CSS.supports("animation-timeline: view()")) return;
  if (!("IntersectionObserver" in window)) return;

  // on phones the hero's drawn object sits below the first screen, so its scene waits for it too
  const phone = matchMedia("(max-width: 767px)").matches;
  const scenes = document.querySelectorAll(`.cap, .facts > div, .steps li, .tile${phone ? ", .stage" : ""}`);
  const play = (el) => el.classList.add("play");
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      play(e.target);
      io.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -12% 0px" });

  // anything already on screen plays at once, so nothing on view blinks to its start
  const fold = innerHeight * 0.88;
  for (const el of scenes) {
    if (el.getBoundingClientRect().top < fold) play(el);
    else io.observe(el);
  }
  document.documentElement.classList.add("once");
})();
