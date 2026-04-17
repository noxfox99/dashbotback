/**
 * TIP-712 signer for GasFree TRON transfers
 * Manual implementation to ensure correct TRON address encoding.
 *
 * TIP-712 vs EIP-712 difference:
 *   TRON addresses are base58check with 0x41 prefix (21 bytes).
 *   For ABI encoding, strip the 0x41 byte and treat remaining 20 bytes as uint160.
 */

const TronWeb = require('tronweb');
const TW = TronWeb.TronWeb || TronWeb.default || TronWeb;

// ── keccak256 via ethereum-cryptography ───────────────────────────
const { keccak256: _keccak } = require('ethereum-cryptography/keccak');
function keccak256(buf) {
  return Buffer.from(_keccak(buf instanceof Buffer ? buf : Buffer.from(buf)));
}

// ── TRON base58check → 32-byte padded hex ────────────────────────
function tronAddrTo32Bytes(addr) {
  // TronWeb.utils.crypto.decodeBase58Address returns hex string like "41abcd..."
  // or use address.toHex which returns "41abcd..."
  const tw = new TW({ fullHost: 'https://api.trongrid.io' });
  let hex = tw.address.toHex(addr); // returns "41" + 40 hex chars = 42 chars
  if (!hex) throw new Error('Cannot convert address: ' + addr);
  hex = hex.replace(/^0x/, '');
  // Strip the leading "41" (TRON network byte) → 40 hex chars = 20 bytes
  if (hex.startsWith('41')) hex = hex.slice(2);
  else if (hex.startsWith('a0')) hex = hex.slice(2); // Nile prefix
  // Pad to 32 bytes (64 hex chars)
  return hex.padStart(64, '0');
}

// ── ABI encode uint256 → 32 bytes ────────────────────────────────
function uint256(val) {
  return BigInt(val).toString(16).padStart(64, '0');
}

// ── Type strings ─────────────────────────────────────────────────
const DOMAIN_TYPE =
  'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)';

const PERMIT_TYPE =
  'PermitTransfer(' +
  'address token,' +
  'address serviceProvider,' +
  'address user,' +
  'address receiver,' +
  'uint256 value,' +
  'uint256 maxFee,' +
  'uint256 deadline,' +
  'uint256 version,' +
  'uint256 nonce' +
  ')';

// ── Hash the domain separator ─────────────────────────────────────
function hashDomain(domain) {
  const typeHash    = keccak256(Buffer.from(DOMAIN_TYPE));
  const nameHash    = keccak256(Buffer.from(domain.name));
  const verHash     = keccak256(Buffer.from(domain.version));
  const chainId     = Buffer.from(uint256(domain.chainId), 'hex');
  const contract    = Buffer.from(tronAddrTo32Bytes(domain.verifyingContract), 'hex');

  console.log('[TIP712] domainTypeHash:', typeHash.toString('hex'));
  console.log('[TIP712] nameHash:', nameHash.toString('hex'));
  console.log('[TIP712] verHash:', verHash.toString('hex'));
  console.log('[TIP712] chainId32:', chainId.toString('hex'));
  console.log('[TIP712] contract32:', contract.toString('hex'));

  const encoded = Buffer.concat([typeHash, nameHash, verHash, chainId, contract]);
  return keccak256(encoded);
}

// ── Hash the permit message ───────────────────────────────────────
function hashMessage(msg) {
  const typeHash = keccak256(Buffer.from(PERMIT_TYPE));

  const token    = Buffer.from(tronAddrTo32Bytes(msg.token),           'hex');
  const provider = Buffer.from(tronAddrTo32Bytes(msg.serviceProvider),  'hex');
  const user     = Buffer.from(tronAddrTo32Bytes(msg.user),             'hex');
  const receiver = Buffer.from(tronAddrTo32Bytes(msg.receiver),         'hex');
  const value    = Buffer.from(uint256(msg.value),    'hex');
  const maxFee   = Buffer.from(uint256(msg.maxFee),   'hex');
  const deadline = Buffer.from(uint256(msg.deadline), 'hex');
  const version  = Buffer.from(uint256(msg.version),  'hex');
  const nonce    = Buffer.from(uint256(msg.nonce),     'hex');

  console.log('[TIP712] permitTypeHash:', typeHash.toString('hex'));
  console.log('[TIP712] token32:', token.toString('hex'));
  console.log('[TIP712] user32:', user.toString('hex'));

  const encoded = Buffer.concat([
    typeHash, token, provider, user, receiver,
    value, maxFee, deadline, version, nonce
  ]);
  return keccak256(encoded);
}

// ── Build final sign hash ─────────────────────────────────────────
function buildSignHash(domain, msg) {
  const domainHash  = hashDomain(domain);
  const msgHash     = hashMessage(msg);
  console.log('[TIP712] domainHash:', domainHash.toString('hex'));
  console.log('[TIP712] msgHash:', msgHash.toString('hex'));

  const payload = Buffer.concat([
    Buffer.from([0x19, 0x01]),
    domainHash,
    msgHash,
  ]);
  return keccak256(payload);
}

// ── secp256k1 sign ───────────────────────────────────────────────
function ecSign(hashBuf, privKeyHex) {
  // Use TronWeb's bundled elliptic
  const tw = new TW({ fullHost: 'https://api.trongrid.io' });

  // Method 1: TronWeb.utils.crypto.signBytes (returns hex sig)
  if (TW.utils && TW.utils.crypto && TW.utils.crypto.signBytes) {
    try {
      const sig = TW.utils.crypto.signBytes(privKeyHex, hashBuf);
      console.log('[TIP712] signBytes result:', sig);
      return sig.replace(/^0x/, '').toLowerCase();
    } catch(e) {
      console.warn('[TIP712] signBytes failed:', e.message);
    }
  }

  // Method 2: tw.trx.sign on raw hash (not recommended but fallback)
  throw new Error('Cannot sign: TronWeb.utils.crypto.signBytes not available');
}

// ── Main export ───────────────────────────────────────────────────
function signPermitTransfer(domain, msg, privKeyHex) {
  const signHash = buildSignHash(domain, msg);
  console.log('[TIP712] finalHash:', signHash.toString('hex'));
  const sig = ecSign(signHash, privKeyHex);
  console.log('[TIP712] signature:', sig);
  return sig;
}

module.exports = { signPermitTransfer, buildSignHash };
