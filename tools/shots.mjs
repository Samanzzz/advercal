#!/usr/bin/env node
// Looks at the home page directions the way the redo review asks, and measures them.
//
//   node tools/shots.mjs shots <page.html ...>   first screens at 390x844 and 1440x900, light and dark, a scroll strip at
//                                                both widths, reduced motion and JavaScript off at 390, into .design-refs/redo/
//   node tools/shots.mjs check <page.html ...>   sideways scroll from 320 to 1440, targets under 44px, console and CSP errors
//   node tools/shots.mjs speed <page.html ...>   phone LCP and CLS: 390x844 at 3x, Slow 4G (1.6 Mbps, 150 ms), CPU 4x, 3 runs
//
// Serves the worktree on 127.0.0.1:4422 and drives headless Chrome on port 9613 (needs the Bash sandbox off).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chrome, serve, viewport, goto, shot, wait } from './cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '.design-refs/redo');
const [mode, ...pages] = process.argv.slice(2);
const server = await serve(ROOT, 4422);
const url = (p) => `http://127.0.0.1:4422/${p}`;
const name = (p) => path.basename(p, '.html');

async function fresh(fn) { const s = await chrome(9613); try { await s.send('Page.enable'); await s.send('Runtime.enable'); return await fn(s); } finally { await s.close(); } }

if (mode === 'shots') {
  for (const p of pages) {
    const n = name(p);
    for (const [w, h, dpr] of [[320, 640, 2], [390, 844, 2], [1440, 900, 1]]) {
      for (const dark of [false, true]) await fresh(async (s) => {
        await viewport(s, { width: w, height: h, dpr, mobile: w < 800, dark });
        await goto(s, url(p), 1800);
        await shot(s, `${OUT}/${n}-${w}-${dark ? 'dark' : 'light'}.jpg`);
      });
      if (w === 320) continue;
      // Scroll strip: a frame every 0.75 screens, played as a reader would (scroll timelines need real scrolling).
      await fresh(async (s) => {
        await viewport(s, { width: w, height: h, dpr: 1, mobile: w < 800 });
        await goto(s, url(p), 1500);
        const H = await s.eval('document.documentElement.scrollHeight');
        const dir = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'strip-'));
        let i = 0;
        for (let y = 0; y < H - h * 0.5 && i < 24; y += Math.round(h * 0.75), i++) {
          await s.eval(`scrollTo(0, ${y})`); await wait(700);
          await shot(s, `${dir}/f${String(i).padStart(2, '0')}.jpg`);
        }
        const cols = w < 800 ? Math.min(i, 8) : Math.min(i, 4);
        const rows = Math.ceil(i / cols);
        const sc = w < 800 ? 300 : 560;
        spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-pattern_type', 'glob', '-i', `${dir}/f*.jpg`, '-vf', `scale=${sc}:-2,tile=${cols}x${rows}:padding=6:color=gray`, '-frames:v', '1', '-q:v', '4', `${OUT}/${n}-${w}-strip.jpg`]);
        fs.rmSync(dir, { recursive: true, force: true });
      });
    }
    // Reduced motion and JavaScript off, whole page at 390.
    for (const [tag, reduced, nojs] of [['reduced', true, false], ['nojs', false, true]]) await fresh(async (s) => {
      await viewport(s, { width: 390, height: 844, dpr: 1, mobile: true, reduced });
      if (nojs) await s.send('Emulation.setScriptExecutionDisabled', { value: true });
      await goto(s, url(p), 1500);
      const H = await s.eval('document.documentElement.scrollHeight');
      await shot(s, `${OUT}/${n}-390-${tag}-full.jpg`, { captureBeyondViewport: true, clip: { x: 0, y: 0, width: 390, height: Math.min(H, 16000), scale: 0.5 } });
    });
    console.log(`${n}: shots written`);
  }
}

if (mode === 'check') {
  for (const p of pages) await fresh(async (s) => {
    const errs = [];
    s.on('Runtime.consoleAPICalled', (e) => { if (e.type === 'error' || e.type === 'warning') errs.push(e.args.map((a) => a.value).join(' ')); });
    s.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails.text));
    await s.send('Log.enable'); s.on('Log.entryAdded', (e) => { if (e.entry.level === 'error') errs.push(e.entry.text); });
    const wide = [];
    for (const w of [320, 360, 390, 414, 768, 1024, 1280, 1440]) {
      await viewport(s, { width: w, height: 800, dpr: 1, mobile: w < 800 });
      await goto(s, url(p), 600);
      const over = await s.eval('document.documentElement.scrollWidth - innerWidth');
      if (over > 0) wide.push(`${w}: ${over}px`);
    }
    await viewport(s, { width: 390, height: 844, dpr: 1, mobile: true });
    await goto(s, url(p), 800);
    const small = await s.eval(`[...document.querySelectorAll('a,button')].filter(e => { const r = e.getBoundingClientRect(); const inline = getComputedStyle(e).display === 'inline' && e.closest('p'); return r.width && (r.height < 44 || r.width < 44) && !inline && !e.classList.contains('skip'); }).map(e => (e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height) + ' "' + e.textContent.trim().slice(0, 24) + '"')`);
    console.log(`${name(p)}: sideways ${wide.length ? wide.join(', ') : 'none'}; small targets ${small.length ? small.join('; ') : 'none'}; errors ${errs.length ? [...new Set(errs)].join(' | ') : 'none'}`);
  });
}

if (mode === 'speed') {
  const probe = `window.__m = { lcp: 0, el: '', cls: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { __m.lcp = e.startTime; const t = e.element; __m.el = t ? t.tagName.toLowerCase() + (t.className && typeof t.className === 'string' ? '.' + t.className.split(' ').join('.') : '') + (t.id ? '#' + t.id : '') : '(gone)'; __m.size = e.size; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) __m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });`;
  for (const p of pages) {
    const runs = [];
    for (let r = 0; r < 3; r++) runs.push(await fresh(async (s) => {
      await s.send('Network.enable');
      await s.send('Network.setCacheDisabled', { cacheDisabled: true });
      await s.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
      await s.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await viewport(s, { width: 390, height: 844, dpr: 3, mobile: true });
      await s.send('Page.addScriptToEvaluateOnNewDocument', { source: probe });
      await goto(s, url(p), 5000);
      return s.eval('JSON.parse(JSON.stringify(window.__m))');
    }));
    const lcp = runs.map((x) => Math.round(x.lcp)), cls = runs.map((x) => x.cls.toFixed(4));
    console.log(`${name(p)}: LCP ${lcp.join(', ')} ms (element ${[...new Set(runs.map((x) => x.el + ' ' + x.size))].join(' / ')}); CLS ${cls.join(', ')}`);
  }
}
server.close();
