// The contact page's email composer: the visitor's choices become the email they send us.
// Without this file the choices stay hidden and the page shows a ready email and the address.

document.documentElement.classList.add("js");

const form = document.getElementById("brief-form");
if (form) {
  const to = "advercalcompany@gmail.com";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const subjectEl = document.getElementById("letter-subject");
  const bodyEl = document.getElementById("letter-body");
  const send = document.getElementById("brief-send");
  const letter = document.querySelector(".letter");

  const clean = (s) => String(s || "").replace(/[\r\n]+/g, " ").trim();
  const nouns = { trade: "trade business", other: "local business" };
  const withArticle = (noun) => (/^[aeiou]/.test(noun) ? "an " : "a ") + noun;

  const compose = () => {
    const data = new FormData(form);
    const kind = data.get("kind");
    const noun = kind ? nouns[kind] || kind : "local business";
    const need = data.get("need");
    const care = data.get("care") === "yes";
    const call = data.get("call") === "yes";
    const when = data.get("when");
    const name = clean(data.get("name"));
    const org = clean(data.get("org"));
    const site = clean(data.get("site"));
    const book = clean(data.get("book"));

    // Subject
    const forWhom = org || withArticle(noun);
    const work = { new: "New website", redo: "Website redo", changes: "Website changes" }[need];
    let subject;
    if (work && care) subject = `${work} and monthly care for ${forWhom}`;
    else if (work) subject = `${work} for ${forWhom}`;
    else if (care) subject = `Monthly care for ${forWhom}`;
    else subject = `Website question from ${forWhom}`;

    // Body, one sentence per choice
    const lines = [];
    const intro = `We run ${withArticle(noun)}${org ? ` called ${org}` : ""}`;
    const wants = {
      new: "We need a website.",
      redo: "We'd like our current site redone.",
      changes: "We need some changes to our site.",
    }[need];
    if (wants) lines.push(`${intro}. ${wants}`);
    else if (care) lines.push(`${intro}.`);
    else lines.push(`${intro} and would like to talk about a website.`);
    if (care) {
      lines.push(need === "new" || need === "redo" ? "We'd also like monthly care once it's live."
        : need === "changes" ? "We'd also like monthly care after that."
        : "We'd like monthly care for our site.");
    }
    if (book) lines.push(`We take bookings or orders through ${book}.`);
    const timing = {
      soon: "We'd like to start as soon as we can.",
      month: "We're hoping to start in a month or two.",
      later: "There's no rush on our side.",
    }[when];
    if (timing) lines.push(timing);
    if (site) lines.push(`You can see us at ${site}.`);
    const ask = call ? "A short call first would help. Could you send us a written quote?" : "Could you send us a written quote?";
    const body = ["Hi AdverCal,", lines.join(" "), ask].concat(name ? [name] : []).join("\n\n");
    return { subject, body };
  };

  const render = () => {
    const { subject, body } = compose();
    if (subjectEl.textContent !== subject) subjectEl.textContent = subject;
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
