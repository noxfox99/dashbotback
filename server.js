const express = require('express');
const https   = require('https');
const http    = require('http');
const path    = require('path');
const crypto  = require('crypto');
const fs      = require('fs');

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

// Official GasFree SDK — try multiple known package names
let TronGasFree;
const SDK_CANDIDATES = [
  '@gasfree/gasfree-sdk',       // NestJS example uses this
  'gasfree-tron-sdk',           // alternate
  '@tronlink/gasfree-sdk-js',   // old TronLink name
];
for (const pkgName of SDK_CANDIDATES) {
  try {
    const gfSdk = require(pkgName);
    const ctor = gfSdk.TronGasFree || gfSdk.default?.TronGasFree || gfSdk.default;
    if (typeof ctor === 'function') {
      TronGasFree = ctor;
      console.log(`✓ GasFree SDK loaded from ${pkgName}`);
      break;
    }
  } catch(e) { /* not installed */ }
}
if (!TronGasFree) console.warn('⚠ No GasFree SDK found — using custom tip712.js');

// Two known mainnet verifyingContract addresses — server will try both
const GASFREE_DOMAIN_MAINNET = {
  name: 'GasFreeController',
  version: 'V1.0.0',
  chainId: 728126428,          // 0x2b6653dc — TRON Mainnet
  verifyingContract: 'THQGuFzL87ZqhxkgqYEryRAd7gqFqL5rdc'  // from official docs
};
const GASFREE_DOMAIN_MAINNET_ALT = {
  name: 'GasFreeController',
  version: 'V1.0.0',
  chainId: 728126428,
  verifyingContract: 'TFFAMQLZybALaLb4uxHA9RBE7pxhUAjF3U'  // from Ruby SDK
};
const GASFREE_DOMAIN_NILE = {
  name: 'GasFreeController',
  version: 'V1.0.0',
  chainId: 3448148188,         // 0xcd8690dc — Nile Testnet
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

// Build GasFree HMAC message string — format: "METHOD PATH TIMESTAMP" (with spaces)
function gfMessage(method, path, ts) {
  return `${method.toUpperCase()} ${path} ${ts}`;
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
    // Use official GasFree SDK if available — it handles TIP-712 correctly
    let sig;
    if (TronGasFree) {
      try {
        const chainId = network === 'nile' ? Number('0xcd8690dc') : Number('0x2b6653dc');
        const gasFree = new TronGasFree({ chainId });
        const { domain, types, message } = gasFree.assembleGasFreeTransactionJson({
          token:           usdtAddr,
          serviceProvider: provider,
          user:            fromAddr,
          receiver:        toAddr,
          value:           String(valueInt),
          maxFee:          String(maxFeeInt),
          deadline:        String(deadline),
          version:         '1',
          nonce:           String(nonce),
        });
        console.log('[Transfer] SDK domain:', JSON.stringify(domain));
        console.log('[Transfer] SDK message:', JSON.stringify(message));
        const tw = new TronWeb({ fullHost: rpcUrl });
        tw.setPrivateKey(privKey);
        const rawSig = await tw.trx._signTypedData(domain, types, message, privKey);
        sig = rawSig.replace(/^0x/, '');
        console.log('[Transfer] SDK sig:', sig);
      } catch(e) {
        console.warn('[Transfer] SDK signing failed, falling back to tip712:', e.message);
        TronGasFree = null; // disable for next attempts
      }
    }

    if (!sig) {
      // Fallback: try TronWeb _signTypedData with 4 args (privKey as last param)
      try {
        const domain = network === 'nile' ? GASFREE_DOMAIN_NILE : GASFREE_DOMAIN_MAINNET;
        const tw = new TronWeb({ fullHost: rpcUrl });
        tw.setPrivateKey(privKey);
        // TronWeb v5: _signTypedData(domain, types, message, privateKey)
        // privateKey as 4th arg is required to sign without browser wallet
        const rawSig = await tw.trx._signTypedData(domain, PERMIT_TYPES, permitMessage, privKey);
        sig = rawSig.replace(/^0x/, '');
        console.log('[Transfer] TronWeb 4-arg sig:', sig.substring(0,20) + '...');
      } catch(e) {
        console.warn('[Transfer] TronWeb 4-arg failed:', e.message);
        // Last resort: custom tip712.js
        const domain = network === 'nile' ? GASFREE_DOMAIN_NILE : GASFREE_DOMAIN_MAINNET;
        if (!tip712) throw new Error('No signing method available');
        sig = tip712.signPermitTransfer(domain, permitMessage, privKey);
        console.log('[Transfer] custom tip712 sig:', sig.substring(0,20) + '...');
      }
    }

    // ── Step 4: submit ───────────────────────────────────────────
    const body = {
      token:           usdtAddr,
      serviceProvider: provider,
      user:            fromAddr,
      receiver:        toAddr,
      value:           String(valueInt),
      maxFee:          String(maxFeeInt),
      deadline:        String(deadline),
      version:         1,
      nonce:           parseInt(nonce),
      sig:             sig,
    };

    let lastResult;
    const endpoints = ['/api/v1/gasfree/submit', '/api/v1/transfer'];
    for (const ep of endpoints) {
      console.log(`[Transfer] trying ${ep}:`, JSON.stringify(body));
      try {
        const result = await gfApiPost(gfBase, ep, apiKey, apiSecret, body);
        console.log(`[Transfer] ${ep} result:`, JSON.stringify(result));
        lastResult = result;
        if (!result.code || result.code === 200) {
          return res.json(result);
        }
        if (result.code === 400) break;
      } catch(e) {
        console.warn(`[Transfer] ${ep} error:`, e.message);
        lastResult = { code: 500, message: e.message };
      }
    }

    const errMsg = lastResult?.message || lastResult?.reason || JSON.stringify(lastResult);
    return res.status(200).json({ error: `GasFree: ${errMsg}`, raw: lastResult });

  } catch(e) {
    console.error('[Transfer error]', e.message, e.stack);
    res.status(500).json({ error: e.message });
  }
});

// ── GasFree API helpers (server-side) ─────────────────────────────
// GasFree API request — HMAC format: METHOD + /tron + path + timestamp (no spaces)
// This is the only format that passes 401, confirmed from logs
async function gfRequest(base, path, method, apiKey, apiSecret, body) {
  const ts         = Math.floor(Date.now() / 1000);
  const basePrefix = new URL(base).pathname.replace(/\/$/, ''); // "/tron"
  const m          = method.toUpperCase();
  // Working format from logs: no spaces, includes /tron prefix
  const signMsg    = `${m}${basePrefix}${path}${ts}`;
  const sig        = hmacB64(apiSecret, signMsg);
  console.log(`[GF] ${m} sign: "${signMsg.substring(0,80)}"`);

  const bodyStr = body ? JSON.stringify(body) : null;
  const result = await rawRequest(base + path, m, {
    'timestamp':     String(ts),
    'x-timestamp':   String(ts),
    'authorization': `ApiKey ${apiKey}:${sig}`,
  }, bodyStr);

  console.log(`[GF] HTTP ${result.status}: ${result.rawBody.substring(0, 400)}`);
  const p = safeParse(result.rawBody);
  if (!p.ok) throw new Error('GasFree non-JSON: ' + result.rawBody);
  return p.data;
}

async function gfApiGet(base, path, apiKey, apiSecret) {
  return gfRequest(base, path, 'GET', apiKey, apiSecret, null);
}

async function gfApiPost(base, path, apiKey, apiSecret, body) {
  return gfRequest(base, path, 'POST', apiKey, apiSecret, body);
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

  // Try signature variants: with and without spaces, with and without base prefix
  const signMessages = [
    gfMessage(m, basePrefix + gfPath, ts),   // "GET /tron/api/v1/... ts" ← correct per working code
    gfMessage(m, gfPath, ts),                // "GET /api/v1/... ts"
    `${m}${basePrefix}${gfPath}${ts}`,       // "GET/tron/api/v1/...ts" no spaces
    `${m}${gfPath}${ts}`,                    // "GET/api/v1/...ts" no spaces
  ];

  console.log(`\n[GF] ${m} ${targetUrl}  ts=${ts}`);
  console.log(`[GF] trying messages:`, signMessages);

  let lastResult = { status: 500, rawBody: 'No attempt' };

  for (let i = 0; i < signMessages.length; i++) {
    const signature = hmacB64(apiSecret, signMessages[i]);
    const headers = {
      'timestamp':     String(ts),
      'x-timestamp':   String(ts),
      'authorization': `ApiKey ${apiKey}:${signature}`,
    };
    try {
      const result = await rawRequest(targetUrl, m, headers, bodyStr);
      console.log(`[GF] variant${i+1} → HTTP ${result.status}  "${result.rawBody}"`);
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
// AUTH — passwords stored server-side only, never sent to client
// ─────────────────────────────────────────────────────────────────
const USERS = {
  admin: { password: 'NOM7!jlPO098rgJNB', role: 'admin' },
  mull:  { password: 'MJkiu786srQdgLOJ',  role: 'mull'  },
  time:  { password: 'TBON68ettQ11!jl432AS',  role: 'time'  },
  sov:   { password: 'SnjOLKJbn8!jhjKKL0',   role: 'sov'   },
  rail:  { password: 'Rbn909y0oON!4',  role: 'rail'  },
  temp:  { password: 'TJem5*(MKL70O55',  role: 'temp'  },
};

// Simple session tokens stored in memory
// (survive until server restart — good enough for this use case)
const SESSIONS = new Map();
function makeToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

app.post('/auth/login', (req, res) => {
  const { userId, password } = req.body || {};
  const user = userId && USERS[userId.toLowerCase().trim()];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }
  const token = makeToken();
  SESSIONS.set(token, { userId: userId.toLowerCase().trim(), role: user.role, ts: Date.now() });
  console.log(`[Auth] Login: ${userId} → token issued`);
  res.json({ token, role: user.role });
});

app.post('/auth/logout', (req, res) => {
  const token = req.headers['x-auth-token'] || req.body?.token;
  if (token) SESSIONS.delete(token);
  res.json({ ok: true });
});

app.get('/auth/check', (req, res) => {
  const token = req.headers['x-auth-token'];
  const session = token && SESSIONS.get(token);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ role: session.role, userId: session.userId });
});

// ─────────────────────────────────────────────────────────────────
// PERSISTENT STORAGE — data.json on server
// Stores: wallets (with private keys), config per user role
// ─────────────────────────────────────────────────────────────────
// Data file: use /data if it exists (Railway Volume), otherwise local __dirname
const DATA_DIR  = require('fs').existsSync('/data') ? '/data' : __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
console.log('[Storage] data file:', DATA_FILE);

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch(e) {
    console.error('[Storage] read error:', e.message);
  }
  return { wallets: {}, config: {} };
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch(e) {
    console.error('[Storage] write error:', e.message);
    return false;
  }
}

// GET /storage — load all data for current user role
app.get('/storage', (req, res) => {
  const data = readData();
  res.json(data);
});

// POST /storage — save all data
app.post('/storage', (req, res) => {
  const incoming = req.body || {};
  if (!incoming.wallets && !incoming.config) {
    return res.status(400).json({ error: 'Missing wallets or config' });
  }
  const current = readData();
  // Merge: incoming wallets override existing per project
  if (incoming.wallets) {
    Object.assign(current.wallets, incoming.wallets);
  }
  if (incoming.config) {
    Object.assign(current.config, incoming.config);
  }
  const ok = writeData(current);
  res.json({ ok, ts: Date.now() });
});

// PATCH /storage/wallets/:projId — save wallets for one project
app.patch('/storage/wallets/:projId', (req, res) => {
  const { projId } = req.params;
  const walletData = req.body;
  if (!walletData) return res.status(400).json({ error: 'Missing body' });
  const data = readData();
  data.wallets[projId] = walletData;
  const ok = writeData(data);
  console.log(`[Storage] saved wallets for ${projId}`);
  res.json({ ok, ts: Date.now() });
});

// PATCH /storage/config — save config
app.patch('/storage/config', (req, res) => {
  const cfg = req.body;
  if (!cfg) return res.status(400).json({ error: 'Missing body' });
  const data = readData();
  data.config = { ...data.config, ...cfg };
  const ok = writeData(data);
  console.log('[Storage] config saved');
  res.json({ ok, ts: Date.now() });
});

// ─────────────────────────────────────────────────────────────────
// Health / SPA
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// /proxy/send-trx  — send TRX from master wallet to activate EOA
// Body: { fromPrivKey, toAddr, amountTrx, rpc, tgKey }
// ─────────────────────────────────────────────────────────────────
app.post('/proxy/send-trx', async (req, res) => {
  if (!TronWeb) return res.status(500).json({ error: 'TronWeb not loaded' });
  const { fromPrivKey, toAddr, amountTrx, rpc, tgKey } = req.body || {};
  if (!fromPrivKey || !toAddr || !amountTrx) {
    return res.status(400).json({ error: 'Missing fromPrivKey / toAddr / amountTrx' });
  }
  try {
    const fullHost = rpc || 'https://api.trongrid.io';
    const headers  = tgKey ? { 'TRON-PRO-API-KEY': tgKey } : {};
    const tw = new TronWeb({ fullHost, headers });
    tw.setPrivateKey(fromPrivKey.replace(/^0x/, ''));

    const amountSun = Math.round(parseFloat(amountTrx) * 1_000_000); // TRX → SUN
    console.log(`[TRX] sending ${amountTrx} TRX (${amountSun} SUN) to ${toAddr}`);

    const tx      = await tw.transactionBuilder.sendTrx(toAddr, amountSun);
    const signedTx = await tw.trx.sign(tx, fromPrivKey.replace(/^0x/, ''));
    const result   = await tw.trx.sendRawTransaction(signedTx);

    console.log('[TRX] result:', JSON.stringify(result));
    if (result.result || result.txid) {
      res.json({ ok: true, txid: result.txid || result.transaction?.txID, result });
    } else {
      res.status(200).json({ ok: false, error: result.message || JSON.stringify(result), result });
    }
  } catch(e) {
    console.error('[TRX send error]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (_, res) => res.json({ ok: true, tronweb: !!TronWeb, ts: Date.now() }));

// Debug: verify that a private key produces the expected address
app.post('/proxy/verify-key', (req, res) => {
  if (!TronWeb) return res.status(500).json({ error: 'TronWeb not loaded' });
  const { privKey } = req.body || {};
  if (!privKey) return res.status(400).json({ error: 'Missing privKey' });
  try {
    const tw = new TronWeb({ fullHost: 'https://api.trongrid.io' });
    const addr = tw.address.fromPrivateKey(privKey.replace(/^0x/, ''));
    res.json({ address: addr });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✓ TRONGF proxy on port ${PORT}`));
