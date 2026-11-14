// Small DevTools-protocol kit shared by tools/capture-work.mjs and tools/shots.mjs.
// Plain Node 22 (global WebSocket), the local Chrome, no packages.
// Ports follow the studio's local rule: static servers on 4421 to 4429, Chrome on 9600 to 9649.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome'].find((c) => fs.existsSync(c));
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain' };
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Static server with byte ranges, so <video> can seek.
export function serve(root, port) {
  root = path.resolve(root);
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    const size = fs.statSync(f).size;
    const type = MIME[path.extname(f).toLowerCase()] || 'application/octet-stream';
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (m) {
      const a = m[1] ? +m[1] : 0, b = m[2] ? +m[2] : size - 1;
      res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${a}-${b}/${size}`, 'accept-ranges': 'bytes', 'content-length': b - a + 1 });
      fs.createReadStream(f, { start: a, end: b }).pipe(res);
      return;
    }
    res.writeHead(200, { 'content-type': type, 'content-length': size, 'accept-ranges': 'bytes' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r, j) => { server.once('error', j); server.listen(port, '127.0.0.1', () => r(server)); });
}

export async function chrome(port = 9611) {
  if (!CHROME) throw new Error('no Chrome found');
  const prof = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'cdp-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 250 && !ws; i++) {
    await wait(100);
    try { const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); ws = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
  }
  if (!ws) { proc.kill(); throw new Error('Chrome did not start'); }
  const s = await session(ws);
  s.close = async () => {
    try { s.ws.close(); } catch {}
    const gone = new Promise((r) => proc.once('exit', r));
    proc.kill();
    await Promise.race([gone, wait(3000)]);
    try { fs.rmSync(prof, { recursive: true, force: true, maxRetries: 5 }); } catch {}
  };
  return s;
}

function session(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const handlers = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method) (handlers.get(m.method) || []).forEach((h) => h(m.params));
  };
  const s = {
    ws,
    send: (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); }),
    on: (method, h) => { if (!handlers.has(method)) handlers.set(method, []); handlers.get(method).push(h); },
    once: (method) => new Promise((r) => { const h = (p) => { handlers.set(method, handlers.get(method).filter((x) => x !== h)); r(p); }; s.on(method, h); }),
    eval: async (expression) => (await s.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value,
  };
  return new Promise((r) => { ws.onopen = () => r(s); });
}

export async function viewport(s, { width, height, dpr = 1, mobile = false, dark = false, reduced = false }) {
  await s.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  await s.send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await s.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
}

export async function goto(s, url, settle = 600) {
  const loaded = s.once('Page.loadEventFired');
  await s.send('Page.navigate', { url });
  await Promise.race([loaded, wait(15000)]);
  await s.eval('document.fonts.ready.then(() => true)');
  await wait(settle);
}

export async function shot(s, file, opts = {}) {
  const { data } = await s.send('Page.captureScreenshot', { format: file.endsWith('.png') ? 'png' : 'jpeg', quality: file.endsWith('.png') ? undefined : 82, ...opts });
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
}
