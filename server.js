const express = require('express');
const https   = require('https');
const http    = require('http');
const path    = require('path');
const crypto  = require('crypto');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────────────────────────
// TronWeb for server-side TIP-712 signing
// ─────────────────────────────────────────────────────────────────
let TronWeb;
try {
  TronWeb = require('tronweb');
  // handle both default and named exports
  if (TronWeb.TronWeb) TronWeb = TronWeb.TronWeb;
  else if (TronWeb.default) TronWeb = TronWeb.default;
  console.log('✓ TronWeb loaded on server');
} catch(e) {
  console.warn('⚠ TronWeb not available:', e.message);
}

const GASFREE_DOMAIN_MAINNET = {
  name: 'GasFreeController',
  version: 'V1.0.0',
  chainId: 3448148188,
  verifyingContract: 'THQGuFzL87ZqhxkgqYEryRAd7gqFqL5rdc'
};
const GASFREE_DOMAIN_NILE = {
  name: 'GasFreeController',
  version: 'V1.0.0',
  chainId: 3448148188,
  verifyingContract: 'TF49HXMbDdpKbHoRiFxoXTAZZEcRpGFfYx'
};
const PERMIT_TYPES = {
  PermitTransfer: [
    { name: 'token',           type: 'address' },
    { name: 'serviceProvider', type: 'address' },
    { name: 'user',            type: 'address' },
    { name: 'receiver',        type: 'address' },
    { name: 'value',           type: 'uint256' },
    { name: 'maxFee',          type: 'uint256' },
    { name: 'deadline',        type: 'uint256' },
    { name: 'version',         type: 'uint256' },
    { name: 'nonce',           type: 'uint256' },
  ]
};

// ─────────────────────────────────────────────────────────────────
// Low-level HTTP helper
// ─────────────────────────────────────────────────────────────────
function rawRequest(targetUrl, method, headers, bodyStr) {
  return new Promise((resolve, reject) => {
    const u       = new URL(targetUrl);
    const lib     = u.protocol === 'https:' ? https : http;
    const bodyBuf = bodyStr ? Buffer.from(bodyStr, 'utf8') : null;
    const reqHeaders = {
      'host':         u.hostname,
      'content-type': 'application/json',
      'accept':       'application/json',
      ...headers,
    };
    if (bodyBuf) reqHeaders['content-length'] = String(bodyBuf.length);
    const opts = {
      hostname: u.hostname,
      port:     u.port || (u.protocol === 'https:' ? 443 : 80),
      path:     u.pathname + u.search,
      method:   method.toUpperCase(),
      headers:  reqHeaders,
    };
    const req = lib.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        status:  res.statusCode,
        rawBody: Buffer.concat(chunks).toString('utf8'),
      }));
    });
    req.on('error', reject);
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function safeParse(str) {
  try   { return { ok: true,  data: JSON.parse(str) }; }
  catch { return { ok: false, data: null, raw: str  }; }
}

function hmacB64(secret, message) {
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

// ─────────────────────────────────────────────────────────────────
// /proxy/sign  — TIP-712 signing on server (Node.js Buffer works natively)
// Body: { privKey, permitMessage, network }
// ─────────────────────────────────────────────────────────────────
app.post('/proxy/sign', async (req, res) => {
  if (!TronWeb) return res.status(500).json({ error: 'TronWeb not installed on server. Run: npm install tronweb' });

  const { privKey, permitMessage, network, rpc, tgKey } = req.body || {};
  if (!privKey || !permitMessage) return res.status(400).json({ error: 'Missing privKey or permitMessage' });

  try {
    const fullHost = rpc || 'https://api.trongrid.io';
    const headers  = tgKey ? { 'TRON-PRO-API-KEY': tgKey } : {};
    const tw = new TronWeb({ fullHost, headers });
    tw.setPrivateKey(privKey);

    const domain = (network === 'nile') ? GASFREE_DOMAIN_NILE : GASFREE_DOMAIN_MAINNET;

    console.log('[Sign] domain:', JSON.stringify(domain));
    console.log('[Sign] message:', JSON.stringify(permitMessage));

    const sig = await tw.trx._signTypedData(domain, PERMIT_TYPES, permitMessage);
    const signature = sig.replace(/^0x/, '');

    console.log('[Sign] signature:', signature);
    res.json({ signature });
  } catch(e) {
    console.error('[Sign error]', e.message, e.stack);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// /proxy/gasfree  — GasFree API proxy with HMAC-SHA256 auth
// Body: { gfPath, method, body?, apiKey, apiSecret, baseUrl? }
// ─────────────────────────────────────────────────────────────────
app.post('/proxy/gasfree', async (req, res) => {
  const { gfPath, method, body, apiKey, apiSecret, baseUrl } = req.body || {};
  if (!gfPath || !apiKey || !apiSecret) {
    return res.status(400).json({ error: 'Missing gfPath / apiKey / apiSecret' });
  }

  const m          = (method || 'GET').toUpperCase();
  const ts         = Math.floor(Date.now() / 1000);
  const targetBase = (baseUrl || 'https://open.gasfree.io/tron').replace(/\/$/, '');
  const targetUrl  = targetBase + gfPath;
  const bodyStr    = body ? JSON.stringify(body) : null;
  const basePrefix = new URL(targetBase).pathname.replace(/\/$/, '');

  // Try 3 signature path variants
  const signPaths = [
    gfPath,
    basePrefix + gfPath,
    gfPath.replace('/api', ''),
  ];

  console.log(`\n[GF] ${m} ${targetUrl}  ts=${ts}`);

  let lastResult = { status: 500, rawBody: 'No attempt' };

  for (let i = 0; i < signPaths.length; i++) {
    const signature = hmacB64(apiSecret, `${m}${signPaths[i]}${ts}`);
    const headers = {
      'timestamp':     String(ts),
      'authorization': `ApiKey ${apiKey}:${signature}`,
    };
    try {
      const result = await rawRequest(targetUrl, m, headers, bodyStr);
      console.log(`[GF] variant${i+1} → HTTP ${result.status}  "${result.rawBody.substring(0,200)}"`);
      lastResult = result;
      if (result.status !== 401 && result.status !== 403) {
        const p = safeParse(result.rawBody);
        if (p.ok) return res.status(result.status).json(p.data);
        return res.status(result.status).json({ error: 'Non-JSON', raw: result.rawBody });
      }
    } catch(e) {
      lastResult = { status: 500, rawBody: e.message };
    }
  }

  const p = safeParse(lastResult.rawBody);
  return res.status(lastResult.status).json({
    error: p.ok ? (p.data.message || JSON.stringify(p.data)) : lastResult.rawBody,
    _debug: { hint: 'All HMAC variants failed — check API Key and Secret', ts, method: m, gfPath, targetUrl }
  });
});

// ─────────────────────────────────────────────────────────────────
// /proxy/trongrid
// ─────────────────────────────────────────────────────────────────
app.post('/proxy/trongrid', async (req, res) => {
  const { tgPath, method, body, apiKey, rpc } = req.body || {};
  if (!tgPath) return res.status(400).json({ error: 'Missing tgPath' });

  const targetUrl = (rpc || 'https://api.trongrid.io').replace(/\/$/, '') + tgPath;
  const m         = (method || 'GET').toUpperCase();
  const headers   = {};
  if (apiKey) headers['tron-pro-api-key'] = apiKey;

  console.log(`[TG] ${m} ${targetUrl}`);
  try {
    const result = await rawRequest(targetUrl, m, headers, body ? JSON.stringify(body) : null);
    console.log(`[TG] HTTP ${result.status}`);
    const p = safeParse(result.rawBody);
    if (p.ok) return res.status(result.status).json(p.data);
    return res.status(result.status).json({ error: result.rawBody });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// Health / SPA
// ─────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true, tronweb: !!TronWeb, ts: Date.now() }));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✓ TRONGF proxy on port ${PORT}`));
