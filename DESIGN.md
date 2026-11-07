# Design

## Product
advercal.com, the website of AdverCal, a web studio run by three engineers from Apple, Amazon, UC San Diego and the University of Pennsylvania. It speaks to owners and managers of restaurants, bars, clubs, clinics and other local businesses anywhere in the US. They read it on a phone, often between services, and should leave knowing what they would get, that they own it, and how to write to us.

## Stack
Plain static HTML and CSS served by GitHub Pages from `main` (`CNAME` is `advercal.com`). One stylesheet, `assets/site.css`. One script, `assets/site.js`, loaded only on `contact.html`, which composes a mailto email. Every page reads correctly without it. Each page carries its own strict CSP in a meta tag.

## Canon
Its own system, with Apple's Human Interface Guidelines as the reference for access minimums (contrast, target size, text scaling). The writing rules are the studio's house rules, checked with `node tools/writing.mjs --page <file>` from a WebDog checkout.

## Tokens
All in `:root` at the top of `assets/site.css`, with dark values under `prefers-color-scheme: dark`.
- Color, light: ground `#f2f3f0`, band `#e4e8e2`, surface `#ffffff`, ink `#141815`, secondary ink `#454d47` and `#5c645e`, line `#d0d5cd`, accent bottle green `#1d5a44`.
- Color, dark: ground `#101311`, band `#181d1a`, surface `#1d2320`, ink `#e8ece9`, secondary ink `#b2bbb5` and `#959e98`, line `#2d3530`, accent mint `#84c9a9`.
- Type: Switzer (Fontshare) for everything we say. Zodiak appears only inside the drawn restaurant site, as that business's own face. Sizes: caption 14px, body 17px, sub 22px, h2 28 to 38px, h1 38 to 64px.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96. Gutter 16px on phones, 32 from 768, 40 from 1100.
- Radius: 10px controls, 18px panes.
- Motion: none.

## Assets and licenses
Switzer and Zodiak from Fontshare under the ITF Free Font License. No photographs and no third-party images. Banned: SF Pro, New York, SF Mono, SF Symbols and anything else from Apple's Design Resources, including traced device bezels.

## Surfaces
Home, Sites we build (`services.html`), Monthly care (`care.html`), How we work (`how.html`), Contact (`contact.html`). Each page leads with one drawn object of what the owner receives: a restaurant site on a phone, a clinic site in a browser, the monthly report email and its PDF, the private preview and a change request, the composed email.

## Writing
Sentence case everywhere. Plain sentences an owner would repeat to a friend. State only what the studio really does; no client names, counts, testimonials, prices or promises beyond a written quote first.

## Decisions
- 2026-11-03: multi-page site replaces the single scrolling page. Rejected: one long page, which hid the care and process detail behind scrolling.
- 2026-11-03: product-led direction chosen over a type-led printed rate card. Each page shows what the owner gets before describing it.
- 2026-11-03: audience narrowed to restaurants, bars, clubs, clinics and local businesses nationwide. Rejected: freelancers, academics and the Southern California framing.
- 2026-11-03: drawn sites carry no invented business names, and no real business appears until it signs.
- 2026-11-07: no partner names on the site; the footer says three engineers from Apple, Amazon, UC San Diego and the University of Pennsylvania (Jeevan).
- 2026-11-07: the name is spelled AdverCal, with the capital C, everywhere (Jeevan).
- 2026-11-03: rejected looks, kept rejected: the old blue and postcard mosaic, cream with a serif and clay accent, near-black with an acid accent, rows of identical cards.

## Open items
1. The sharing image `assets/og.png` (1200x630) is rendered from an HTML card in the site's own look: wordmark, home headline and the drawn restaurant phone. Rerender it when the home headline changes.
2. The repo is public because free GitHub Pages needs it. Moving to a private repo means Cloudflare Pages or a paid GitHub plan.

## How to check
Open the pages from disk or any static server. Check at 390, 768 and 1280, light and dark, keyboard focus, and the contact page with JavaScript off. Run the writing check on every page.

## Checked
2026-11-03, after the first review (P1 1 to 3, P2 1 to 15 applied):
- Every page (home, Sites we build, Monthly care, How we work, Contact) at 390, 768 and 1280 wide, light and dark, full page. Screenshots in `.design-refs/b/shots/` as `<page>-<width>-<scheme>.png`. No sideways scroll at any width, no console errors.
- Contact with JavaScript off: the choices and the composing sentence are hidden; the ready email, its mailto button and the address show.
- Contact composer driven through nothing ticked, care only, office with changes and care, trade with a redo and timing, and a full cafe email with name, site, booking service and a call. Each gave a true subject and one owner's voice. Only the subject is a live region.
- Contact targets at 390: every link, chip, field and button is 44px tall or more, including the inline address.
- Writing check (`node tools/writing.mjs --page`) on all five pages: 0 problems.
- Not looked at: keyboard focus order beyond the header, 200% text zoom, a screen reader pass.

2026-11-03, after rounds two to four of the fresh review:
- Every page at 390, 768 and 1280, light and dark, and every page at 390 with 200% text. Screenshots in `.design-refs/review/r2/` to `r4/`.
- Keyboard focus order and visible focus on all five pages at 390 and 1280. Body text contrast at least 7.0:1 in light and 8.1:1 in dark.
- Fixed in these rounds: the home h1 clipping at 200% text (now wraps, with a soft hyphen in "restaurants"), the skip link showing at large text, the contact header on phones, and the email address added to every footer on its own wrapping line.
- No sideways scroll at 390 with 200% text on any page. Writing check: 0 problems on all five pages.
- Not looked at: a screen reader pass, and real devices.
