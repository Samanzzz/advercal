// The contact form. Without this file it posts straight to Web3Forms, which sends the visitor
// to thanks.html. With it, the subject is built from the choices and the result shows in place.

const form = document.getElementById("contact-form");
if (form) {
  const endpoint = form.action;
  const pane = document.getElementById("form-pane");
  const subjectInput = document.getElementById("f-subject");
  const email = document.getElementById("f-email");
  const emailError = document.getElementById("f-email-err");
  const status = document.getElementById("form-status");
  const submit = document.getElementById("form-submit");
  const sent = document.getElementById("form-sent");
  const address = "advercalcompany@gmail.com";

  form.noValidate = true;

  const clean = (s) => String(s || "").replace(/[\r\n]+/g, " ").trim();
  const nouns = { Trade: "trade business", Other: "local business" };
  const withArticle = (noun) => (/^[aeiou]/.test(noun) ? "an " : "a ") + noun;

  // "New website and monthly care for Corner Cup", "Website question from a clinic"
  const subject = () => {
    const data = new FormData(form);
    const kind = data.get("Kind of business");
    const noun = kind ? nouns[kind] || kind.toLowerCase() : "local business";
    const org = clean(data.get("Business name"));
    const forWhom = org || withArticle(noun);
    const work = {
      "A new site": "New website",
      "Redo our site": "Website redo",
      "Changes to our site": "Website changes",
    }[data.get("Need")];
    const care = data.get("Monthly care") === "Yes";
    if (work && care) return `${work} and monthly care for ${forWhom}`;
    if (work) return `${work} for ${forWhom}`;
    if (care) return `Monthly care for ${forWhom}`;
    return `Website question from ${forWhom}`;
  };

  const showEmailError = (message) => {
    emailError.textContent = message;
    emailError.hidden = !message;
    email.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const checkEmail = () => {
    if (email.validity.valueMissing) return "Enter your email so we can reply.";
    if (!email.validity.valid) return "Enter an email address like name@example.com.";
    return "";
  };

  const showError = () => {
    status.replaceChildren(
      "It didn't send. Try again in a moment, or write to us at ",
      Object.assign(document.createElement("a"), { href: `mailto:${address}`, textContent: address }),
      ".",
    );
  };

  form.addEventListener("change", () => { subjectInput.value = subject(); });
  form.addEventListener("input", (e) => {
    if (e.target === form.elements["Business name"]) subjectInput.value = subject();
    if (e.target === email && email.getAttribute("aria-invalid") === "true") showEmailError(checkEmail());
  });

  let sending = false;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;
    status.replaceChildren();
    const problem = checkEmail();
    showEmailError(problem);
    if (problem) { email.focus(); return; }

    subjectInput.value = subject();
    const data = Object.fromEntries(new FormData(form));
    delete data.redirect; // the redirect is only for the plain post

    sending = true;
    submit.textContent = "Sending";
    submit.setAttribute("aria-disabled", "true");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`);
      document.getElementById("sent-email").textContent = clean(email.value);
      pane.classList.add("is-sent");
      sent.hidden = false;
      sent.querySelector("h2").focus();
      form.reset();
    } catch {
      showError();
    } finally {
      sending = false;
      submit.textContent = "Send";
      submit.removeAttribute("aria-disabled");
    }
  });

  subjectInput.value = subject();
}
