const express = require(‘express’);
const https   = require(‘https’);
const http    = require(‘http’);
const path    = require(‘path’);
const crypto  = require(‘crypto’);

const app = express();
app.use(express.json({ limit: ‘1mb’ }));
app.use(express.static(path.join(__dirname, ‘public’)));

// ─────────────────────────────────────────────────────────────────
// Low-level HTTP helper
// ─────────────────────────────────────────────────────────────────
function rawRequest(targetUrl, method, headers, bodyStr) {
return new Promise((resolve, reject) => {
const u      = new URL(targetUrl);
const lib    = u.protocol === ‘https:’ ? https : http;
const bodyBuf = bodyStr ? Buffer.from(bodyStr, ‘utf8’) : null;
const reqHeaders = {
‘host’:         u.hostname,
‘content-type’: ‘application/json’,
‘accept’:       ‘application/json’,
…headers,
};
if (bodyBuf) reqHeaders[‘content-length’] = String(bodyBuf.length);
const opts = {
hostname: u.hostname,
port:     u.port || (u.protocol === ‘https:’ ? 443 : 80),
path:     u.pathname + u.search,
method:   method.toUpperCase(),
headers:  reqHeaders,
};
const req = lib.request(opts, res => {
const chunks = [];
res.on(‘data’, c => chunks.push(c));
res.on(‘end’, () => resolve({
status:  res.statusCode,
rawBody: Buffer.concat(chunks).toString(‘utf8’),
}));
});
req.on(‘error’, reject);
if (bodyBuf) req.write(bodyBuf);
req.end();
});
}

function safeParse(str) {
try   { return { ok: true,  data: JSON.parse(str) }; }
catch { return { ok: false, data: null, raw: str  }; }
}

function hmacB64(secret, message) {
return crypto.createHmac(‘sha256’, secret).update(message).digest(‘base64’);
}

// ─────────────────────────────────────────────────────────────────
// /proxy/gasfree
//
// GasFree docs say:
//   message = METHOD + path + timestamp
//
// “path” is ambiguous — we try 3 variants in order and return
// the first non-401/403 response. Railway logs show which worked.
// ─────────────────────────────────────────────────────────────────
app.post(’/proxy/gasfree’, async (req, res) => {
const { gfPath, method, body, apiKey, apiSecret, baseUrl } = req.body || {};

if (!gfPath || !apiKey || !apiSecret) {
return res.status(400).json({ error: ‘Missing gfPath / apiKey / apiSecret’ });
}

const m          = (method || ‘GET’).toUpperCase();
const ts         = Math.floor(Date.now() / 1000);
const targetBase = (baseUrl || ‘https://open.gasfree.io/tron’).replace(//$/, ‘’);
const targetUrl  = targetBase + gfPath;
const bodyStr    = body ? JSON.stringify(body) : null;

// Extract the prefix path from baseUrl  e.g. “https://open.gasfree.io/tron” → “/tron”
const basePrefix = new URL(targetBase).pathname.replace(//$/, ‘’); // “/tron” or “/nile”

// 3 signature variants
const signPaths = [
gfPath,                   // /api/v1/address/T…
basePrefix + gfPath,      // /tron/api/v1/address/T…
gfPath.replace(’/api’, ‘’), // /v1/address/T…  (some docs omit /api)
];

console.log(`\n[GF] ${m} ${targetUrl}  ts=${ts}`);
signPaths.forEach((p, i) => {
const msg = `${m}${p}${ts}`;
console.log(`[GF] variant${i+1}: "${msg.substring(0,80)}"`);
});

let lastResult = { status: 500, rawBody: ‘No attempt made’ };

for (let i = 0; i < signPaths.length; i++) {
const message   = `${m}${signPaths[i]}${ts}`;
const signature = hmacB64(apiSecret, message);
const headers   = {
‘timestamp’:     String(ts),
‘authorization’: `ApiKey ${apiKey}:${signature}`,
};

```
try {
  const result = await rawRequest(targetUrl, m, headers, bodyStr);
  lastResult = result;
  console.log(`[GF] variant${i+1} → HTTP ${result.status}  "${result.rawBody.substring(0,120)}"`);

  if (result.status !== 401 && result.status !== 403) {
    const p = safeParse(result.rawBody);
    if (p.ok) return res.status(result.status).json(p.data);
    return res.status(result.status).json({ error: 'Non-JSON response', raw: result.rawBody });
  }
} catch (e) {
  console.error(`[GF] variant${i+1} error:`, e.message);
  lastResult = { status: 500, rawBody: e.message };
}
```

}

// All 3 failed
const p = safeParse(lastResult.rawBody);
return res.status(lastResult.status).json({
error:  p.ok ? (p.data.message || p.data.msg || JSON.stringify(p.data)) : lastResult.rawBody,
_debug: {
hint:      ‘All 3 HMAC variants returned 401/403 — double-check API Key and Secret in Config’,
ts,
method:    m,
gfPath,
targetUrl,
signedPaths: signPaths.map(sp => `${m}${sp}${ts}`),
}
});
});

// ─────────────────────────────────────────────────────────────────
// /proxy/trongrid
// ─────────────────────────────────────────────────────────────────
app.post(’/proxy/trongrid’, async (req, res) => {
const { tgPath, method, body, apiKey, rpc } = req.body || {};
if (!tgPath) return res.status(400).json({ error: ‘Missing tgPath’ });

const targetUrl = (rpc || ‘https://api.trongrid.io’).replace(//$/, ‘’) + tgPath;
const m         = (method || ‘GET’).toUpperCase();
const bodyStr   = body ? JSON.stringify(body) : null;
const headers   = {};
if (apiKey) headers[‘tron-pro-api-key’] = apiKey;

console.log(`[TG] ${m} ${targetUrl}`);

try {
const result = await rawRequest(targetUrl, m, headers, bodyStr);
console.log(`[TG] HTTP ${result.status}  "${result.rawBody.substring(0,120)}"`);
const p = safeParse(result.rawBody);
if (p.ok) return res.status(result.status).json(p.data);
return res.status(result.status).json({ error: result.rawBody });
} catch (e) {
console.error(’[TG error]’, e.message);
return res.status(500).json({ error: e.message });
}
});

// ─────────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────────
app.get(’/health’, (*, res) => res.json({ ok: true, ts: Date.now(), node: process.version }));
app.get(’*’, (*, res) => res.sendFile(path.join(__dirname, ‘public’, ‘index.html’)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`✓ TRONGF proxy on port ${PORT}`);
});
