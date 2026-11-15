#!/usr/bin/env node
// Records the five bar sites' scroll motion as short muted loops for the home page's work section.
//
//   node tools/capture-work.mjs [slug ...] [--kind phone|desk] [--sites <dir>]
//
// <dir> defaults to ../site-motion/sites (the site-motion worktree next to this one). Build each site first:
//   (cd ../site-motion && node sites/<slug>/build.mjs)
// For each slug it serves sites/<slug>/dist on 127.0.0.1:4425, opens headless Chrome on port 9611, loads the page twice
// (the first load warms the cache), records the second load and an eased scroll with Page.startScreencast, and writes
//   assets/work/<slug>-<kind>.mp4   H.264, no audio, faststart
//   assets/work/<slug>-<kind>.webm  VP9
//   assets/work/<slug>-<kind>.webp  poster frame
// plus a contact sheet in .design-refs/redo/capture/. Each clip is re-encoded at a higher CRF until it is under 1.2 MB.
// Frames keep their real timestamps and are resampled to 30 fps, so the clip plays at the speed the page moved.
//
// The sites' floating glass dock and the glass open-now pill are hidden while recording (HIDE below): Jeevan rejected
// both on 2026-11-13 and a later pass replaces them. Once the sites change, empty HIDE and run this again.
// Chrome over CDP needs the Bash sandbox off on this Mac.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chrome, serve, viewport, wait } from './cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i < 0 ? d : args.splice(i, 2)[1]; };
const SITES = path.resolve(flag('--sites', path.join(ROOT, '..', 'site-motion', 'sites')));
const KINDS = flag('--kind', 'phone,desk').split(',');
const HIDE = '.dock,.dock-bar,.tabs.glass,.chip.glass{display:none!important}';
const MAX = 1.2e6;

// Per site: where its signature move lives, as a scroll distance in screen heights, and when the poster frame is taken (s).
// hold: ms on the first screen before the scroll starts (entrance motion); scroll: ms for the eased scroll.
const CONF = {
  julius: { phone: { to: 2.2, poster: 1.5 }, desk: { to: 2.0, poster: 1.5 } },
  '169-bar': { phone: { from: '#since', offset: -0.05, hold: 900, to: 1.7, poster: 0.6 }, desk: { from: '#since', offset: -0.05, hold: 900, to: 1.7, poster: 0.6 } },
  'ottos-shrunken-head': { phone: { to: 2.2, poster: 3.2 }, desk: { to: 2.0, poster: 3.2 } },
  pianos: { phone: { to: 2.2, poster: 2.0 }, desk: { to: 2.0, poster: 2.0 } },
  'outer-heaven': { phone: { to: 2.6, poster: 2.4 }, desk: { to: 2.4, poster: 2.4 } },
};
const VIEW = {
  phone: { width: 390, height: 844, dpr: 2, mobile: true },
  desk: { width: 1280, height: 800, dpr: 1, mobile: false },
};
const slugs = args.length ? args : Object.keys(CONF);

function ff(argv) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { encoding: 'utf8' });
  if (r.status) throw new Error(r.stderr);
}

async function record(s, url, kind, conf) {
  const v = VIEW[kind];
  const hold = conf.hold ?? 1600, scroll = conf.scroll ?? 6400, tail = conf.tail ?? 700;
  await viewport(s, v);
  await s.send('Page.enable');
  await s.send('Page.addScriptToEvaluateOnNewDocument', { source: `addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent=${JSON.stringify(HIDE + 'html{scroll-behavior:auto!important}')};document.head.append(st)})` });
  // Warm load, so the recorded one paints at once.
  let l = s.once('Page.loadEventFired'); await s.send('Page.navigate', { url }); await l; await wait(800);
  await s.send('Page.navigate', { url: 'about:blank' }); await wait(200);

  const frames = [];
  s.on('Page.screencastFrame', (p) => { frames.push({ t: p.metadata.timestamp, data: p.data }); s.send('Page.screencastFrameAck', { sessionId: p.sessionId }).catch(() => {}); });
  if (conf.from) {
    // Start the clip at a section further down: load, jump there, then record from that still frame.
    l = s.once('Page.loadEventFired'); await s.send('Page.navigate', { url }); await l;
    await s.eval('document.fonts.ready.then(() => true)');
    await s.eval(`(() => { const el = document.querySelector(${JSON.stringify(conf.from)}); scrollTo(0, el.getBoundingClientRect().top + scrollY + ${conf.offset || 0} * innerHeight); return true; })()`);
    await wait(1200);
  }
  const t0 = Date.now() / 1000;
  await s.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: v.width * v.dpr, maxHeight: v.height * v.dpr, everyNthFrame: 1 });
  if (!conf.from) {
    // Record from DOMContentLoaded, so a sign that switches on as the page opens is seen dark first.
    const dcl = s.once('Page.domContentEventFired');
    l = s.once('Page.loadEventFired');
    await s.send('Page.navigate', { url });
    await dcl; frames.length = 0;
    await l;
  }
  await s.eval('document.fonts.ready.then(() => true)');
  await wait(hold);
  const D = Math.round(conf.to * v.height);
  await s.eval(`new Promise((r) => { const t0 = performance.now(); const y0 = scrollY; const D = Math.min(${D}, document.documentElement.scrollHeight - innerHeight - y0);
    const ease = (p) => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const f = (now) => { const p = Math.min(1, (now - t0) / ${scroll}); scrollTo(0, y0 + Math.round(ease(p) * D)); p < 1 ? requestAnimationFrame(f) : r(true); };
    requestAnimationFrame(f); })`);
  await wait(tail);
  const t1 = Date.now() / 1000;
  await s.send('Page.stopScreencast');
  // Keep the frames from load on; the last frame before load becomes the first so the clip never opens blank.
  const i0 = Math.max(0, frames.findIndex((f) => f.t >= t0) - 1);
  // From a fresh load the first frame is the blank page before first paint; drop it so the loop never flashes white.
  const kept = frames.slice(i0 + (conf.from ? 0 : 1));
  return { frames: kept, t0: Math.max(t0, kept[0].t), t1 };
}

function encode(rec, base, kind, conf) {
  const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'cap-'));
  const lines = [];
  rec.frames.forEach((f, i) => {
    const file = path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    const start = Math.max(f.t, rec.t0);
    const end = i + 1 < rec.frames.length ? Math.max(rec.frames[i + 1].t, rec.t0) : rec.t1;
    if (end - start <= 0.001 && i + 1 < rec.frames.length) return;
    lines.push(`file '${file}'`, `duration ${(end - start).toFixed(4)}`);
  });
  lines.push(lines[lines.length - 2]);
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, lines.join('\n'));
  const w = VIEW[kind].width * (kind === 'phone' ? 2 : 1);
  const vf = `fps=30,scale=${w}:-2:flags=lanczos,format=yuv420p`;
  const out = {};
  for (const [ext, codec] of [['mp4', (crf) => ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-movflags', '+faststart']], ['webm', (crf) => ['-c:v', 'libvpx-vp9', '-crf', String(crf + 8), '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2']]]) {
    let crf = kind === 'phone' ? 27 : 28;
    for (;;) {
      ff(['-f', 'concat', '-safe', '0', '-i', list, '-vf', vf, '-an', ...codec(crf), `${base}.${ext}`]);
      const size = fs.statSync(`${base}.${ext}`).size;
      if (size <= MAX || crf >= 45) { out[ext] = { size, crf }; break; }
      crf += 3;
    }
  }
  ff(['-ss', String(conf.poster), '-i', `${base}.mp4`, '-frames:v', '1', path.join(tmp, 'poster.png')]);
  const cw = spawnSync('cwebp', ['-quiet', '-q', '56', '-m', '6', path.join(tmp, 'poster.png'), '-o', `${base}.webp`], { encoding: 'utf8' });
  if (cw.status) throw new Error(cw.stderr);
  const sheet = path.join(ROOT, '.design-refs/redo/capture', `${path.basename(base)}-sheet.jpg`);
  fs.mkdirSync(path.dirname(sheet), { recursive: true });
  ff(['-i', `${base}.mp4`, '-vf', `fps=1,scale=${kind === 'phone' ? 260 : 480}:-2,tile=${kind === 'phone' ? '10x1' : '5x2'}`, '-frames:v', '1', '-q:v', '4', sheet]);
  fs.rmSync(tmp, { recursive: true, force: true });
  out.dur = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${base}.mp4`], { encoding: 'utf8' }).stdout.trim());
  out.poster = fs.statSync(`${base}.webp`).size;
  return out;
}

fs.mkdirSync(path.join(ROOT, 'assets/work'), { recursive: true });
for (const slug of slugs) {
  const dist = path.join(SITES, slug, 'dist');
  if (!fs.existsSync(path.join(dist, 'index.html'))) { console.error(`${slug}: no dist/index.html; build it first`); continue; }
  const server = await serve(dist, 4425);
  for (const kind of KINDS) {
    const s = await chrome(9611);
    try {
      const conf = CONF[slug][kind];
      const rec = await record(s, 'http://127.0.0.1:4425/', kind, conf);
      const r = encode(rec, path.join(ROOT, 'assets/work', `${slug}-${kind}`), kind, conf);
      console.log(`${slug} ${kind}: ${rec.frames.length} frames, ${r.dur.toFixed(1)} s, mp4 ${(r.mp4.size / 1e3).toFixed(0)} KB crf ${r.mp4.crf}, webm ${(r.webm.size / 1e3).toFixed(0)} KB, poster ${(r.poster / 1e3).toFixed(0)} KB`);
    } finally { await s.close(); }
  }
  await new Promise((r) => server.close(r));
}
