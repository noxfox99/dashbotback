const express = require('express');
const https   = require('https');
const http    = require('http');
const path    = require('path');
const crypto  = require('crypto');

const app  = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helper: forward a request to target URL ──────────────────────
function proxyRequest(targetUrl, method, headers, body) {
  return new Promise((resolve, reject) => {
    const url  = new URL(targetUrl);
    const lib  = url.protocol === 'https:' ? https : http;
    const opts = {
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname + url.search,
      method:   method.toUpperCase(),
      headers:  { ...headers, host: url.hostname },
    };
    const req = lib.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ── GasFree proxy ─────────────────────────────────────────────────
// Frontend sends: POST /proxy/gasfree  { path, method, body?, apiKey, apiSecret }
// Proxy signs with HMAC-SHA256 and forwards to open.gasfree.io
app.all('/proxy/gasfree', async (req, res) => {
  try {
    const { gfPath, method, body, apiKey, apiSecret, baseUrl } = req.body;

    if (!gfPath || !apiKey || !apiSecret) {
      return res.status(400).json({ error: 'Missing gfPath / apiKey / apiSecret' });
    }

    const ts        = Math.floor(Date.now() / 1000);
    const m         = (method || 'GET').toUpperCase();
    const message   = `${m}${gfPath}${ts}`;
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(message)
      .digest('base64');

    const targetBase = (baseUrl || 'https://open.gasfree.io/tron').replace(/\/$/, '');
    const targetUrl  = targetBase + gfPath;

    const headers = {
      'Content-Type':  'application/json',
      'Timestamp':     String(ts),
      'Authorization': `ApiKey ${apiKey}:${signature}`,
    };

    const result = await proxyRequest(targetUrl, m, headers, body || null);
    res.status(result.status).json(JSON.parse(result.body));
  } catch (e) {
    console.error('[GasFree proxy error]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── TronGrid proxy ────────────────────────────────────────────────
// Frontend sends: POST /proxy/trongrid  { tgPath, method, body?, apiKey, rpc }
app.all('/proxy/trongrid', async (req, res) => {
  try {
    const { tgPath, method, body, apiKey, rpc } = req.body;

    if (!tgPath) return res.status(400).json({ error: 'Missing tgPath' });

    const baseRpc   = (rpc || 'https://api.trongrid.io').replace(/\/$/, '');
    const targetUrl = baseRpc + tgPath;
    const headers   = { 'Content-Type': 'application/json' };
    if (apiKey) headers['TRON-PRO-API-KEY'] = apiKey;

    const result = await proxyRequest(targetUrl, (method || 'GET').toUpperCase(), headers, body || null);
    res.status(result.status).json(JSON.parse(result.body));
  } catch (e) {
    console.error('[TronGrid proxy error]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

// ── Catch-all → index.html ────────────────────────────────────────
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TRONGF proxy running on port ${PORT}`));
