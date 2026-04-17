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

let tip712;
try {
  tip712 = require('./tip712');
  console.log('✓ TIP-712 custom signer loaded');
} catch(e) {
  console.warn('⚠ TIP-712 module error:', e.message);
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
// /proxy/sign  — TIP-712 signing only
// Body: { privKey, permitMessage, network, rpc?, tgKey? }
// ─────────────────────────────────────────────────────────────────
app.post('/proxy/sign', async (req, res) => {
  if (!TronWeb) return res.status(500).json({ error: 'TronWeb not installed. Run: npm install tronweb' });
  const { privKey, permitMessage, network, rpc, tgKey } = req.body || {};
  if (!privKey || !permitMessage) return res.status(400).json({ error: 'Missing privKey or permitMessage' });
  try {
    const domain = (network === 'nile') ? GASFREE_DOMAIN_NILE : GASFREE_DOMAIN_MAINNET;
    let signature;
    if (tip712) {
      signature = tip712.signPermitTransfer(domain, permitMessage, privKey);
    } else {
      const tw = new TronWeb({ fullHost: rpc || 'https://api.trongrid.io' });
      tw.setPrivateKey(privKey);
      const raw = await tw.trx._signTypedData(domain, PERMIT_TYPES, permitMessage);
      signature = raw.replace(/^0x/, '');
    }
    res.json({ signature });
  } catch(e) {
    console.error('[Sign error]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// /proxy/transfer  — full GasFree transfer flow on server
// Signs TIP-712 + submits to GasFree API, all in one call
// Body: { privKey, fromAddr, toAddr, amountUsdt, maxFeeUsdt,
//         apiKey, apiSecret, baseUrl, provider, usdt, network, rpc, tgKey }
// ─────────────────────────────────────────────────────────────────
app.post('/proxy/transfer', async (req, res) => {
  if (!TronWeb) return res.status(500).json({ error: 'TronWeb not installed. Run: npm install tronweb' });

  const {
    privKey, fromAddr, toAddr,
    amountUsdt, maxFeeUsdt,
    apiKey, apiSecret, baseUrl,
    provider, usdt,
    network, rpc, tgKey,
  } = req.body || {};

  if (!privKey || !fromAddr || !toAddr) return res.status(400).json({ error: 'Missing required fields' });
  if (!apiKey || !apiSecret)            return res.status(400).json({ error: 'Missing apiKey / apiSecret' });
  if (!provider)                        return res.status(400).json({ error: 'Missing provider address' });

  try {
    const gfBase  = (baseUrl || 'https://open.gasfree.io/tron').replace(/\/$/, '');
    const rpcUrl  = rpc || 'https://api.trongrid.io';
    const usdtAddr = usdt || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

    // ── Step 1: get nonce from GasFree ──────────────────────────
    const acctPath = `/api/v1/address/${fromAddr}`;
    const acctData = await gfApiGet(gfBase, acctPath, apiKey, apiSecret);
    const acct     = acctData.data || acctData;
    const nonce    = Number(acct.nonce ?? 0);
    console.log(`[Transfer] nonce=${nonce} active=${acct.active}`);

    // ── Step 2: build permit message ────────────────────────────
    const valueInt  = Math.round(parseFloat(amountUsdt) * 1e6);
    const maxFeeInt = Math.round(parseFloat(maxFeeUsdt || 5) * 1e6);
    const deadline  = Math.floor(Date.now() / 1000) + 600;

    const permitMessage = {
      token:           usdtAddr,
      serviceProvider: provider,
      user:            fromAddr,
      receiver:        toAddr,
      value:           valueInt,
      maxFee:          maxFeeInt,
      deadline:        deadline,
      version:         1,
      nonce:           nonce,
    };
    console.log('[Transfer] permit:', JSON.stringify(permitMessage));

    // ── Step 3: TIP-712 sign ─────────────────────────────────────
    const domain = (network === 'nile') ? GASFREE_DOMAIN_NILE : GASFREE_DOMAIN_MAINNET;
    let sig;
    if (tip712) {
      // Use our custom TIP-712 signer with proper TRON address encoding
      sig = tip712.signPermitTransfer(domain, permitMessage, privKey);
    } else {
      // Fallback to TronWeb _signTypedData
      const tw = new TronWeb({ fullHost: rpcUrl });
      tw.setPrivateKey(privKey);
      const rawSig = await tw.trx._signTypedData(domain, PERMIT_TYPES, permitMessage);
      sig = rawSig.replace(/^0x/, '');
    }
    console.log('[Transfer] sig:', sig);

    // ── Step 4: submit — exact body format from GasFree Ruby SDK ─
    // value/maxFee = string, deadline = number, nonce = number, sig = string
    const body = {
      token:           usdtAddr,
      serviceProvider: provider,
      user:            fromAddr,
      receiver:        toAddr,
      value:           String(valueInt),
      maxFee:          String(maxFeeInt),
      deadline:        deadline,
      version:         1,
      nonce:           nonce,
      sig:             sig,
    };
    console.log('[Transfer] submit body:', JSON.stringify(body));

    const result = await gfApiPost(gfBase, '/api/v1/transfer', apiKey, apiSecret, body);
    console.log('[Transfer] result:', JSON.stringify(result));

    if (result.code && result.code !== 200) {
      return res.status(200).json({
        error: result.message || result.reason || JSON.stringify(result),
        raw:   result,
      });
    }
    res.json(result);
  } catch(e) {
    console.error('[Transfer error]', e.message, e.stack);
    res.status(500).json({ error: e.message });
  }
});

// ── GasFree API helpers (server-side) ─────────────────────────────
async function gfApiGet(base, path, apiKey, apiSecret) {
  const ts  = Math.floor(Date.now() / 1000);
  const sig = hmacB64(apiSecret, `GET${base.replace(/https?:\/\/[^/]+/, '')}${path}${ts}`);
  const result = await rawRequest(base + path, 'GET', {
    'timestamp':     String(ts),
    'authorization': `ApiKey ${apiKey}:${sig}`,
  }, null);
  const p = safeParse(result.rawBody);
  if (!p.ok) throw new Error('GasFree non-JSON: ' + result.rawBody.substring(0, 200));
  return p.data;
}

async function gfApiPost(base, path, apiKey, apiSecret, body) {
  const ts  = Math.floor(Date.now() / 1000);
  // variant2 path = /tron + path (what worked for GET)
  const basePrefix = new URL(base).pathname.replace(/\/$/, '');
  const signPath   = basePrefix + path;
  const sig = hmacB64(apiSecret, `POST${signPath}${ts}`);
  const result = await rawRequest(base + path, 'POST', {
    'timestamp':     String(ts),
    'authorization': `ApiKey ${apiKey}:${sig}`,
  }, JSON.stringify(body));
  console.log(`[GF POST] HTTP ${result.status}: ${result.rawBody.substring(0, 300)}`);
  const p = safeParse(result.rawBody);
  if (!p.ok) throw new Error('GasFree non-JSON: ' + result.rawBody.substring(0, 200));
  return p.data;
}

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
