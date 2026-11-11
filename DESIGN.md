# Design

## Product
advercal.com, the website of AdverCal, a web studio run by three engineers who have worked at Apple and Amazon and studied at UC San Diego and the University of Pennsylvania. It speaks to owners and managers of restaurants, bars, clubs, clinics and other local businesses anywhere in the US. They read it on a phone, often between services, and should leave knowing what they would get, that they own it, and how to write to us.

## Stack
Plain static HTML and CSS served by GitHub Pages from `main` (`CNAME` is `advercal.com`). One stylesheet, `assets/site.css`. Two scripts, both from our own origin and loaded with `defer`: `assets/motion.js` on every page (about 1 KB; it only runs the play-once fallback described under Motion) and `assets/site.js` on `contact.html` for the form. The contact form posts to Web3Forms (`https://api.web3forms.com/submit`); without JavaScript it is a plain POST that Web3Forms redirects to `thanks.html` (same-domain redirect, allowed on the free plan), and with JavaScript it posts with fetch, builds the subject from the choices and shows the sent or error state in place. Every page reads correctly without the script. Each page carries its own strict CSP in a meta tag, with `script-src 'self'` and no inline script or style attributes.

## Canon
Its own system, with Apple's Human Interface Guidelines as the reference for access minimums (contrast, target size, text scaling). The writing rules are the studio's house rules, checked with `node tools/writing.mjs --page <file>` from a WebDog checkout.

## Tokens
All in `:root` at the top of `assets/site.css`, with dark values under `prefers-color-scheme: dark`.
- Color, light: ground `#f2f3f0`, band `#e4e8e2`, surface `#ffffff`, ink `#141815`, secondary ink `#454d47` and `#5c645e`, line `#d0d5cd`, accent bottle green `#1d5a44`.
- Color, dark: ground `#101311`, band `#181d1a`, surface `#1d2320`, ink `#e8ece9`, secondary ink `#b2bbb5` and `#959e98`, line `#2d3530`, accent mint `#84c9a9`.
- Type: Switzer (Fontshare) for everything we say, with metric-matched fallback faces in front of it (`Switzer Fallback` on Helvetica Neue, `Switzer Arial` on Arial; size-adjust per weight band measured on the site's own text with `ss01`), so lines keep their breaks when Switzer swaps in. Zodiak appears only inside the drawn restaurant site, as that business's own face. Sizes: caption 14px, body 17px, sub 22px, h2 28 to 38px, h1 38 to 64px.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96. Gutter 16px on phones, 32 from 768, 40 from 1100.
- Radius: 10px controls, 18px panes.
- Motion: curves `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` for things arriving and controls, `--ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)` for things that travel or sweep while seen, `--ease-expo` `cubic-bezier(0.16, 1, 0.3, 1)` for headline words and drawn objects of 600 ms or longer. Durations `--t-press` 140ms, `--t-hover` 180ms, `--t-ui` 240ms, `--t-word` 640ms, `--t-scene` 1000ms. Words stagger 34ms, rows and items 50 to 120ms. Anything tied to the scroll is linear, since the scroll is its easing.

## Assets and licenses
Switzer and Zodiak from Fontshare under the ITF Free Font License. No photographs and no third-party images. Banned: SF Pro, New York, SF Mono, SF Symbols and anything else from Apple's Design Resources, including traced device bezels.

## Surfaces
Home, What we build (`services.html`), Monthly care (`care.html`), How we work (`how.html`), Contact (`contact.html`), and `thanks.html` after a plain form post. Each page leads with one drawn object: a bar's site on a phone with its open-now line and tonight's lineup (home), a clinic site in a browser with the bookings screen of the app behind it (What we build), the monthly report email and its PDF, the private preview and a change request, the contact form. Under the home hero, six capability tiles each draw a different kind of object: a lineup list from a ticketing service, an open-now sign, a bookings web app, a vertical video, a search result with its structured data, and a sheet of booking and ordering buttons. Every page moves, top to bottom; the Motion section lists each piece. Each settles on its end state, which is also what reduced motion and a page without JavaScript show.

## Motion
Every animation runs from a start state to the plain CSS, so reduced motion and a page without JavaScript show the same still as the last frame. Hidden or moved start states exist only inside `prefers-reduced-motion: no-preference`. Scroll-linked pieces use CSS scroll timelines (`view-timeline` names on the object, tile or row they follow). Where a browser has none, `motion.js` adds `.once` to the page and `.play` to each piece as it arrives, and the same keyframes play once by time. Frames use `overflow: clip`, never `hidden`, because a hidden overflow is a scroll container and freezes the timelines inside it.

Motion belongs to the drawn objects and to the hero headline. Section headings, fact and step text and the closing bands stay still; only the rule above each fact and step draws. Rejected after review on 2026-11-10: headings scrubbed word by word with the scroll and closing statements lit word by word, which left copy half risen or dim wherever a reader stopped scrolling.

Hero headline words rise inside a box that clips only vertically (`.wd`, `overflow: visible clip`, padded past ascenders and descenders) rather than a `clip-path`, so the mask costs nothing, the line never moves and a word that cannot fit at 200% text breaks instead of losing letters. Each split h1 carries its plain text in `aria-label` and hides the word boxes from assistive tech. The one `clip-path` is on the home search tile's structured data: the code is type, and wiping it top to bottom reads as the data being written, which a transform cannot show. Only transform and its individual properties, opacity and that one clip-path animate.

On phones (below 768px) the hero objects sit low on or below the first screen, so each object (the phone, a window, the PDF, the bookings app, the video, the chat) carries its own view timeline and its pieces play in their wide-screen order as that object comes up the screen. The tip-back and rise-past on leaving the hero run only from 768px up.

| What | How | End state | Reduced motion |
| --- | --- | --- | --- |
| Hero headline, every page | Each word rises from below its own line with a 5 degree tilt, 640ms expo, 34ms apart, from first paint | Words at rest; readable by about 500ms | Still |
| Hero lede | Rises 22px, transform only, 800ms from 140ms | At rest; it is the LCP element and is painted at once | Still |
| Hero actions, contact address, thanks button | Fade and rise 12px, 560ms from 320ms | At rest | Shown |
| Hero drawn object (phone or window) | Rises 56px from 96% scale and fades in, 1000ms, on load at every width | At rest | Shown |
| Hero object on scroll, 768px and up | Leaving the first screen, it tips back 9 degrees and sinks 64px at 96% scale (`--hero` exit range) | Plain at the top of the page, where it is read | Still |
| Hero satellites on scroll, 768px and up | Video, bookings app, PDF and chat rise 110px past the main object while the hero leaves | Plain at the top | Still |
| Home phone | Open now line fades up and its dot lights; tonight's two acts drop in with their Tickets buttons popping; this week's rows follow; the video slides in from the right and plays its three scenes once. By time from 480ms on wide screens, by the phone's and the video's own scroll on phones | Venue site complete, video on its last scene | Complete still |
| What we build window | The clinic page lays in as its heading bars grow and its hours and service rows arrive; Book a visit is pressed; the bookings app slips out from behind and its rows land | Page and app complete | Complete still |
| Monthly care email | The email lands from above and its lines and attachment arrive; the PDF comes out of the attachment and each check ticks, ending on 1 fixed | Email and PDF complete | Complete still |
| How we work preview | The owner's message pops from its corner, our reply follows, then the new Sunday hours highlight sweeps across | Thread and highlight shown | Shown |
| Contact form | The form rises under the headline, its four questions arrive 80ms apart, then Send | Form at rest | Shown |
| Facts and steps | The rule above each row draws left to right as the row comes up; the rule is a zero-height border so forced colours keep it | Rules drawn | Drawn |
| Lineup tile | Last night drops off and the list moves up | Tonight on top | Same |
| Open-now tile | The clock rolls from 4:59 to 5:00, Closed goes out, then Open now flickers on like a tube, the one flicker on the site | Open now | Same |
| Web app tile | Booking rows arrive from the right one by one | All rows | Same |
| Video tile | The frame opens from 86 percent with a small turn, then the scenes play | Last scene | Same |
| Search tile | The result rises; the structured data wipes in top to bottom while sliding left | Both shown | Same |
| Buttons tile | The sheet rises like an action sheet, its three buttons arrive, then Reserve a table is pressed | Sheet at rest | Same |
| Kinds of site tiles | The client's page scrolls up inside its frame; its rows set in; the bar's Book a table fades up; the clinic's hours card slides in; each other tile's main button is pressed | Plain frame | Same |
| Buttons | Press scales to 97 percent in 140ms; hover darkens the fill; quiet buttons darken their ring | Rest | Colour only |
| Nav links | Accent bar under the link grows from the left on hover in 240ms; the current page keeps it | Bar on current page | Bar, no growth |
| Links | Underline goes from faint to full on hover | Full on hover | Same |
| Wordmark | The dot in the mark lifts 2px on hover and narrows on press | Rest | Still |
| Contact choices | Press scales to 96 percent; a ticked box's check fades in from 80 percent | Checked | Checked |
| Sent message | The sent panel fades and rises 12px when it replaces the form | Shown | Shown |

## Writing
Sentence case everywhere. Plain sentences an owner would repeat to a friend. State only what the studio really does; no client names, counts, testimonials, prices or pricing terms; pricing is a conversation.

## Decisions
- 2026-11-10: motion across every page to show what the studio builds (Jeevan); replaces 'motion only where it shows a capability'. Every piece belongs to a drawn object or the sentence it sits on. Rejected: particles, floating blobs, gradient text, marquees, cursor trails, hue-shifting backgrounds and one fade-up applied to everything.
- 2026-11-07: the site shows the studio's whole range, not only simple static sites with monthly care. The home page leads with a live venue site and six capability tiles; `services.html` (now "What we build") lists capabilities on the site and beyond it before the kinds of business. Rejected: a row of identical capability cards, so every tile draws a different object at a different size.
- 2026-11-07: the code sample in the search tile is set in JetBrains Mono from Google Fonts, loaded only on the home page, whose CSP allows fonts.googleapis.com and fonts.gstatic.com for it.
- 2026-11-03: multi-page site replaces the single scrolling page. Rejected: one long page, which hid the care and process detail behind scrolling.
- 2026-11-03: product-led direction chosen over a type-led printed rate card. Each page shows what the owner gets before describing it.
- 2026-11-03: audience narrowed to restaurants, bars, clubs, clinics and local businesses nationwide. Rejected: freelancers, academics and the Southern California framing.
- 2026-11-03: drawn sites carry no invented business names, and no real business appears until it signs.
- 2026-11-07: no prices, quotes or pricing terms on the site; every close invites a conversation (Jeevan).
- 2026-11-07: no partner names on the site; the footer says three engineers who have worked at Apple and Amazon and studied at UC San Diego and the University of Pennsylvania (Jeevan).
- 2026-11-07: the name is spelled AdverCal, with the capital C, everywhere (Jeevan).
- 2026-11-03: rejected looks, kept rejected: the old blue and postcard mosaic, cream with a serif and clay accent, near-black with an acid accent, rows of identical cards.

## Open items
1. The sharing image `assets/og.png` (1200x630) is rendered from an HTML card in the site's own look: wordmark, home headline and the drawn restaurant phone. Rerender it when the home headline changes.
2. The repo is public because free GitHub Pages needs it. Moving to a private repo means Cloudflare Pages or a paid GitHub plan.
3. The contact form will not send until `YOUR_WEB3FORMS_ACCESS_KEY` in `contact.html` (the hidden `access_key` input, its only place) is replaced with the real Web3Forms access key. Until then every submission fails and the page offers the email address.

## How to check
Open the pages from disk or any static server. Check at 390, 768 and 1280, light and dark, keyboard focus, and the contact page with JavaScript off. Run the writing check on every page.

## Checked
2026-11-10, motion pass after review:
- Correction: the first pass recorded CLS 0 for the inner pages. A fresh review measured What we build at 0.176 and How we work at 0.174 to 0.183 on the throttled phone, from Switzer swapping in and re-wrapping headlines. The fallback faces under Tokens fix it.
- Phone (375 by 812 at 3x, Slow 4G at 1.6 Mbps and 150 ms, CPU 4x, local server, three runs each, Switzer on time and Switzer held back 1.4 s): CLS home 0.0014, What we build 0.0002, Monthly care 0.001, How we work 0.0003, Contact 0.0004, Thanks 0.0001 or less, the same in both conditions. LCP 0.79 to 0.94 s, the hero lede on each.
- Layout with Switzer blocked against loaded, reduced motion, at 320, 360, 375, 390, 414, 768 and 1280: a heading re-wraps on the first screen in 3 of the 42 page and width pairs (What we build and How we work at 390, Contact at 360); origin/main re-wraps in 6.
- Phone frames at 390 by 844, every 120px through the hero: each scene plays as its object comes up the screen. Wide frames at 1280 from the first pass still hold. Contact sheets in `.design-refs/motion/` (`phone-*` for this round).
- 200% text at 320: no sideways scroll on any page and no word cut; "Websites" breaks inside the word, as it does on origin/main.
- Reduced motion: no CSS animation runs and nothing is moved or faded beyond the static design, on all six pages. JavaScript off: nothing with words is hidden, every page reads in full (`nojs-*.jpg`). The play-once fallback (scroll timelines switched off in a copy of the stylesheet) and the timeline path both end with every piece at rest after a slow scroll.
- No sideways scroll at 320, 390, 768 and 1280; no console or CSP errors with `script-src 'self'` and the local fallback faces; keyboard focus shows a 3px outline on the first eight stops of every page.
- Writing check: 0 problems on all six pages.
- Not looked at: Safari and Firefox on real devices, Android, where neither Helvetica Neue nor Arial may be installed and the fallback falls through to the system face, and a VoiceOver pass over the labelled headlines.

2026-11-07, site-patterns checklist (design-jeev `references/site-patterns.md`) at 390 and 1280:
- Navigation: four destinations, so a visible row under the name on phones and no toggle; current page has `aria-current` and an underline bar; bar and footer links 44px tall. Unchanged.
- The one action: "Write to us" word for word in the header, after every hero, in every closing band and in the footer, which replaced its Contact link. The closing bands print the address beside it. No price beside it, by the studio's rule.
- Motion: the home headline does not animate and nothing starts at zero opacity outside the drawn tiles. The video plays once and holds its last scene instead of looping offscreen. The sign and lineup tiles run on CSS scroll-driven timelines (`view()`) where supported, so they change as they scroll into view; elsewhere they play once on load. Tile overflow is `clip`, since a hidden overflow made each tile its own scroll container and froze the timelines. No JavaScript on the home page.
- Measured in Chrome with reduced motion off: the sign reads Closed as it enters and Open now at mid-screen, and last night leaves the lineup as it passes mid-screen. With it on, every tile shows its end state at any scroll position. Full-page shots are taken at the top, so tiles below the fold show their starting state.
- Every page re-shot at 390 and 1280, light and dark; no sideways scroll, no console errors. Writing check: 0 problems on all six pages.

2026-11-07, range redesign:
- Every page at 390 and 1280, light and dark, full page after the one-time motion settles; home also at 768. Screenshots in `.design-refs/b/shots/`. No sideways scroll, no console errors.
- Real words stay whole in every crop at 390 and 1280 (lineup, sign, app, search, buttons, hero satellites).
- Writing check: 0 problems on all six pages.
- Not looked at: the motion frame by frame, 200% zoom, a screen reader pass on the new tiles.

2026-11-07, contact form:
- Contact at 390, 768 and 1280 and the new thanks page at 390 and 1280, light and dark; shots in `.design-refs/b/shots/`. No sideways scroll.
- With JavaScript, against a stubbed Web3Forms endpoint: empty and malformed email show an announced error and focus the field; a failed send shows the error with the email address; a good send shows the sent state and moves focus to it; the posted data carries no `redirect`. Subjects checked for nothing ticked, care only, changes with care, and a full new-site request.
- Without JavaScript: the browser blocks an empty email, and a filled form posts and lands on `thanks.html`.
- Every target on the contact page is 44px or taller at 390. Writing check: 0 problems on `contact.html` and `thanks.html`.

2026-11-03, after the first review (P1 1 to 3, P2 1 to 15 applied):
- Every page (home, What we build, Monthly care, How we work, Contact) at 390, 768 and 1280 wide, light and dark, full page. Screenshots in `.design-refs/b/shots/` as `<page>-<width>-<scheme>.png`. No sideways scroll at any width, no console errors.
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
