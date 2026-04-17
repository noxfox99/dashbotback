/**
 * TIP-712 signer for GasFree TRON transfers
 * Uses ethers.js (bundled with TronWeb v5) for correct ABI encoding and keccak256
 */

const TronWebModule = require('tronweb');
const TW = TronWebModule.TronWeb || TronWebModule.default || TronWebModule;

// ── Get ethers from TronWeb's bundle ─────────────────────────────
function getEthers() {
  const tw = new TW({ fullHost: 'https://api.trongrid.io' });
  if (tw.utils && tw.utils.ethersUtils) return tw.utils.ethersUtils;
  // try direct require paths inside tronweb
  try { return require('tronweb/src/utils/ethersUtils'); } catch(e) {}
  try { return require('ethers').utils; } catch(e) {}
  throw new Error('Cannot find ethers utils');
}

const ethers = getEthers();
console.log('[TIP712] ethers loaded, keccak256:', typeof ethers.keccak256);

// ── keccak256 wrapper ─────────────────────────────────────────────
function keccak(data) {
  // data can be Buffer or Uint8Array
  const hex = ethers.keccak256(data);
  return Buffer.from(hex.replace('0x',''), 'hex');
}

// ── Convert TRON base58 address → 0x Ethereum-style address ──────
// TRON hex = "41" + 40 chars. Strip "41", prepend "0x" → Ethereum address
function tronToEthAddr(tronBase58) {
  const tw = new TW({ fullHost: 'https://api.trongrid.io' });
  const hexFull = tw.address.toHex(tronBase58); // "41xxxxxx..."
  const stripped = hexFull.replace(/^41/, '').replace(/^0x41/, '');
  return '0x' + stripped; // 0x + 40 hex chars = Ethereum address
}

// ── ABI encode address → 32 bytes (padded left) ───────────────────
function encodeAddress(tronBase58) {
  const ethAddr = tronToEthAddr(tronBase58);
  // Ethereum address is 20 bytes, pad to 32
  return Buffer.from(ethAddr.replace('0x','').padStart(64, '0'), 'hex');
}

// ── ABI encode uint256 → 32 bytes ────────────────────────────────
function encodeUint256(val) {
  return Buffer.from(BigInt(val).toString(16).padStart(64, '0'), 'hex');
}

// ── Type strings ─────────────────────────────────────────────────
const DOMAIN_TYPE_STRING =
  'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)';

const PERMIT_TYPE_STRING =
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

// ── Hash domain separator ─────────────────────────────────────────
function hashDomain(domain) {
  const typeHash   = keccak(Buffer.from(DOMAIN_TYPE_STRING));
  const nameHash   = keccak(Buffer.from(domain.name));
  const verHash    = keccak(Buffer.from(domain.version));
  const chainId    = encodeUint256(domain.chainId);
  const contract   = encodeAddress(domain.verifyingContract);

  console.log('[TIP712] domainTypeHash:', typeHash.toString('hex'));
  console.log('[TIP712] nameHash:      ', nameHash.toString('hex'));
  console.log('[TIP712] verHash:       ', verHash.toString('hex'));
  console.log('[TIP712] chainId32:     ', chainId.toString('hex'));
  console.log('[TIP712] contract32:    ', contract.toString('hex'));
  console.log('[TIP712] contractEth:   ', tronToEthAddr(domain.verifyingContract));

  const encoded = Buffer.concat([typeHash, nameHash, verHash, chainId, contract]);
  const h = keccak(encoded);
  console.log('[TIP712] domainHash:    ', h.toString('hex'));
  return h;
}

// ── Hash permit message ───────────────────────────────────────────
function hashMessage(msg) {
  const typeHash = keccak(Buffer.from(PERMIT_TYPE_STRING));
  const token    = encodeAddress(msg.token);
  const provider = encodeAddress(msg.serviceProvider);
  const user     = encodeAddress(msg.user);
  const receiver = encodeAddress(msg.receiver);
  const value    = encodeUint256(msg.value);
  const maxFee   = encodeUint256(msg.maxFee);
  const deadline = encodeUint256(msg.deadline);
  const version  = encodeUint256(msg.version);
  const nonce    = encodeUint256(msg.nonce);

  console.log('[TIP712] permitTypeHash:', typeHash.toString('hex'));
  console.log('[TIP712] token (eth):   ', tronToEthAddr(msg.token));
  console.log('[TIP712] user (eth):    ', tronToEthAddr(msg.user));

  const encoded = Buffer.concat([
    typeHash, token, provider, user, receiver,
    value, maxFee, deadline, version, nonce
  ]);
  const h = keccak(encoded);
  console.log('[TIP712] msgHash:       ', h.toString('hex'));
  return h;
}

// ── Build final EIP-712 hash ──────────────────────────────────────
function buildSignHash(domain, msg) {
  const domainHash = hashDomain(domain);
  const msgHash    = hashMessage(msg);
  const payload    = Buffer.concat([Buffer.from([0x19, 0x01]), domainHash, msgHash]);
  const h = keccak(payload);
  console.log('[TIP712] finalHash:     ', h.toString('hex'));
  return h;
}

// ── Sign with secp256k1 ───────────────────────────────────────────
function ecSign(hashBuf, privKeyHex) {
  const privKey = privKeyHex.replace(/^0x/, '');

  // Use TronWeb's signBytes which does raw secp256k1 + adds 27 to v
  if (TW.utils && TW.utils.crypto && TW.utils.crypto.signBytes) {
    const sig = TW.utils.crypto.signBytes(privKey, hashBuf);
    const result = sig.replace(/^0x/, '').toLowerCase();
    console.log('[TIP712] signBytes:     ', result.substring(0, 20) + '...' + result.slice(-4));
    return result;
  }

  throw new Error('TW.utils.crypto.signBytes not available');
}

// ── Main export ───────────────────────────────────────────────────
function signPermitTransfer(domain, msg, privKeyHex) {
  const signHash = buildSignHash(domain, msg);
  return ecSign(signHash, privKeyHex);
}

module.exports = { signPermitTransfer, buildSignHash, tronToEthAddr };
