// AdverCal: section entrances, the brief builder, and the masthead clip.
// The page reads fine without this file: nothing is hidden until the script runs.

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Entrances: only things below the first screen wait for the scroll.
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.remove("pending");
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -10% 0px" });

  const groups = new Map();
  for (const el of document.querySelectorAll(".reveal")) {
    if (el.getBoundingClientRect().top < innerHeight) continue;
    const section = el.closest("section") || document.body;
    const i = groups.get(section) || 0;
    groups.set(section, i + 1);
    el.style.setProperty("--d", `${Math.min(i, 5) * 80}ms`);
    el.classList.add("pending");
    io.observe(el);
  }
}

// The clip in the masthead stays on its poster frame for reduced motion.
const clip = document.querySelector(".mosaic video");
if (clip && reduce) { clip.removeAttribute("autoplay"); clip.pause(); }

// Brief builder: the visitor's choices become the email they send us.
const form = document.getElementById("brief-form");
if (form) {
  const to = "advercalcompany@gmail.com";
  const subjectEl = document.getElementById("letter-subject");
  const bodyEl = document.getElementById("letter-body");
  const send = document.getElementById("brief-send");
  const letter = bodyEl.closest(".letter");

  const list = (items) =>
    items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
  const clean = (s) => s.replace(/[\r\n]+/g, " ").trim();

  const render = () => {
    const data = new FormData(form);
    const kind = data.get("kind") || "something else";
    const needs = data.getAll("need");
    const when = data.get("when") || "within a month";
    const name = clean(data.get("name") || "");
    const org = clean(data.get("org") || "");
    const site = clean(data.get("site") || "");

    const who = {
      "a small business": "I run a small business",
      "an academic or researcher": "I'm an academic and I'd like a homepage for my research",
      "a freelancer or artist": "I'm a freelancer and I'd like a site for my work",
      "something else": "I have a project in mind",
    }[kind];

    const wants = needs.length ? needs : ["some help with a website"];
    const what = needs.includes("a new website") ? "A new website" : needs.includes("a redo of my current site") ? "A website redo" : "Website help";
    const forWhom = {
      "a small business": "a small business",
      "an academic or researcher": "an academic",
      "a freelancer or artist": "a freelancer",
      "something else": "a new project",
    }[kind];
    const subject = `${what} for ${org || forWhom}`;

    const lines = [
      `Hi AdverCal,`,
      ``,
      `${who}${org ? ` (${org})` : ""}. I need ${list(wants)}, ${when}.`,
    ];
    if (site) lines.push(``, `My current site: ${site}`);
    lines.push(``, `Could you send me a quote?`);
    if (name) lines.push(``, name);
    const body = lines.join("\n");

    subjectEl.textContent = subject;
    bodyEl.textContent = body;
    send.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener("input", render);
  form.addEventListener("change", () => {
    render();
    if (reduce) return;
    letter.classList.remove("bump");
    void letter.offsetWidth;
    letter.classList.add("bump");
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  render();
}
