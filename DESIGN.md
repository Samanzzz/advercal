# Design

## Product
advercal.com, the website of AdverCal, a web studio run by three engineers who have worked at Apple and Amazon and studied at UC San Diego and the University of Pennsylvania. It speaks to owners and managers of bars, restaurants, cafés, salons, clinics and other local businesses anywhere in the US. They arrive on their own, mostly on a phone, and should leave wanting to book a free consultation. The site is the studio's inbound engine and never describes how the studio sells.

## Stack
Plain static HTML, CSS and a little JavaScript served by GitHub Pages from `main` (`CNAME` is `advercal.com`). No build and no framework.
- `assets/site.css` on every page: faces, tokens, the wordmark, header, action, closing band, footer, dock and the motion they share.
- One sheet per page for its drawn object and sections: `home.css` (index), `build.css` (services), `care.css`, `how.css`, `contact.css` (contact and thanks).
- `assets/page.js` on every page, `defer`, about 2 KB: the booking link, the dock, the loops and the play-once fallback.
- `assets/site.js` on `contact.html` only: the form. Without JavaScript the form is a plain POST to Web3Forms (`https://api.web3forms.com/submit`), which redirects to `thanks.html`. With it, the subject is built from the choices and the sent or error state shows in place.
- Every page reads in full without JavaScript. Each carries its own CSP in a meta tag allowing only what it loads: `default-src 'none'`, `'self'` for scripts, styles, fonts and images, `connect-src 'none'` and `form-action 'none'`, except contact, which allows `https://api.web3forms.com` for both. No inline script or style attribute anywhere.
- The booking link lives in one place: `const CAL_URL = ''` at the top of `assets/page.js`. Every button marked `data-cal` follows it; until it is set they go to `mailto:advercal.co@gmail.com?subject=Free%20consultation`.

## Canon
Its own system, with Apple's Human Interface Guidelines as the reference for access minimums (contrast, target size, text scaling). The art direction was dealt by the taste skill (`loud-flat-poster`, seed 1044887177) with the brand's palette and type kept. The writing rules are the studio's house rules, checked with `node tools/writing.mjs --page <file>` from a WebDog checkout.

## Direction
A loud flat poster of a night street: each kind of place lights up in one of the wordmark's colours and runs its own drawn site while it is on screen. Every page leads with one drawn object that performs a real moment from an owner's day, on its own field colour, and none repeats another's layout.

## Tokens
All in `:root` of `assets/site.css`. One scheme, the night ground, in every colour scheme.
- Ground night `#0c0b0a`, ink `#eeeeec`, secondary ink `#c4bdb1`. Bone `#f1f0ec` with ink `#0c0b0a` and `#3d3a35`.
- Fields are the wordmark's colours: yellow `#ffc701` (also the action, hover `#ffd640`), red `#aa2121` with cream ink `#fff3e6`, green `#1eb955` with night ink, blue `#006eff` with white ink. The wordmark's violet `#5d17eb` stays in the wordmark.
- Page fields: home night with the five place bands, What we build blue, Monthly care green, How we work red, Contact yellow, Sent night.
- Type: League Spartan 800 for display, Poppins 400 and 500 for text, both OFL, self-hosted in `assets/fonts/` behind metric-matched fallbacks. Sizes: small 15px, body 17px, lead 22px, heading 32px, section display up to 72px, page headlines 13 to 17vw on phones and up to 10 to 13rem wide, the closing word up to 30rem. Headlines are two authored lines.
- Shape: square corners on every button, panel, slip and form field. Folder tabs are cut with `clip-path` shoulders. Drawn objects mark their root `data-ui` and keep their own colours, rules and the neon's glow.
- Layout: gutter 16, 32 from 768, 40 from 1100; 12 columns on wide screens; a band strip is 56px; the header is 70px and sticky from 900px. Below 900px the action is docked at the bottom of the screen.
- Motion: curves `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-expo` `cubic-bezier(0.16, 1, 0.3, 1)`. Loops of 6 to 20 s. Scroll pieces are linear on view timelines.

## Assets and licenses
League Spartan and Poppins under the OFL. No photographs and no third-party images; every picture is drawn in HTML, CSS or SVG. The sharing image `assets/og.png` is rendered from `.design-refs/og/og-card.html`. Banned: SF Pro, New York, SF Mono, SF Symbols and anything else from Apple's Design Resources, including traced device bezels.

## Surfaces
Home (`index.html`), What we build (`services.html`), Monthly care (`care.html`), How we work (`how.html`), Contact (`contact.html`), and Sent (`thanks.html`, `noindex`) after a plain form post. The header names the four pages and carries Schedule a free consultation; the footer repeats them with the address and the wordmark at full width.
- Home: the neon open sign under "Get them in the door."; five places filed as folders: a bar's lineup on a dark phone (yellow), a salon's booking sheet on a light phone (bone), a café's front door with its sign and an order on a phone (green), a restaurant's printed menu card with a confirmation ticket (red), a clinic in a browser (blue); the slips every site hands out; the closing band.
- What we build: a restaurant's booking form whose booking lands at the top of its own bookings app; on the site as a big list in the wordmark's colours; beyond the site as four panels of unequal width on yellow; each kind of place on bone; before launch and after.
- Monthly care: the November 1 email with its PDF report ticking through six checks; the check as six big ticks; fixes and small updates on bone.
- How we work: a private preview on a phone where a message asking for new Sunday hours changes the site; five steps as lines stepping down the bone ground; two pledges side by side.
- Contact: the form as a bone slip fed up into the yellow field, with square choices; the sent state in place.
- Sent: a receipt printed from its slot.
The preview pages (directions A to D and the old sharing card) left the public tree on 2026-11-14 and are kept in `.design-refs/preview-archive/`.

## Motion
Every animation runs from a start state to the plain CSS, so reduced motion and a page without JavaScript show the same still as the last frame. Hidden or moved start states exist only inside `prefers-reduced-motion: no-preference`. Scroll-linked pieces use CSS view timelines; where a browser has none, `page.js` adds `.once` to the page and `.play` to each piece as it arrives, and the same keyframes play once by time. Loops run only while their object is on screen: `page.js` starts them from the first frame when it arrives and pauses them when it leaves. Frames use `overflow: clip`, never `hidden`. Only transform and its individual properties, opacity and filter animate.

| Where | What | How | End state |
| --- | --- | --- | --- |
| Every page | Header wordmark | Each letter drops in with a small overshoot, 860ms, 70ms apart; Cal slides in after | Whole mark |
| Every page | Headline | Each line rises from behind its own baseline, 900ms expo, from 90ms and 200ms | At rest |
| Every page | Lede | Rises 28px from 300ms, transform only; the LCP element on most pages | At rest |
| Every page | Closing band | The letters of Book rise one by one on scroll, the arrow turns up and right; hover swaps yellow and night | At rest |
| Every page | Footer wordmark | Its letters rise one by one as it enters, done well before the page ends | Whole mark |
| Every page | Docked action, under 900px | A full-width bar at the bottom; it steps down while the hero action, the closing band, the footer or a form is on screen | Shown |
| Home | Neon sign | Swings in on its hook, the frame buzzes on, then o, p, e, n; the frame hums and the e stutters on loops; it tips as the hero leaves while the headline lines part | Lit |
| Home | Folders, wide screens | Sticky bands slide over each other and keep their tabs showing | All tabs filed |
| Home | Each object on scroll | Swings up from a tilt at 90% scale as it enters; its tab rises | At rest |
| Home | Bar, 9 s loop | The sign buzzes, the acts arrive, the late set sells out, the board turns over | Lineup with Tickets |
| Home | Salon, 9 s loop | The booking sheet rises, 1:00 is picked, Book is pressed, confirmed, the sheet goes down | Sheet up, confirmed |
| Home | Café, 8 s loop | The clock turns 6:59 to 7:00, the door sign flips to Open, an order goes in and is ready | Open, 7:00 |
| Home | Restaurant | The menu rolls on a 20 s loop; every 6 s Reserve is pressed and the confirmation ticket comes in | Menu, ticket |
| Home | Clinic, 8 s loop | Book a visit is pressed, the next opening slides in, Thursday is picked | Next opening shown |
| Home | Slips | Rise from below the section edge at different speeds | Standing, two tilted |
| What we build | The pair, 8 s loop | The form fills, Book is pressed, the booking drops into the top of the app and the other rows move down | Booking on top |
| What we build | Lists and panels | Each big list name and kind slides in from the left; the four panels rise one after another | At rest |
| Monthly care | The report, 10 s loop | The email lands, the PDF slides out, the checks tick down the list and the fixed one is stamped | Report complete |
| Monthly care | The check | Each tick turns and grows in as its row enters | Ticks shown |
| How we work | The preview, 9 s loop | The owner's message pops, our reply follows, Sunday's hours change and a highlight sweeps the row | New hours highlighted |
| How we work | Steps | Each line slides in from the right along the staircase, done once it is fully on screen | In place |
| Contact | The form | The slip feeds up into the field and its questions arrive 80ms apart; choices press to 96%; the sent heading stamps in | Form at rest |
| Sent | Receipt | Prints down out of its slot | Receipt shown |
| Every page | Buttons and links | Press scales to 97%; nav links grow an underline; the current page keeps it | Rest |

## Writing
Sentence case everywhere. Plain sentences an owner would repeat to a friend. A page talks about its subject, never about itself. State only what the studio really does; no client names, counts, testimonials, prices or pricing terms; pricing is a conversation. The address is advercal.co@gmail.com.

## Decisions
- 2026-11-14, direction D ships on every page (Jeevan approved it). `index.html` is the D home page and the inner pages are rebuilt in the same look, each with its own drawn object and motion moment. The old bottle-green look, Switzer and Zodiak, `assets/demo.js` and `assets/motion.js` are gone; the preview pages moved to `.design-refs/preview-archive/`.
- 2026-11-14, the five home objects are five different things (Jeevan, after review): a phone with a lineup board, a phone with a booking sheet, a front door with a sign and an order phone, a printed menu card, and a browser. Rejected: one card recoloured five times.
- 2026-11-14, lines about the page are cut (Jeevan named "Your kind of place" and "Tonight, on the first screen."). Headings name the places and what owners get.
- 2026-11-14, the email is advercal.co@gmail.com everywhere (Jeevan). advercalcompany@gmail.com is wrong and no shipped file carries it.
- 2026-11-14, the main action is "Schedule a free consultation" and replaces every "Write to us" (Jeevan: "write to us is dumb"). It goes to `CAL_URL` once set, and to the mailto until then. On phones it is docked at the bottom, in thumb reach.
- 2026-11-14, no status dots anywhere (Jeevan: "the stupid green dot for open time"). Open now is type or a sign: the neon sign, the café's door sign, the bar's "Open tonight until 2 AM".
- 2026-11-14, What we build keeps its capabilities and the third-party services it names, and drops the drawn prices and the price wording.
- 2026-11-14, direction D replaces C as the proposed home page (Jeevan on C: "so much slop otherwise, no animation"). Rejected with C: drawn phone mockups, rows of rounded objects, pill buttons, the yellow feature list, quiet motion. D's motion is meant to be seen in the first second and on every screen.
- 2026-11-14, nationwide, any local business (Jeevan). AdverCal's own copy names no city: the home page speaks to the places people go, from the bar on the corner to the salon down the street, matching the audience under Product.
- 2026-11-14, no real venues or third-party photos on advercal.com; drawn demo sites instead (Jeevan). The home page draws five sites in HTML and CSS, each a different object at its own size with its own motion: a bar with tonight's lineup and Tickets, a restaurant with its menu and Reserve, a café with its hours and Order ahead, a salon booking sheet, and a clinic in a browser with Book a visit. Names are generic ("Your bar", "Your restaurant"), there are no prices, counts or quotes, and no photographs, so nothing needs a credit. The five bar clips, their captions and the credit line are gone, and so are the clip-based directions A and B.
- 2026-11-14: advercal.com is the inbound engine; its copy says we make amazing websites and never describes the outbound tactic (Jeevan). Owners of bars, restaurants, clubs and local businesses arrive on their own and should get, in about five seconds, that we make great sites, see the work moving and know how to write to us. Jeevan rejected A and B ("both are stupid") because their copy described how we sell. `preview/c.html` replaces them: the promise "Websites that make people want to walk in.", drawn sites showing what an owner's site can do, what every site carries in an owner's terms, working with us from the owner's side, and Write to us in the sticky header, the hero, the yellow section and the close. C is on a night ground in every colour scheme, since the work is bars at night. A and B keep their layouts with the tactic copy removed.
- 2026-11-13: the look is redone from scratch after Jeevan's review of the November pages ("so ugly, doesn't show off what we can do. logo is wrong too"). Two home directions sit in `preview/a.html` (one giant line, phones walked sideways by the scroll) and `preview/b.html` (the poster: a working site as wide as the page, an index of venues that lights each clip in one of the wordmark's colours). Jeevan picks one before it reaches the other pages; until then the rest of this file describes the live pages. Rejected with the old look: bottle green on stone, Switzer, the drawn venue and clinic objects.
- 2026-11-13: real work shown as clips of five bar sites (Jeevan). Overturned on 2026-11-14, below.
- 2026-11-13: the logo is Sam's multicolour wordmark, the only copy being `.design-refs/logo/advercal.png` (478 by 111). It is set in League Spartan Bold (OFL), not Poppins: its x-height is 0.62 of its cap height, which matches League Spartan (0.622) and rules out Poppins (0.79). `assets/logo/advercal.svg` draws each letter as a path from League Spartan at weight 700, with size, baseline and each letter's position fitted to the PNG, and the colours sampled from it: A `#aa2121`, d `#5d17eb`, v `#ffc701`, e `#1eb955`, r `#006eff`, Cal `#000000`. Rendered in Chrome at the PNG's size, the two overlap with an IoU of 0.925; the differences are a pixel of edge, mostly on the l, which is slightly wider in the PNG (`.design-refs/redo/logo-compare.png`: PNG, SVG, blend, diff).
- 2026-11-13: on dark grounds "Cal" turns to the page's light ink (`assets/logo/advercal-on-dark.svg`, and `--cal` in the inline header mark); the five coloured letters stay as they are.
- 2026-11-13: favicon is the red A of the wordmark (`assets/logo/favicon-a.svg`). The sharing image for the directions is `preview/og.png`, rendered from `preview/og-card.html`; it replaces `assets/og.png` once a direction is chosen.
- 2026-11-13: type is League Spartan 800 for display, the wordmark's own face, and Poppins 400 and 500 for text, both OFL, subset to Latin and self-hosted in `assets/fonts/` with their licences, each behind a metric-matched local fallback. Replaces Switzer and Zodiak for the redo. The CSP allows only `'self'` for fonts, media and images.
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
1. Set `CAL_URL` in `assets/page.js` when the cal.com booking page exists.
2. The repo is public because free GitHub Pages needs it. Moving to a private repo means Cloudflare Pages or a paid GitHub plan.
3. Rerender `assets/og.png` from `.design-refs/og/og-card.html` (1200x630, reduced motion) when the home headline changes.
4. Ask Sam for the original logo file (vector or the design tool's source) to confirm League Spartan Bold and the letter spacing; the SVG is fitted to a 111px PNG.
5. `tools/capture-work.mjs` is unused since 2026-11-14 and kept in case real, signed work is shown later.

## Work clips
Unused since 2026-11-14. `node tools/capture-work.mjs [slug ...] [--kind phone|desk]` records the bar sites in the site-motion worktree as short muted MP4 and WebM loops with posters in `assets/work/`. Nothing on the site uses it now.

## How to check
Serve the worktree and open each page at 320, 390, 768 and 1440, with reduced motion and with JavaScript off. From a site-motion checkout, on a temp folder where the page is `index.html`: `tools/writing.mjs --page`, `tools/whole.mjs check` and `tools/speed.mjs check`. Test the contact form only against a stub: replace `fetch` before the page loads and block `api.web3forms.com`.

## Checked
CHECKED_NEW

2026-11-14, direction D (`preview/d.html`):
- Frames at 390 by 844 and 1440 by 900: first screen at 150, 500 and 1200 ms, scroll strips, the end of the page, and each drawn site at 0.3 to 7.4 s after it arrives, in `.design-refs/redo/d-*`.
- Phone speed (`speed.mjs check`, Slow 4G, CPU 4x): LCP 0.7 s, the lede; CLS 0. Desktop LCP 0.1 s, CLS 0. 77 KB in 7 requests before the first scroll.
- `whole.mjs check` on a copy as `index.html`: every mark and word whole at 320, 390, 768, 1280 and 320 with 200% text, no sideways scroll.
- Writing check 0. Taste inspector 0 FAIL with covered-text waived for the sticky folders and the docked action; its warnings for no photographs or footage stand by decision.
- A fresh review (opus, frames only) scored slop 5 and motion 6. Changed after it: the neon got tube cores and uneven letters, the header links and both actions show from the first frame, the hero action sits under the lede, the phone hero gap closed so the first tab clears the docked bar, the bar's late set sells out and the restaurant's table is confirmed mid-loop, and the footer sets the address at lead size with the wordmark at full width. Kept by decision: the mailto until `CAL_URL` exists, the Gmail address, the drawn sites with generic names, the footer credentials line.
- Not looked at: Safari and Firefox, real phones, a screen reader pass, D with JavaScript off beyond the CSS default (loops run, the dock shows).

2026-11-14, page C with drawn sites (`preview/c.html`):
- Frames at 320, 390 and 1440 and scroll strips at 390 and 1440 in `.design-refs/redo/c-*`.
- Phone speed (390 by 844 at 3x, Slow 4G, CPU 4x, cache off, three runs): LCP 0.54 to 0.56 s, the lede; CLS 0.
- `whole.mjs`: every mark and word whole at 320, 390, 768, 1280 and 320 with 200% text. No sideways scroll from 320 to 1440, no console or CSP errors. Writing check 0.
- Text inside each drawn site is sized in container units of its own object, so it keeps its layout at any width; with 200% text on a narrow phone the drawn sites stack one per row so every caption fits.
- Not looked at: the drawn sites' motion frame by frame, Safari and Firefox, a screen reader pass.

2026-11-13, redo directions A and B (`preview/a.html`, `preview/b.html`), with `tools/shots.mjs`:
- First screens at 390 by 844 and 1440 by 900, light and dark, scroll strips at both widths, and the whole page at 390 with reduced motion and with JavaScript off, in `.design-refs/redo/`. Reduced motion: every piece at rest, the clips show posters. JavaScript off: every word reads; the posters show and Chrome adds its own play controls.
- Phone speed (390 by 844 at 3x, Slow 4G at 1.6 Mbps and 150 ms, CPU 4x, cache off, three runs): A LCP 1.38 to 1.43 s, B 1.20 to 1.25 s; CLS 0.0001 on both. The LCP element on both is the hero clip's poster, preloaded: Pianos phone, 48 KB, on A; Julius' wide, 37 KB, on B.
- No sideways scroll at 320, 360, 390, 414, 768, 1024, 1280 and 1440; no console or CSP errors.
- Taste inspector (`inspect.mjs`): A 0 FAIL; B's last FAIL was the reel caption read as a label above "Built this fall", now set on the clip.
- Whole words and marks (`node tools/whole.mjs check` from site-motion, on copies of the two pages): every mark and word whole at 320, 390, 768, 1280 and 320 with 200% root text, on both. Type sizes are in rem with a viewport floor, so text follows the reader's size; the email may break only at the @.
- Writing check: 0 problems on both.
- Not looked at: Safari, Firefox and real phones; a screen reader pass; the walk and the index on a trackpad at real speed rather than stepped frames.

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
