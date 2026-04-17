/**
 * TIP-712 signer for GasFree TRON transfers
 * 
 * Key difference from EIP-712:
 * TRON addresses are base58check encoded with 0x41 prefix.
 * When encoding for TIP-712, strip the 0x41 prefix and treat as uint160 (20 bytes).
 */

const crypto = require('crypto');
const TronWeb = require('tronweb');

// handle both export styles
const TW = TronWeb.TronWeb || TronWeb.default || TronWeb;

function keccak256(data) {
  // Node.js built-in keccak256
  return crypto.createHash('sha3-256').update(data).digest();
  // Note: sha3-256 != keccak256! Need the actual keccak256
}

// We need actual keccak256, not sha3-256
// Use TronWeb's internal ethers or js-sha3
let keccak;
try {
  // TronWeb v5 ships ethers internally
  const tw = new TW({ fullHost: 'https://api.trongrid.io' });
  // try to get keccak from utils
  if (tw.utils && tw.utils.ethersUtils && tw.utils.ethersUtils.keccak256) {
    const ethKeccak = tw.utils.ethersUtils.keccak256;
    keccak = (buf) => {
      const hex = ethKeccak(buf);
      return Buffer.from(hex.replace('0x',''), 'hex');
    };
    console.log('[TIP712] Using TronWeb ethersUtils.keccak256');
  } else if (tw.utils && tw.utils.crypto && tw.utils.crypto.keccak256) {
    keccak = (buf) => Buffer.from(tw.utils.crypto.keccak256(buf), 'hex');
    console.log('[TIP712] Using TronWeb utils.crypto.keccak256');
  }
} catch(e) {
  console.warn('[TIP712] Could not get keccak from TronWeb:', e.message);
}

// Fallback: use js-sha3 if available, otherwise require ethereum-cryptography
if (!keccak) {
  try {
    const { keccak256: k } = require('ethereum-cryptography/keccak');
    keccak = (buf) => Buffer.from(k(buf));
    console.log('[TIP712] Using ethereum-cryptography keccak256');
  } catch(e) {
    try {
      const sha3 = require('js-sha3');
      keccak = (buf) => Buffer.from(sha3.keccak256.arrayBuffer(buf));
      console.log('[TIP712] Using js-sha3 keccak256');
    } catch(e2) {
      throw new Error('No keccak256 implementation available. Run: npm install ethereum-cryptography');
    }
  }
}

// Convert TRON base58check address to 32-byte padded uint160 for ABI encoding
function tronAddressToUint160Padded(addr) {
  // base58check decode gives us 21 bytes: [0x41, ...20 bytes address]
  const decoded = TW.utils.crypto.decode58Check(addr); // returns hex string or Buffer
  let hex;
  if (typeof decoded === 'string') {
    hex = decoded.replace(/^0x/,'');
  } else {
    hex = Buffer.from(decoded).toString('hex');
  }
  // hex is 21 bytes (42 chars): first byte is 0x41 (network prefix), rest 20 bytes = address
  // strip first byte (0x41)
  const addrHex = hex.slice(2); // remove '41' prefix → 40 hex chars = 20 bytes
  // pad to 32 bytes (64 hex chars)
  return addrHex.padStart(64, '0');
}

// Encode uint256 to 32 bytes
function encodeUint256(val) {
  const n = BigInt(val);
  return n.toString(16).padStart(64, '0');
}

// TYPE_HASH for PermitTransfer
const PERMIT_TYPE_STRING = 
  'PermitTransfer(address token,address serviceProvider,address user,address receiver,' +
  'uint256 value,uint256 maxFee,uint256 deadline,uint256 version,uint256 nonce)';

const DOMAIN_TYPE_STRING =
  'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)';

function encodeTypeHash(typeString) {
  return keccak256(Buffer.from(typeString));
}

function encodeDomain(domain) {
  const typeHash      = encodeTypeHash(DOMAIN_TYPE_STRING);
  const nameHash      = keccak256(Buffer.from(domain.name));
  const versionHash   = keccak256(Buffer.from(domain.version));
  const chainIdHex    = encodeUint256(domain.chainId);
  const contractHex   = tronAddressToUint160Padded(domain.verifyingContract);

  const encoded = Buffer.concat([
    typeHash,
    nameHash,
    versionHash,
    Buffer.from(chainIdHex, 'hex'),
    Buffer.from(contractHex, 'hex'),
  ]);
  return keccak256(encoded);
}

function encodeMessage(msg) {
  const typeHash = encodeTypeHash(PERMIT_TYPE_STRING);

  const encoded = Buffer.concat([
    typeHash,
    Buffer.from(tronAddressToUint160Padded(msg.token),           'hex'),
    Buffer.from(tronAddressToUint160Padded(msg.serviceProvider),  'hex'),
    Buffer.from(tronAddressToUint160Padded(msg.user),             'hex'),
    Buffer.from(tronAddressToUint160Padded(msg.receiver),         'hex'),
    Buffer.from(encodeUint256(msg.value),    'hex'),
    Buffer.from(encodeUint256(msg.maxFee),   'hex'),
    Buffer.from(encodeUint256(msg.deadline), 'hex'),
    Buffer.from(encodeUint256(msg.version),  'hex'),
    Buffer.from(encodeUint256(msg.nonce),    'hex'),
  ]);
  return keccak256(encoded);
}

function buildSignHash(domain, msg) {
  const domainSeparator = encodeDomain(domain);
  const messageHash     = encodeMessage(msg);
  const payload = Buffer.concat([
    Buffer.from([0x19, 0x01]),
    domainSeparator,
    messageHash,
  ]);
  return keccak256(payload);
}

function signHash(hash, privateKeyHex) {
  // Use TronWeb's secp256k1 signing
  const tw = new TW({ fullHost: 'https://api.trongrid.io' });
  tw.setPrivateKey(privateKeyHex);
  // TronWeb sign: adds 27 to v for Ethereum compatibility
  const sig = TW.utils.crypto.signBytes(privateKeyHex, hash);
  // sig is hex string
  return sig.replace(/^0x/, '');
}

function signPermitTransfer(domain, msg, privateKeyHex) {
  const hash = buildSignHash(domain, msg);
  console.log('[TIP712] signHash:', hash.toString('hex'));
  const sig = signHash(hash, privateKeyHex);
  console.log('[TIP712] sig:', sig);
  return sig;
}

module.exports = { signPermitTransfer, buildSignHash };
