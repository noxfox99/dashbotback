<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TRON GasFree — Панель управления</title>
<script>
// ── Buffer polyfill — extends Uint8Array ─────────────────────────
(function() {
  if (typeof window.Buffer !== 'undefined'
      && typeof window.Buffer.from === 'function'
      && window.Buffer.prototype instanceof Uint8Array) return;

  class Buffer extends Uint8Array {
    // NOTE: NEVER assign to this.length — Uint8Array.length is read-only getter
    constructor(arg, encodingOrOffset, length) {
      if (typeof arg === 'number') {
        super(arg);
      } else if (typeof arg === 'string') {
        const enc = (encodingOrOffset || 'utf8').toLowerCase();
        if (enc === 'hex') {
          const bytes = [];
          for (let i = 0; i + 1 < arg.length; i += 2)
            bytes.push(parseInt(arg.substr(i, 2), 16));
          super(new Uint8Array(bytes));
        } else if (enc === 'base64') {
          const bin = atob(arg.replace(/-/g,'+').replace(/_/g,'/'));
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          super(bytes);
        } else {
          super(new TextEncoder().encode(arg));
        }
      } else if (arg instanceof ArrayBuffer) {
        if (length !== undefined) {
          super(arg, encodingOrOffset || 0, length);
        } else if (encodingOrOffset !== undefined) {
          super(arg, encodingOrOffset);
        } else {
          super(arg);
        }
      } else if (ArrayBuffer.isView(arg)) {
        super(new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength));
      } else if (Array.isArray(arg)) {
        super(new Uint8Array(arg));
      } else if (arg && typeof arg === 'object' && arg.type === 'Buffer' && Array.isArray(arg.data)) {
        super(new Uint8Array(arg.data));
      } else {
        super(0);
      }
      // DO NOT set this.length — Uint8Array length is a read-only getter
    }

    toString(enc) {
      enc = (enc || 'utf8').toLowerCase();
      if (enc === 'hex')
        return Array.from(this).map(b => b.toString(16).padStart(2,'0')).join('');
      if (enc === 'base64') {
        let s = '';
        this.forEach(b => s += String.fromCharCode(b));
        return btoa(s);
      }
      return new TextDecoder('utf-8').decode(this);
    }

    slice(start, end) {
      return Buffer.from(Uint8Array.prototype.slice.call(this, start, end));
    }

    subarray(start, end) {
      const arr = Uint8Array.prototype.subarray.call(this, start, end);
      return Buffer.from(arr);
    }

    copy(target, targetStart, sourceStart, sourceEnd) {
      targetStart = targetStart || 0;
      sourceStart = sourceStart || 0;
      sourceEnd   = sourceEnd !== undefined ? sourceEnd : this.byteLength;
      const src   = Uint8Array.prototype.subarray.call(this, sourceStart, sourceEnd);
      if (ArrayBuffer.isView(target) || target instanceof ArrayBuffer) {
        new Uint8Array(target.buffer || target).set(src, targetStart);
      } else {
        for (let i = 0; i < src.length; i++) target[targetStart + i] = src[i];
      }
      return src.length;
    }

    readUInt8(offset)       { return this[offset >>> 0]; }
    writeUInt8(val, offset) { this[offset >>> 0] = val & 0xff; return (offset >>> 0) + 1; }

    readUInt32BE(offset) {
      offset = offset >>> 0;
      return (((this[offset] * 0x1000000) + ((this[offset+1] << 16) | (this[offset+2] << 8) | this[offset+3])) >>> 0);
    }
    writeUInt32BE(val, offset) {
      offset = offset >>> 0; val = +val;
      this[offset]   = (val >>> 24);
      this[offset+1] = (val >>> 16) & 0xff;
      this[offset+2] = (val >>>  8) & 0xff;
      this[offset+3] =  val         & 0xff;
      return offset + 4;
    }
    readUInt32LE(offset) {
      offset = offset >>> 0;
      return (((this[offset]) | (this[offset+1] << 8) | (this[offset+2] << 16)) + this[offset+3] * 0x1000000) >>> 0;
    }
    writeUInt32LE(val, offset) {
      offset = offset >>> 0; val = +val;
      this[offset]   =  val         & 0xff;
      this[offset+1] = (val >>>  8) & 0xff;
      this[offset+2] = (val >>> 16) & 0xff;
      this[offset+3] = (val >>> 24) & 0xff;
      return offset + 4;
    }
    readInt32BE(offset) {
      const v = this.readUInt32BE(offset);
      return v >= 0x80000000 ? v - 0x100000000 : v;
    }
    fill(val, start, end) {
      Uint8Array.prototype.fill.call(this,
        typeof val === 'string' ? val.charCodeAt(0) : (val | 0),
        start, end);
      return this;
    }
    equals(other) {
      if (this.byteLength !== other.byteLength) return false;
      for (let i = 0; i < this.byteLength; i++) if (this[i] !== other[i]) return false;
      return true;
    }
    includes(val) { return this.indexOf(val) !== -1; }
    toJSON() { return { type: 'Buffer', data: Array.from(this) }; }
  }

  Buffer.from = function(arg, enc) {
    if (arg instanceof Uint8Array) {
      // copy the underlying bytes into a fresh Buffer
      return new Buffer(arg.buffer.slice(arg.byteOffset, arg.byteOffset + arg.byteLength));
    }
    if (arg instanceof ArrayBuffer) return new Buffer(arg);
    if (Array.isArray(arg))         return new Buffer(arg);
    if (typeof arg === 'string')    return new Buffer(arg, enc || 'utf8');
    if (arg && typeof arg === 'object' && arg.type === 'Buffer') return new Buffer(arg.data);
    throw new TypeError('Buffer.from: unsupported type — ' + typeof arg);
  };

  Buffer.alloc = function(size, fill, enc) {
    const b = new Buffer(size);
    if (fill !== undefined) {
      const fillVal = typeof fill === 'string'
        ? Buffer.from(fill, enc || 'utf8')[0]
        : (fill | 0);
      Uint8Array.prototype.fill.call(b, fillVal);
    }
    return b;
  };

  Buffer.allocUnsafe     = size => new Buffer(size);
  Buffer.allocUnsafeSlow = size => new Buffer(size);
  Buffer.isBuffer        = obj  => obj instanceof Buffer;
  Buffer.isEncoding      = enc  => ['utf8','utf-8','hex','base64','ascii','binary','latin1',
                                    'ucs2','ucs-2','utf16le','utf-16le'].includes((enc||'').toLowerCase());
  Buffer.byteLength      = (str, enc) => Buffer.from(str, enc || 'utf8').byteLength;
  Buffer.compare         = (a, b) => {
    for (let i = 0; i < Math.min(a.byteLength, b.byteLength); i++) {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return  1;
    }
    return a.byteLength - b.byteLength;
  };
  Buffer.concat = function(list, totalLength) {
    const total = totalLength !== undefined
      ? totalLength
      : list.reduce((s, b) => s + b.byteLength, 0);
    const result = new Buffer(total);
    let offset = 0;
    for (const b of list) {
      Uint8Array.prototype.set.call(result, b, offset);
      offset += b.byteLength;
    }
    return result;
  };

  window.Buffer     = Buffer;
  globalThis.Buffer = Buffer;
  if (typeof window.global === 'undefined') window.global = window;

  console.log('[Buffer polyfill] OK — instanceof Uint8Array:', new Buffer(0) instanceof Uint8Array);
})();
</script>
<script src="https://cdn.jsdelivr.net/npm/tronweb@5.3.2/dist/TronWeb.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { height:100%; }
body { background:#07090d; color:#dde8f5; font-family:'Syne',sans-serif; overflow:hidden; height:100vh; }
body::before { content:''; position:fixed; inset:0; background-image:linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px); background-size:44px 44px; pointer-events:none; z-index:0; }
body::after { content:''; position:fixed; top:-300px; right:-300px; width:700px; height:700px; background:radial-gradient(circle,rgba(0,229,255,0.055) 0%,transparent 65%); pointer-events:none; z-index:0; }
.layout { position:relative; z-index:1; display:grid; grid-template-columns:200px 1fr; grid-template-rows:54px 1fr; height:100vh; overflow:hidden; }
.topbar { grid-column:1/-1; display:flex; align-items:center; padding:0 20px; gap:14px; background:rgba(7,9,13,0.97); border-bottom:1px solid #1a2535; backdrop-filter:blur(16px); z-index:10; }
.logo { display:flex; align-items:center; gap:9px; font-weight:800; font-size:17px; letter-spacing:-0.3px; color:#00e5ff; text-shadow:0 0 24px rgba(0,229,255,0.22); }
.logo-hex { width:26px; height:26px; background:#00e5ff; clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); animation:pulse-hex 3s ease-in-out infinite; flex-shrink:0; }
@keyframes pulse-hex { 0%,100%{box-shadow:0 0 8px rgba(0,229,255,.5)} 50%{box-shadow:0 0 22px rgba(0,229,255,.9)} }
.topbar-sep { width:1px; height:22px; background:#22304a; margin:0 4px; }
.topbar-nav-btn { padding:5px 13px; border-radius:5px; font-size:12px; font-weight:700; color:#6e8fad; cursor:pointer; border:1px solid transparent; transition:all .2s; white-space:nowrap; }
.topbar-nav-btn:hover { color:#dde8f5; }
.topbar-nav-btn.active { color:#00e5ff; background:rgba(0,229,255,0.07); border-color:rgba(0,229,255,.18); }
.topbar-right { margin-left:auto; display:flex; align-items:center; gap:10px; }
.net-pill { display:flex; align-items:center; gap:6px; font-family:'Space Mono',monospace; font-size:10px; color:#6e8fad; background:#0c1018; border:1px solid #1a2535; border-radius:4px; padding:5px 11px; }
.net-dot { width:5px; height:5px; border-radius:50%; background:#00e676; animation:blink 2s infinite; }
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
.refresh-btn-top { display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:5px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid rgba(0,229,255,.3); background:rgba(0,229,255,0.07); color:#00e5ff; transition:all .2s; font-family:'Syne',sans-serif; }
.refresh-btn-top:hover { background:rgba(0,229,255,.14); border-color:#00e5ff; box-shadow:0 0 24px rgba(0,229,255,0.22); }
.refresh-btn-top.spinning .ri { animation:spin .6s linear infinite; display:inline-block; }
@keyframes spin{to{transform:rotate(360deg)}}
.sidebar { background:#0c1018; border-right:1px solid #1a2535; padding:16px 0; overflow-y:auto; display:flex; flex-direction:column; gap:1px; }
.sidebar::-webkit-scrollbar{width:3px} .sidebar::-webkit-scrollbar-thumb{background:#22304a;border-radius:2px}
.sidebar-section { padding:10px 16px 5px; font-size:9px; font-weight:700; letter-spacing:2px; color:#334d66; text-transform:uppercase; }
.nav-item { display:flex; align-items:center; gap:9px; padding:9px 16px; font-size:12px; font-weight:700; color:#6e8fad; cursor:pointer; transition:all .18s; border-left:2px solid transparent; }
.nav-item:hover { color:#dde8f5; background:rgba(255,255,255,.03); }
.nav-item.active { color:#00e5ff; background:rgba(0,229,255,0.07); border-left-color:#00e5ff; }
.nav-icon { font-size:13px; width:16px; text-align:center; flex-shrink:0; }
.sidebar-spacer { flex:1; }
.sidebar-ver { padding:10px 16px; font-family:'Space Mono',monospace; font-size:9px; color:#334d66; }
.main { overflow-y:auto; background:#07090d; }
.main::-webkit-scrollbar{width:4px} .main::-webkit-scrollbar-thumb{background:#22304a;border-radius:2px}
.page { display:none; padding:24px; flex-direction:column; gap:20px; min-height:100%; }
.page.active { display:flex; }
.page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.page-title { font-size:20px; font-weight:800; letter-spacing:-.4px; }
.page-sub { font-size:12px; color:#6e8fad; margin-top:3px; }
.page-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.proj-tabs-wrap { background:#0c1018; border:1px solid #1a2535; border-radius:8px; overflow:hidden; }
.proj-tabs-bar { display:flex; border-bottom:1px solid #1a2535; background:#101620; overflow-x:auto; }
.proj-tabs-bar::-webkit-scrollbar{height:2px} .proj-tabs-bar::-webkit-scrollbar-thumb{background:#22304a}
.proj-tab { padding:12px 22px; font-size:12px; font-weight:700; color:#6e8fad; cursor:pointer; white-space:nowrap; border-right:1px solid #1a2535; transition:all .18s; position:relative; letter-spacing:.5px; }
.proj-tab:hover { color:#dde8f5; background:rgba(255,255,255,.03); }
.proj-tab.active { color:#00e5ff; background:#0c1018; }
.proj-tab.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:#00e5ff; box-shadow:0 0 8px rgba(0,229,255,.6); }
.proj-tab-count { display:inline-flex; align-items:center; justify-content:center; min-width:16px; height:16px; border-radius:8px; font-size:9px; background:rgba(0,229,255,.15); color:#00b8cc; margin-left:7px; padding:0 4px; }
.proj-panel { display:none; }
.proj-panel.active { display:block; }
.card { background:#0c1018; border:1px solid #1a2535; border-radius:8px; padding:20px; position:relative; overflow:hidden; }
.card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(0,229,255,.25),transparent); }
.card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; gap:8px; }
.card-title { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#334d66; }
.inner-tabs { display:flex; gap:2px; }
.inner-tab { padding:5px 14px; font-size:11px; font-weight:700; border-radius:4px; cursor:pointer; color:#6e8fad; transition:all .15s; border:1px solid transparent; }
.inner-tab:hover { color:#dde8f5; }
.inner-tab.active { color:#00e5ff; background:rgba(0,229,255,0.07); border-color:rgba(0,229,255,.18); }
.inner-panel { display:none; }
.inner-panel.active { display:block; }
.wallet-list { display:flex; flex-direction:column; gap:10px; margin-top:4px; }
.wallet-item { background:#101620; border:1px solid #1a2535; border-radius:8px; padding:14px 16px; display:grid; grid-template-columns:1fr auto; gap:8px; align-items:start; transition:border-color .2s; }
.wallet-item:hover { border-color:#22304a; }
.wallet-item.archived { opacity:.6; filter:saturate(0.5); }
.wallet-addr { font-family:'Space Mono',monospace; font-size:11px; color:#00e5ff; word-break:break-all; line-height:1.5; cursor:pointer; }
.wallet-addr:hover { color:#33eaff; text-decoration:underline; }
.wallet-meta { display:flex; align-items:center; gap:8px; margin-top:5px; flex-wrap:wrap; }
.wallet-tag { font-size:9px; font-weight:700; letter-spacing:1px; color:#334d66; text-transform:uppercase; }
.wallet-balance { font-family:'Space Mono',monospace; font-size:15px; font-weight:700; color:#00e676; text-align:right; white-space:nowrap; }
.wallet-balance.zero { color:#6e8fad; }
.wallet-balance.loading { color:#334d66; }
.wallet-balance-usd { font-size:10px; color:#334d66; text-align:right; margin-top:2px; font-family:'Space Mono',monospace; }
.wallet-actions { display:flex; gap:6px; margin-top:10px; flex-wrap:wrap; justify-content:flex-end; }
.tx-table { width:100%; border-collapse:collapse; }
.tx-table th { text-align:left; font-size:9px; font-weight:700; letter-spacing:1.5px; color:#334d66; text-transform:uppercase; padding:8px 10px; border-bottom:1px solid #1a2535; }
.tx-table td { padding:10px 10px; font-size:11px; border-bottom:1px solid rgba(26,37,53,.5); vertical-align:middle; }
.tx-table tr:last-child td { border-bottom:none; }
.tx-table tr:hover td { background:rgba(255,255,255,.015); }
.tx-hash-cell { font-family:'Space Mono',monospace; color:#00b8cc; }
.tx-hash-cell a { color:inherit; text-decoration:none; }
.tx-hash-cell a:hover { color:#00e5ff; text-decoration:underline; }
.tx-amount-out { font-family:'Space Mono',monospace; font-weight:700; color:#ff3b5c; }
.tx-amount-in { font-family:'Space Mono',monospace; font-weight:700; color:#00e676; }
.tx-time-cell { font-family:'Space Mono',monospace; font-size:10px; color:#334d66; white-space:nowrap; }
.stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.stat-box { background:#101620; border:1px solid #1a2535; border-radius:8px; padding:14px 16px; }
.stat-lbl { font-size:9px; font-weight:700; letter-spacing:1.5px; color:#334d66; text-transform:uppercase; margin-bottom:6px; }
.stat-val { font-family:'Space Mono',monospace; font-size:20px; font-weight:700; }
.stat-sub { font-size:10px; color:#6e8fad; margin-top:3px; }
.c-tron{color:#00e5ff} .c-green{color:#00e676} .c-red{color:#ff3b5c} .c-yellow{color:#ffd600}
.btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:9px 18px; border-radius:5px; font-family:'Syne',sans-serif; font-weight:700; font-size:12px; cursor:pointer; border:none; transition:all .18s; white-space:nowrap; letter-spacing:.3px; }
.btn-primary { background:#00e5ff; color:#000; }
.btn-primary:hover { background:#2aebff; box-shadow:0 0 18px rgba(0,229,255,.4); transform:translateY(-1px); }
.btn-primary:active { transform:translateY(0); }
.btn-primary:disabled { background:#162430; color:#334d66; cursor:not-allowed; transform:none; box-shadow:none; }
.btn-outline { background:transparent; color:#00e5ff; border:1px solid rgba(0,229,255,.35); }
.btn-outline:hover { background:rgba(0,229,255,0.07); border-color:#00e5ff; }
.btn-ghost { background:transparent; color:#6e8fad; border:1px solid #1a2535; }
.btn-ghost:hover { color:#dde8f5; border-color:#22304a; }
.btn-danger { background:rgba(255,59,92,.1); color:#ff3b5c; border:1px solid rgba(255,59,92,.25); }
.btn-danger:hover { background:rgba(255,59,92,.18); border-color:#ff3b5c; }
.btn-sm { padding:5px 11px; font-size:11px; }
.btn-xs { padding:3px 8px; font-size:10px; }
.form-group { display:flex; flex-direction:column; gap:5px; }
.form-label { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#6e8fad; }
.form-input { background:#0c1018; border:1px solid #1a2535; border-radius:5px; padding:9px 12px; font-family:'Space Mono',monospace; font-size:12px; color:#dde8f5; width:100%; outline:none; transition:border-color .18s; }
.form-input:focus { border-color:rgba(0,229,255,.4); box-shadow:0 0 0 3px rgba(0,229,255,.06); }
.form-input::placeholder { color:#334d66; }
.form-hint { font-size:10px; color:#334d66; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:100px; font-size:9px; font-weight:700; letter-spacing:.5px; }
.badge-green { background:rgba(0,230,118,.1); color:#00e676; border:1px solid rgba(0,230,118,.2); }
.badge-blue { background:rgba(0,229,255,.1); color:#00e5ff; border:1px solid rgba(0,229,255,.2); }
.badge-yellow { background:rgba(255,214,0,.1); color:#ffd600; border:1px solid rgba(255,214,0,.2); }
.badge-red { background:rgba(255,59,92,.1); color:#ff3b5c; border:1px solid rgba(255,59,92,.2); }
.badge-gray { background:rgba(255,255,255,.05); color:#6e8fad; border:1px solid #1a2535; }
.info-box { background:rgba(0,229,255,.05); border:1px solid rgba(0,229,255,.13); border-radius:6px; padding:10px 13px; display:flex; gap:10px; align-items:flex-start; font-size:11px; color:#00b8cc; line-height:1.5; }
.warn-box { background:rgba(255,214,0,.05); border:1px solid rgba(255,214,0,.2); border-radius:6px; padding:10px 13px; display:flex; gap:10px; align-items:flex-start; font-size:11px; color:#c9a800; line-height:1.5; }
.err-box { background:rgba(255,59,92,.05); border:1px solid rgba(255,59,92,.2); border-radius:6px; padding:10px 13px; display:flex; gap:10px; align-items:flex-start; font-size:11px; color:#ff3b5c; line-height:1.5; word-break:break-word; }
.divider { height:1px; background:#1a2535; }
.key-blurred { filter:blur(5px); transition:filter .25s; user-select:none; }
.key-blurred.show { filter:blur(0); user-select:text; }
.copy-btn { background:none; border:1px solid #22304a; color:#6e8fad; padding:3px 9px; border-radius:4px; font-size:10px; cursor:pointer; font-family:'Space Mono',monospace; white-space:nowrap; transition:all .15s; }
.copy-btn:hover { border-color:#00e5ff; color:#00e5ff; }
.empty-state { text-align:center; padding:36px 20px; color:#334d66; font-size:12px; }
.empty-icon { font-size:28px; margin-bottom:10px; opacity:.4; }
.config-row { display:flex; align-items:center; justify-content:space-between; padding:13px 0; border-bottom:1px solid #1a2535; gap:16px; }
.config-row:last-child { border-bottom:none; }
.config-lbl { font-size:12px; font-weight:600; }
.config-desc { font-size:10px; color:#6e8fad; margin-top:2px; }
.toggle { width:38px; height:20px; background:#1a2535; border-radius:100px; position:relative; cursor:pointer; transition:background .2s; flex-shrink:0; }
.toggle.on { background:#00e5ff; }
.toggle::after { content:''; position:absolute; width:14px; height:14px; border-radius:50%; background:#fff; top:3px; left:3px; transition:transform .2s; }
.toggle.on::after { transform:translateX(18px); }
.modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200; align-items:center; justify-content:center; backdrop-filter:blur(5px); }
.modal-overlay.open { display:flex; }
.modal { background:#0c1018; border:1px solid #1a2535; border-radius:10px; padding:24px; width:500px; max-width:95vw; position:relative; animation:modal-in .22s ease; max-height:90vh; overflow-y:auto; }
@keyframes modal-in { from{opacity:0;transform:scale(.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
.modal-close { position:absolute; top:14px; right:14px; background:none; border:none; color:#6e8fad; font-size:18px; cursor:pointer; padding:3px 7px; border-radius:3px; transition:color .15s; }
.modal-close:hover { color:#dde8f5; }
.modal-title { font-size:15px; font-weight:800; margin-bottom:18px; }
.toast { position:fixed; bottom:20px; right:20px; background:#101620; border:1px solid #1a2535; border-radius:7px; padding:12px 16px; font-size:12px; font-weight:700; z-index:500; display:flex; align-items:center; gap:9px; transform:translateY(70px); opacity:0; transition:all .28s cubic-bezier(.34,1.56,.64,1); min-width:220px; box-shadow:0 6px 24px rgba(0,0,0,.5); }
.toast.show { transform:translateY(0); opacity:1; }
.toast.success { border-color:rgba(0,230,118,.35); }
.toast.error { border-color:rgba(255,59,92,.35); }
.spin-el { display:inline-block; width:12px; height:12px; border:2px solid rgba(0,0,0,.25); border-top-color:#000; border-radius:50%; animation:spin .55s linear infinite; vertical-align:middle; }
.spin-el-light { display:inline-block; width:12px; height:12px; border:2px solid rgba(0,229,255,.2); border-top-color:#00e5ff; border-radius:50%; animation:spin .55s linear infinite; vertical-align:middle; }
.table-wrap { overflow-x:auto; }
.table-wrap::-webkit-scrollbar{height:3px} .table-wrap::-webkit-scrollbar-thumb{background:#22304a;border-radius:2px}
@media(max-width:800px){ .layout{grid-template-columns:1fr;grid-template-rows:54px auto 1fr} .sidebar{display:none} .stats-row{grid-template-columns:1fr 1fr} .form-row{grid-template-columns:1fr} }

/* ── AUTH ───────────────────────────────────────────────────── */
.auth-overlay {
  position:fixed; inset:0; z-index:9999;
  background:#07090d;
  display:flex; align-items:center; justify-content:center;
}
.auth-box {
  background:#0c1018; border:1px solid #1a2535; border-radius:12px;
  padding:40px 36px; width:360px; max-width:95vw;
  display:flex; flex-direction:column; gap:20px;
  animation:modal-in .25s ease;
}
.auth-logo {
  display:flex; align-items:center; gap:10px;
  font-weight:800; font-size:20px; color:#00e5ff;
  text-shadow:0 0 24px rgba(0,229,255,0.3);
  justify-content:center; margin-bottom:4px;
}
.auth-logo-hex {
  width:28px; height:28px; background:#00e5ff; flex-shrink:0;
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
}
.auth-title { font-size:13px; color:#6e8fad; text-align:center; margin-top:-8px; }
.auth-error {
  background:rgba(255,59,92,.1); border:1px solid rgba(255,59,92,.25);
  border-radius:6px; padding:10px 13px; font-size:12px; color:#ff3b5c;
  display:none; text-align:center;
}
.auth-error.show { display:block; }
.auth-user-label {
  font-size:10px; font-weight:700; letter-spacing:1.5px;
  color:#334d66; text-transform:uppercase; margin-bottom:4px;
}
</style>
</head>
<body>

<div id="auth-overlay" class="auth-overlay">
  <div class="auth-box">
    <div class="auth-logo"><div class="auth-logo-hex"></div>TRONGF</div>
    <div class="auth-title">Панель управления · Вход</div>
    <div id="auth-error" class="auth-error">Неверный пароль</div>
    <div>
      <div class="auth-user-label">Пользователь</div>
      <select class="form-input" id="auth-user">
        <option value="admin">Super Admin</option>
        <option value="mull">Mull (Tab 1)</option>
        <option value="time">Time (Tab 2)</option>
        <option value="sov">Sov (Tab 3)</option>
        <option value="rail">Rail (Tab 4)</option>
        <option value="temp">Temp (Tab 5)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Пароль</label>
      <input type="password" class="form-input" id="auth-pass" placeholder="Введите пароль…"
             onkeydown="if(event.key==='Enter')doLogin()"/>
    </div>
    <button class="btn btn-primary" onclick="doLogin()">→ Войти</button>
  </div>
</div>

<div class="layout">

<header class="topbar">
  <div class="logo"><div class="logo-hex"></div>TRONGF</div>
  <div class="topbar-sep"></div>
  <div class="topbar-nav-btn active" onclick="setMainPage('wallets',this)">Кошельки</div>
  <div class="topbar-nav-btn" onclick="setMainPage('withdraw',this)">Вывод</div>
  <div class="topbar-nav-btn" onclick="setMainPage('config',this)">Настройки</div>
  <div class="topbar-right">
    <button class="refresh-btn-top" id="global-refresh" onclick="refreshAllBalances()">
      <span class="ri" style="font-size:13px">↻</span> Refresh
    </button>
    <div class="net-pill"><div class="net-dot"></div><span id="net-label">TRON Mainnet</span></div>
  </div>
</header>

<nav class="sidebar">
  <div class="sidebar-section">Навигация</div>
  <div class="nav-item active" onclick="sideNav(this,'wallets')"><span class="nav-icon">◈</span> Панель</div>
  <div class="nav-item" onclick="sideNav(this,'wallets')"><span class="nav-icon">⬡</span> Кошельки</div>
  <div class="nav-item" onclick="sideNav(this,'withdraw')"><span class="nav-icon">↑</span> Вывод средств</div>
  <div class="sidebar-section">Система</div>
  <div class="nav-item" onclick="sideNav(this,'config')"><span class="nav-icon">⚙</span> Настройки</div>
  <div class="sidebar-spacer"></div>
  <div class="sidebar-ver">v2.0.0 · GasFree Real</div>
</nav>

<main class="main">

  <!-- WALLETS -->
  <div id="page-wallets" class="page active">
    <div class="page-header">
      <div>
        <div class="page-title">Управление кошельками</div>
        <div class="page-sub">Gas-Free TRON кошельки · USDT TRC-20 без TRX энергии</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" onclick="refreshAllBalances()">↻ Обновить балансы</button>
        <button class="btn btn-primary" onclick="openGenModal(currentProjId)">+ Новый кошелёк</button>
      </div>
    </div>
    <div class="stats-row" id="global-stats">
      <div class="stat-box"><div class="stat-lbl">Всего USDT</div><div class="stat-val c-tron" id="gstat-total">—</div><div class="stat-sub">Суммарный баланс</div></div>
      <div class="stat-box"><div class="stat-lbl">Активных</div><div class="stat-val c-green" id="gstat-active">0</div><div class="stat-sub">Кошельков в работе</div></div>
      <div class="stat-box"><div class="stat-lbl">В архиве</div><div class="stat-val" style="color:#6e8fad" id="gstat-archived">0</div><div class="stat-sub">Деактивировано</div></div>
      <div class="stat-box"><div class="stat-lbl">Транзакций</div><div class="stat-val c-yellow" id="gstat-tx">0</div><div class="stat-sub">За всё время</div></div>
    </div>
    <div class="proj-tabs-wrap">
      <div class="proj-tabs-bar" id="proj-tabs-bar"></div>
      <div style="padding:20px" id="proj-panels-host"></div>
    </div>
  </div>

  <!-- WITHDRAW -->
  <div id="page-withdraw" class="page">
    <div class="page-header">
      <div><div class="page-title">Вывод средств</div><div class="page-sub">Отправка USDT через GasFree · TIP-712 подпись</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card">
        <div class="card-head"><div class="card-title">Отправить USDT (TRC-20 GasFree)</div></div>
        <div style="display:flex;flex-direction:column;gap:13px">
          <div class="form-group">
            <label class="form-label">Кошелёк-отправитель</label>
            <select class="form-input" id="wd-from-select"><option value="">— Выберите кошелёк —</option></select>
          </div>
          <div class="form-group">
            <label class="form-label">Адрес получателя</label>
            <input class="form-input" id="wd-to" placeholder="T..."/>
          </div>
          <div class="form-group">
            <label class="form-label">Сумма (USDT)</label>
            <input type="number" class="form-input" id="wd-amount" placeholder="0.00" step="0.01"/>
            <span class="form-hint" id="wd-avail">Доступно: —</span>
          </div>
          <div class="form-group">
            <label class="form-label">Макс. комиссия (USDT)</label>
            <input type="number" class="form-input" id="wd-maxfee" placeholder="5.00" value="5" step="0.1"/>
            <span class="form-hint">Лимит списания за перевод + активацию</span>
          </div>
          <div class="form-group">
            <label class="form-label">Приватный ключ (для подписи)</label>
            <input type="password" class="form-input" id="wd-key" placeholder="64 hex символа…"/>
            <span class="form-hint">Используется только локально для TIP-712 подписи</span>
          </div>
          <div class="info-box"><span>⚡</span><span>TIP-712 подпись → GasFree relay → ончейн без TRX энергии.</span></div>
          <button class="btn btn-primary" onclick="doGasFreeWithdraw()" id="wd-btn">↑ Отправить через GasFree</button>
          <div id="wd-result-box" style="display:none"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-head"><div class="card-title">Провайдер GasFree</div></div>
          <div style="font-size:11px;display:flex;flex-direction:column;gap:8px" id="provider-info">
            <div style="color:#334d66">Загрузка провайдеров…</div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title">Оценка комиссии</div></div>
          <div style="font-size:12px;display:flex;flex-direction:column;gap:9px">
            <div style="display:flex;justify-content:space-between"><span style="color:#6e8fad">USDT (GasFree)</span><span class="c-green" style="font-weight:700">~0–5 USDT</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:#6e8fad">TRX энергия</span><span class="c-green">НЕ НУЖНА</span></div>
            <div class="divider"></div>
            <div style="display:flex;justify-content:space-between"><span style="color:#6e8fad">Сеть</span><span id="fee-net">Mainnet</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:#6e8fad">Протокол</span><span class="badge badge-green">GasFree v1</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- CONFIG -->
  <div id="page-config" class="page">
    <div class="page-header">
      <div><div class="page-title">Настройки</div><div class="page-sub">API ключи, сеть, параметры GasFree</div></div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">GasFree API</div></div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">GasFree API Key <span class="badge badge-blue" style="vertical-align:middle;margin-left:6px">Обязательно</span></label>
          <div style="display:flex;gap:8px">
            <input type="password" class="form-input" id="cfg-gf-key" placeholder="API Key…" style="flex:1"/>
            <button class="btn btn-ghost btn-sm" onclick="togglePwd('cfg-gf-key',this)">Показать</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">GasFree API Secret <span class="badge badge-red" style="vertical-align:middle;margin-left:6px">Секрет</span></label>
          <div style="display:flex;gap:8px">
            <input type="password" class="form-input" id="cfg-gf-secret" placeholder="API Secret…" style="flex:1"/>
            <button class="btn btn-ghost btn-sm" onclick="togglePwd('cfg-gf-secret',this)">Показать</button>
          </div>
          <span class="form-hint">Используется для HMAC-SHA256 подписи каждого запроса</span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">GasFree Base URL</label>
            <input class="form-input" id="cfg-gf-url" value="https://open.gasfree.io/tron"/>
          </div>
          <div class="form-group">
            <label class="form-label">Service Provider адрес</label>
            <input class="form-input" id="cfg-provider" placeholder="TKtWb…" style="font-size:11px"/>
            <span class="form-hint">Адрес вашего провайдера из /api/v1/config/provider/all</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Макс. комиссия по умолчанию (USDT)</label>
          <input type="number" class="form-input" id="cfg-maxfee" value="5" style="width:120px"/>
        </div>
        <button class="btn btn-outline btn-sm" style="width:fit-content" onclick="loadProviders()">↻ Загрузить провайдеров</button>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">TronGrid API</div></div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">TronGrid API Key</label>
          <div style="display:flex;gap:8px">
            <input type="password" class="form-input" id="cfg-tg-key" placeholder="uuid…" style="flex:1"/>
            <button class="btn btn-ghost btn-sm" onclick="togglePwd('cfg-tg-key',this)">Показать</button>
          </div>
          <span class="form-hint">www.trongrid.io — для баланса, TX истории</span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">TronGrid RPC URL</label>
            <input class="form-input" id="cfg-rpc" value="https://api.trongrid.io"/>
          </div>
          <div class="form-group">
            <label class="form-label">USDT Контракт</label>
            <input class="form-input" id="cfg-usdt" value="TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" style="font-size:10px"/>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Сеть</div></div>
      <div class="config-row">
        <div><div class="config-lbl">Сеть TRON</div><div class="config-desc">Mainnet или Nile testnet</div></div>
        <select class="form-input" style="width:180px" id="cfg-net" onchange="onNetChange()">
          <option value="mainnet">Mainnet</option>
          <option value="nile">Nile Testnet</option>
        </select>
      </div>
      <div class="config-row">
        <div><div class="config-lbl">Авто-регистрация GasFree</div><div class="config-desc">Запрашивать инфо GasFree после генерации</div></div>
        <div class="toggle on" id="toggle-autoenroll" onclick="this.classList.toggle('on')"></div>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="saveConfig()">✓ Сохранить</button>
      <button class="btn btn-outline" onclick="loadConfigFromStorage();toast('Загружено из хранилища','success')">↻ Загрузить</button>
      <button class="btn btn-ghost btn-sm" onclick="testGasFreeConnection()">⚡ Тест GasFree</button>
      <button class="btn btn-ghost btn-sm" onclick="testTronGrid()">⬡ Тест TronGrid</button>
      <button class="btn btn-ghost btn-sm" onclick="testTronWeb()">🔑 Тест TronWeb</button>
      <button class="btn btn-danger btn-sm" style="margin-left:auto" onclick="clearAllConfig()">⚠ Очистить</button>
    </div>
  </div>

</main>
</div>

<!-- GENERATE MODAL -->
<div class="modal-overlay" id="gen-modal">
  <div class="modal">
    <button class="modal-close" onclick="closeModal('gen-modal')">✕</button>
    <div class="modal-title" id="gen-modal-title">Новый Gas-Free кошелёк</div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;gap:4px;background:#101620;border-radius:6px;padding:3px;width:fit-content">
        <button class="btn btn-sm" id="gen-tab-new" style="background:#0c1018;color:#00e5ff" onclick="setGenTab('new')">Создать новый</button>
        <button class="btn btn-sm btn-ghost" id="gen-tab-imp" onclick="setGenTab('imp')">Импорт ключа</button>
      </div>
      <div id="gen-new-panel">
        <div class="info-box"><span>ℹ</span><span>secp256k1 ключевая пара + TRON base58check адрес генерируется локально через TronWeb. Приватный ключ нигде не сохраняется.</span></div>
      </div>
      <div id="gen-imp-panel" style="display:none">
        <div class="form-group">
          <label class="form-label">Приватный ключ (64 hex)</label>
          <input class="form-input" id="imp-key-input" placeholder="без 0x…"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Метка (опционально)</label>
        <input class="form-input" id="gen-label" placeholder="Например: депозит клиента #5"/>
      </div>
      <button class="btn btn-primary" id="gen-modal-btn" onclick="executeGen()">◈ Создать кошелёк</button>
      <div id="gen-result" style="display:none;flex-direction:column;gap:12px">
        <div class="divider"></div>
        <div class="form-group">
          <label class="form-label">TRON Адрес (EOA)</label>
          <div style="display:flex;gap:8px;align-items:center">
            <span id="gr-addr" style="font-family:'Space Mono',monospace;font-size:11px;color:#00e5ff;flex:1;word-break:break-all"></span>
            <button class="copy-btn" onclick="copyEl('gr-addr',this)">Копировать</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex;justify-content:space-between;align-items:center">
            Приватный ключ <span class="badge badge-yellow" style="margin-left:8px">⚠ Секрет</span>
            <button class="btn btn-ghost btn-xs" style="margin-left:auto" onclick="if(guardKeys()) document.getElementById('gr-key').classList.toggle('show')">👁 Показать</button>
          </label>
          <span id="gr-key" class="key-blurred" style="font-family:'Space Mono',monospace;font-size:11px;color:#ffd600;word-break:break-all;display:block;padding:10px 12px;background:#101620;border:1px solid #1a2535;border-radius:5px;line-height:1.6"></span>
          <button class="copy-btn" style="margin-top:4px;width:fit-content" onclick="if(guardKeys()) copyText(document.getElementById('gr-key').textContent,this)">Копировать ключ</button>
        </div>
        <div class="warn-box"><span>⚠</span><span>Сохраните приватный ключ офлайн в надёжном месте. Восстановление невозможно.</span></div>
        <div id="gen-gf-info" style="display:none;flex-direction:column;gap:6px">
          <div class="divider"></div>
          <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#334d66;text-transform:uppercase">GasFree статус</div>
          <div id="gen-gf-content" style="font-size:11px;color:#6e8fad"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- WITHDRAW MODAL -->
<div class="modal-overlay" id="wd-modal">
  <div class="modal">
    <button class="modal-close" onclick="closeModal('wd-modal')">✕</button>
    <div class="modal-title">Вывод средств</div>
    <div style="display:flex;flex-direction:column;gap:13px">
      <div style="background:#101620;border:1px solid #1a2535;border-radius:6px;padding:10px 12px">
        <div style="font-size:10px;color:#334d66;margin-bottom:3px">ОТПРАВИТЕЛЬ</div>
        <div id="mwd-from-addr" style="font-family:'Space Mono',monospace;font-size:11px;color:#00e5ff;word-break:break-all"></div>
        <div style="font-size:11px;color:#00e676;margin-top:4px" id="mwd-from-bal"></div>
      </div>
      <div class="form-group"><label class="form-label">Адрес получателя</label><input class="form-input" id="mwd-to" placeholder="T..."/></div>
      <div class="form-group">
        <label class="form-label">Сумма (USDT)</label>
        <input type="number" class="form-input" id="mwd-amount" placeholder="0.00" step="0.01"/>
        <span class="form-hint" id="mwd-avail"></span>
      </div>
      <div class="form-group">
        <label class="form-label">Макс. комиссия (USDT)</label>
        <input type="number" class="form-input" id="mwd-maxfee" value="5" step="0.1"/>
      </div>
      <div class="form-group">
        <label class="form-label">Приватный ключ (64 hex)</label>
        <input type="password" class="form-input" id="mwd-key" placeholder="Для TIP-712 подписи…"/>
      </div>
      <div class="info-box"><span>⚡</span><span>GasFree relay отправит транзакцию — TRX не нужен.</span></div>
      <button class="btn btn-primary" id="mwd-btn" onclick="execModalWithdraw()">↑ Отправить USDT</button>
      <div id="mwd-result" style="display:none"></div>
    </div>
  </div>
</div>

<div class="toast" id="toast"><span id="toast-icon">✓</span><span id="toast-msg"></span></div>

<script>
// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
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
  verifyingContract: 'TF49HXMbDdpKbHoRiFxoXTAZZEcRpGFfYx' // nile testnet
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

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
const PROJECTS = [
  { id:'mull', name:'Mull',  color:'#00e5ff' },
  { id:'time', name:'Time',  color:'#00e676' },
  { id:'sov',  name:'Sov',   color:'#ffd600' },
  { id:'rail', name:'Rail',  color:'#ff9100' },
  { id:'temp', name:'Temp',  color:'#c084fc' },
];

// Wallets stored per project: { active: [], archived: [], txs: [] }
const DB = {};
PROJECTS.forEach(p => { DB[p.id] = { active:[], archived:[], txs:[] }; });

let currentProjId = 'mull';
let genTargetProj  = 'mull';
let genTabMode     = 'new';
let mwdWallet      = null; // { addr, balance, projId }

// ═══════════════════════════════════════════════════════════════
// CONFIG HELPERS
// ═══════════════════════════════════════════════════════════════
function cfg() {
  return {
    gfKey:    (document.getElementById('cfg-gf-key')?.value    || '').trim(),
    gfSecret: (document.getElementById('cfg-gf-secret')?.value || '').trim(),
    gfUrl:    (document.getElementById('cfg-gf-url')?.value    || 'https://open.gasfree.io/tron').trim().replace(/\/$/,''),
    provider: (document.getElementById('cfg-provider')?.value  || '').trim(),
    maxfee:   parseFloat(document.getElementById('cfg-maxfee')?.value || '5'),
    tgKey:    (document.getElementById('cfg-tg-key')?.value    || '').trim(),
    rpc:      (document.getElementById('cfg-rpc')?.value       || 'https://api.trongrid.io').trim(),
    usdt:     (document.getElementById('cfg-usdt')?.value      || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t').trim(),
    net:      (document.getElementById('cfg-net')?.value       || 'mainnet'),
  };
}

function saveConfig() {
  const c = cfg();
  try { localStorage.setItem('tgf2_cfg', JSON.stringify(c)); } catch(e){}
  toast('Настройки сохранены ✓', 'success');
}

function loadConfigFromStorage() {
  try {
    const c = JSON.parse(localStorage.getItem('tgf2_cfg') || '{}');
    if(c.gfKey)    document.getElementById('cfg-gf-key').value    = c.gfKey;
    if(c.gfSecret) document.getElementById('cfg-gf-secret').value = c.gfSecret;
    if(c.gfUrl)    document.getElementById('cfg-gf-url').value    = c.gfUrl;
    if(c.provider) document.getElementById('cfg-provider').value  = c.provider;
    if(c.maxfee)   document.getElementById('cfg-maxfee').value    = c.maxfee;
    if(c.tgKey)    document.getElementById('cfg-tg-key').value    = c.tgKey;
    if(c.rpc)      document.getElementById('cfg-rpc').value       = c.rpc;
    if(c.usdt)     document.getElementById('cfg-usdt').value      = c.usdt;
    if(c.net)      document.getElementById('cfg-net').value       = c.net;
    onNetChange();
  } catch(e){}

  // load wallets
  try {
    const saved = JSON.parse(localStorage.getItem('tgf2_wallets') || '{}');
    PROJECTS.forEach(p => {
      if(saved[p.id]) {
        DB[p.id].active   = saved[p.id].active   || [];
        DB[p.id].archived = saved[p.id].archived || [];
        DB[p.id].txs      = saved[p.id].txs      || [];
      }
    });
  } catch(e){}
}

function saveWallets() {
  const data = {};
  PROJECTS.forEach(p => { data[p.id] = DB[p.id]; });
  try { localStorage.setItem('tgf2_wallets', JSON.stringify(data)); } catch(e){}
}

function clearAllConfig() {
  if(!confirm('Удалить все ключи и кошельки из хранилища?')) return;
  try { localStorage.removeItem('tgf2_cfg'); localStorage.removeItem('tgf2_wallets'); } catch(e){}
  toast('Очищено', 'success');
}

function onNetChange() {
  const n = document.getElementById('cfg-net')?.value || 'mainnet';
  document.getElementById('net-label').textContent = n === 'mainnet' ? 'TRON Mainnet' : 'Nile Testnet';
  document.getElementById('fee-net').textContent    = n === 'mainnet' ? 'Mainnet' : 'Nile Testnet';
  if(n === 'nile') {
    document.getElementById('cfg-gf-url').value = 'https://open-test.gasfree.io/nile';
    document.getElementById('cfg-rpc').value = 'https://nile.trongrid.io';
  } else {
    document.getElementById('cfg-gf-url').value = 'https://open.gasfree.io/tron';
    document.getElementById('cfg-rpc').value = 'https://api.trongrid.io';
  }
}

// ═══════════════════════════════════════════════════════════════
// GASFREE API — all requests go through /proxy/gasfree
// HMAC-SHA256 signing happens server-side to avoid CORS
// ═══════════════════════════════════════════════════════════════
async function gfGet(endpoint) {
  const { gfKey, gfSecret, gfUrl } = cfg();
  if(!gfKey || !gfSecret) throw new Error('Укажите GasFree API Key и Secret в настройках');
  const res = await fetch('/proxy/gasfree', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gfPath:    `/api/v1${endpoint}`,
      method:    'GET',
      apiKey:    gfKey,
      apiSecret: gfSecret,
      baseUrl:   gfUrl
    })
  });
  const data = await res.json();
  if(!res.ok) throw new Error(`GasFree ${res.status}: ${data.error || JSON.stringify(data)}`);
  return data;
}

async function gfPost(endpoint, body) {
  const { gfKey, gfSecret, gfUrl } = cfg();
  if(!gfKey || !gfSecret) throw new Error('Укажите GasFree API Key и Secret в настройках');
  const res = await fetch('/proxy/gasfree', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gfPath:    `/api/v1${endpoint}`,
      method:    'POST',
      body:      body,
      apiKey:    gfKey,
      apiSecret: gfSecret,
      baseUrl:   gfUrl
    })
  });
  const data = await res.json();
  if(!res.ok) throw new Error(`GasFree ${res.status}: ${data.error || JSON.stringify(data)}`);
  return data;
}

// ═══════════════════════════════════════════════════════════════
// TRONGRID — BALANCES
// ═══════════════════════════════════════════════════════════════
async function fetchUSDTBalance(address) {
  const { tgKey, rpc, usdt } = cfg();
  const res = await fetch('/proxy/trongrid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tgPath: `/v1/accounts/${address}`, method: 'GET', apiKey: tgKey, rpc })
  });
  if(!res.ok) throw new Error(`TronGrid proxy ${res.status}`);
  const data = await res.json();
  const acct = data.data?.[0];
  if(!acct) return { usdt: 0, trx: 0 };
  const trx = (acct.balance || 0) / 1e6;
  const usdtRaw = acct.trc20?.find(t => t[usdt])?.[usdt] || '0';
  return { usdt: parseFloat(usdtRaw) / 1e6, trx };
}

async function fetchTxHistory(address) {
  const { tgKey, rpc, usdt } = cfg();
  try {
    const res = await fetch('/proxy/trongrid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tgPath: `/v1/accounts/${address}/transactions/trc20?limit=20&contract_address=${usdt}`,
        method: 'GET', apiKey: tgKey, rpc
      })
    });
    if(!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map(tx => ({
      hash: tx.transaction_id,
      type: tx.from === address ? 'out' : 'in',
      amount: parseFloat(tx.value) / 1e6,
      to: tx.to,
      from: tx.from,
      time: new Date(tx.block_timestamp).toLocaleString('ru-RU'),
      status: 'confirmed'
    }));
  } catch(e) { return []; }
}

// ═══════════════════════════════════════════════════════════════
// TRONWEB — RESOLVE CONSTRUCTOR (handles v5/v6 CDN bundle differences)
// ═══════════════════════════════════════════════════════════════
function resolveTronWebClass() {
  // Try all known export paths
  if (typeof TronWeb === 'function') return TronWeb;
  if (typeof TronWeb === 'object' && TronWeb !== null) {
    if (typeof TronWeb.TronWeb === 'function') return TronWeb.TronWeb;
    if (typeof TronWeb.default === 'function') return TronWeb.default;
  }
  if (window.TronWeb && typeof window.TronWeb === 'function') return window.TronWeb;
  if (window.TronWeb && typeof window.TronWeb.TronWeb === 'function') return window.TronWeb.TronWeb;
  throw new Error('TronWeb не загружен. Проверьте подключение к интернету и перезагрузите страницу.');
}

function getTronWeb(privKey) {
  const TW = resolveTronWebClass();
  const { rpc, tgKey } = cfg();
  const headers = tgKey ? { 'TRON-PRO-API-KEY': tgKey } : {};
  const tw = new TW({ fullHost: rpc, headers });
  if (privKey) tw.setPrivateKey(privKey);
  return tw;
}

function generateRealWallet() {
  const TW = resolveTronWebClass();
  const { rpc, tgKey } = cfg();
  const headers = tgKey ? { 'TRON-PRO-API-KEY': tgKey } : {};
  const tw = new TW({ fullHost: rpc, headers });

  // v5: tw.utils.accounts.generateAccount()
  // v6: TronWeb.createAccount() or tw.createAccount()
  let account;
  if (tw.utils && tw.utils.accounts && typeof tw.utils.accounts.generateAccount === 'function') {
    account = tw.utils.accounts.generateAccount();
    return { privateKey: account.privateKey, address: account.address.base58 };
  }
  if (typeof TW.createAccount === 'function') {
    account = TW.createAccount();
    return { privateKey: account.privateKey, address: account.address.base58 };
  }
  if (typeof tw.createAccount === 'function') {
    account = tw.createAccount();
    return { privateKey: account.privateKey, address: account.address.base58 };
  }
  // Fallback: generate via TronWeb.utils.ethersUtils if available
  if (tw.utils && tw.utils.ethersUtils) {
    const wallet = tw.utils.ethersUtils.Wallet.createRandom();
    const privHex = wallet.privateKey.replace(/^0x/, '');
    const addr = tw.address.fromPrivateKey(privHex);
    return { privateKey: privHex, address: addr };
  }
  throw new Error('Не удалось найти метод генерации кошелька в TronWeb. Версия: ' + (TW.version || '?'));
}

function deriveAddressFromKey(privKey) {
  const tw = getTronWeb();
  // v5/v6 both support this
  const addr = tw.address.fromPrivateKey(privKey);
  if (!addr) throw new Error('Не удалось получить адрес из ключа');
  return addr;
}

// ═══════════════════════════════════════════════════════════════
// TIP-712 SIGNATURE
// ═══════════════════════════════════════════════════════════════
async function signPermitTransfer(privKey, permitMessage) {
  // TIP-712 signing is done SERVER-SIDE via /proxy/sign
  // This avoids Buffer/crypto polyfill issues in browser
  const c = cfg();
  console.log('[Sign] Sending to server for TIP-712 signing...');
  console.log('[Sign] message:', JSON.stringify(permitMessage));

  const res = await fetch('/proxy/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      privKey,
      permitMessage,
      network: c.net,
      rpc:     c.rpc,
      tgKey:   c.tgKey,
    })
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error('Ошибка подписи на сервере: ' + (data.error || res.status));
  }

  console.log('[Sign] signature from server:', data.signature);
  return data.signature;
}

// ═══════════════════════════════════════════════════════════════
// GASFREE ACCOUNT INFO
// ═══════════════════════════════════════════════════════════════
async function getGasFreeAccountInfo(address) {
  return gfGet(`/address/${address}`);
}

// ═══════════════════════════════════════════════════════════════
// LOAD PROVIDERS
// ═══════════════════════════════════════════════════════════════
async function loadProviders() {
  const box = document.getElementById('provider-info');
  box.innerHTML = '<span class="spin-el-light"></span> Загрузка…';
  try {
    const data = await gfGet('/config/provider/all');
    const list = data.data || data || [];
    if(!list.length) { box.innerHTML = '<span style="color:#334d66">Провайдеры не найдены</span>'; return; }
    box.innerHTML = list.map(p => `
      <div style="padding:8px 0;border-bottom:1px solid #1a2535">
        <div style="font-size:11px;font-weight:700;color:#dde8f5">${escHtml(p.name||'—')}</div>
        <div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#00e5ff;margin-top:2px;word-break:break-all">${escHtml(p.providerAddress||p.address||'')}</div>
        <div style="font-size:10px;color:#6e8fad;margin-top:2px">Макс. комиссия: ${p.maxFee ? (p.maxFee/1e6)+' USDT' : '—'}</div>
      </div>
    `).join('');
  } catch(e) {
    box.innerHTML = `<div class="err-box"><span>✕</span><span>${escHtml(e.message)}</span></div>`;
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST CONNECTIONS
// ═══════════════════════════════════════════════════════════════
async function testGasFreeConnection() {
  toast('Проверка GasFree…');
  try {
    const data = await gfGet('/config/token/all');
    toast(`GasFree OK · ${(data.data||data||[]).length} токенов`, 'success');
  } catch(e) { toast('GasFree ошибка: '+e.message, 'error'); }
}

async function testTronGrid() {
  toast('Проверка TronGrid…');
  try {
    const { rpc, tgKey } = cfg();
    const res = await fetch('/proxy/trongrid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tgPath: '/wallet/getnowblock', method: 'GET', apiKey: tgKey, rpc })
    });
    const d = await res.json();
    toast(`TronGrid OK · блок #${d.block_header?.raw_data?.number||'?'}`, 'success');
  } catch(e) { toast('TronGrid ошибка: '+e.message, 'error'); }
}

function testTronWeb() {
  try {
    const TW = resolveTronWebClass();
    // Try to generate a test wallet
    const wallet = generateRealWallet();
    toast(`TronWeb OK · адрес: ${wallet.address.substring(0,12)}…`, 'success');
    console.log('[TronWeb test] Generated address:', wallet.address);
    console.log('[TronWeb test] TronWeb constructor:', TW.name || typeof TW);
  } catch(e) {
    // Show detailed debug info
    const info = [
      'typeof TronWeb = ' + typeof TronWeb,
      typeof TronWeb === 'object' ? 'keys: ' + Object.keys(TronWeb||{}).join(', ') : '',
      'window.TronWeb = ' + typeof window.TronWeb,
    ].filter(Boolean).join(' | ');
    toast('TronWeb ошибка: ' + e.message, 'error');
    console.error('[TronWeb debug]', info, e);
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERATE WALLET FLOW
// ═══════════════════════════════════════════════════════════════
function openGenModal(projId) {
  genTargetProj = projId;
  const proj = PROJECTS.find(p=>p.id===projId);
  document.getElementById('gen-modal-title').textContent = `Новый кошелёк — ${proj.name}`;
  document.getElementById('gen-result').style.display = 'none';
  document.getElementById('gen-gf-info').style.display = 'none';
  document.getElementById('gen-label').value = '';
  document.getElementById('imp-key-input').value = '';
  document.getElementById('gen-modal-btn').textContent = '◈ Создать кошелёк';
  document.getElementById('gen-modal-btn').disabled = false;
  setGenTab('new');
  document.getElementById('gen-modal').classList.add('open');
}

function setGenTab(tab) {
  genTabMode = tab;
  document.getElementById('gen-new-panel').style.display = tab==='new'?'block':'none';
  document.getElementById('gen-imp-panel').style.display = tab==='imp'?'block':'none';
  const btnNew = document.getElementById('gen-tab-new');
  const btnImp = document.getElementById('gen-tab-imp');
  btnNew.style.cssText = tab==='new' ? 'background:#0c1018;color:#00e5ff' : '';
  btnImp.style.cssText = tab==='imp' ? 'background:#0c1018;color:#00e5ff' : '';
  if(tab==='new') btnNew.className='btn btn-sm';
  else { btnNew.className='btn btn-sm btn-ghost'; btnImp.className='btn btn-sm'; }
}

async function executeGen() {
  const btn = document.getElementById('gen-modal-btn');
  btn.innerHTML = '<span class="spin-el"></span> Генерация…';
  btn.disabled = true;

  try {
    let privKey, address;

    if(genTabMode === 'imp') {
      const raw = document.getElementById('imp-key-input').value.replace(/^0x/,'').trim().toLowerCase();
      if(raw.length !== 64 || !/^[0-9a-f]+$/.test(raw)) throw new Error('Неверный приватный ключ — нужно 64 hex символа');
      privKey = raw;
      address = deriveAddressFromKey(privKey);
    } else {
      const wallet = generateRealWallet();
      privKey = wallet.privateKey;
      address = wallet.address;
    }

    // Show result
    document.getElementById('gr-addr').textContent = address;
    document.getElementById('gr-key').textContent  = privKey;
    document.getElementById('gr-key').classList.remove('show');
    document.getElementById('gen-result').style.display = 'flex';

    const label = document.getElementById('gen-label').value.trim() || `Кошелёк #${Date.now().toString().slice(-5)}`;
    const newWallet = {
      id: 'w'+Date.now(),
      addr: address,
      privKey: privKey, // stored in-memory only, not in localStorage
      label,
      balance: 0,
      trx: 0,
      enrolled: false,
      gasFreeAddr: null,
      nonce: 0,
      created: new Date().toISOString().split('T')[0]
    };
    DB[genTargetProj].active.push(newWallet);
    saveWallets();
    rerenderProj(genTargetProj);
    populateWithdrawSelect();
    updateGlobalStats();

    toast('Кошелёк создан ✓', 'success');
    btn.innerHTML = '✓ Создан';

    // Auto-fetch GasFree info if enabled
    if(document.getElementById('toggle-autoenroll').classList.contains('on')) {
      await fetchGasFreeInfo(newWallet, genTargetProj, true);
    }

  } catch(e) {
    toast(e.message, 'error');
    btn.innerHTML = '◈ Создать кошелёк';
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// GASFREE ACCOUNT INFO PER WALLET
// ═══════════════════════════════════════════════════════════════
async function fetchGasFreeInfo(wallet, projId, showInModal = false) {
  try {
    const data = await getGasFreeAccountInfo(wallet.addr);
    const info = data.data || data;
    wallet.enrolled    = true;
    wallet.gasFreeAddr = info.gasFreeAddress || info.gasfreeAddress || null;
    wallet.nonce       = info.nonce || 0;
    saveWallets();
    rerenderProj(projId);

    if(showInModal) {
      const box = document.getElementById('gen-gf-info');
      document.getElementById('gen-gf-content').innerHTML = `
        <div><span style="color:#334d66">GasFree адрес:</span> <span style="font-family:\'Space Mono\',monospace;color:#00e5ff;font-size:10px">${escHtml(wallet.gasFreeAddr||'—')}</span></div>
        <div><span style="color:#334d66">Nonce:</span> <span style="font-family:\'Space Mono\',monospace">${wallet.nonce}</span></div>
        <div><span style="color:#334d66">Статус:</span> <span class="badge badge-green">⚡ GasFree активен</span></div>
      `;
      box.style.display = 'flex';
    }
    return info;
  } catch(e) {
    if(showInModal) {
      const box = document.getElementById('gen-gf-info');
      document.getElementById('gen-gf-content').innerHTML = `<div class="err-box"><span>✕</span><span>${escHtml(e.message)}</span></div>`;
      box.style.display = 'flex';
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// REFRESH BALANCES
// ═══════════════════════════════════════════════════════════════
async function refreshAllBalances() {
  const btn = document.getElementById('global-refresh');
  btn.classList.add('spinning');
  toast('Обновление балансов…');

  const allWallets = [];
  PROJECTS.forEach(p => DB[p.id].active.forEach(w => allWallets.push({ w, projId: p.id })));

  let ok = 0, fail = 0;
  await Promise.allSettled(allWallets.map(async ({ w, projId }) => {
    try {
      // Update balance display to loading state
      const balEl = document.getElementById(`bal-${w.id}`);
      if(balEl) { balEl.textContent = '…'; balEl.className = 'wallet-balance loading'; }

      const { usdt, trx } = await fetchUSDTBalance(w.addr);
      w.balance = usdt;
      w.trx = trx;
      ok++;

      if(balEl) {
        balEl.textContent = fmt(usdt) + ' USDT';
        balEl.className = 'wallet-balance' + (usdt === 0 ? ' zero' : '');
      }
      const usdEl = document.getElementById(`usd-${w.id}`);
      if(usdEl) usdEl.textContent = `≈ $${fmt(usdt)} · ${trx.toFixed(2)} TRX`;
    } catch(e) {
      fail++;
      const balEl = document.getElementById(`bal-${w.id}`);
      if(balEl) { balEl.textContent = 'Ошибка'; balEl.className = 'wallet-balance zero'; }
    }
  }));

  saveWallets();
  updateGlobalStats();
  btn.classList.remove('spinning');
  toast(`Обновлено: ${ok} кошельков${fail ? `, ошибок: ${fail}` : ''} ✓`, 'success');
}

async function refreshSingleBalance(wid, projId) {
  const w = DB[projId].active.find(x => x.id===wid) || DB[projId].archived.find(x => x.id===wid);
  if(!w) return;
  const balEl = document.getElementById(`bal-${wid}`);
  if(balEl) { balEl.textContent = '…'; balEl.className = 'wallet-balance loading'; }
  try {
    const { usdt, trx } = await fetchUSDTBalance(w.addr);
    w.balance = usdt; w.trx = trx;
    saveWallets();
    if(balEl) { balEl.textContent = fmt(usdt)+' USDT'; balEl.className='wallet-balance'+(usdt===0?' zero':''); }
    const usdEl = document.getElementById(`usd-${wid}`);
    if(usdEl) usdEl.textContent = `≈ $${fmt(usdt)} · ${trx.toFixed(2)} TRX`;
    updateGlobalStats();
    toast('Баланс обновлён ✓', 'success');
  } catch(e) {
    if(balEl) { balEl.textContent = 'Ошибка'; balEl.className='wallet-balance zero'; }
    toast('Ошибка: '+e.message, 'error');
  }
}

async function refreshTxHistory(wid, projId) {
  const w = DB[projId].active.find(x=>x.id===wid);
  if(!w) return;
  toast('Загрузка истории…');
  try {
    const txs = await fetchTxHistory(w.addr);
    DB[projId].txs = txs;
    saveWallets();
    rerenderProj(projId);
    toast(`Загружено ${txs.length} транзакций`, 'success');
  } catch(e) { toast('Ошибка: '+e.message, 'error'); }
}

// ═══════════════════════════════════════════════════════════════
// GASFREE WITHDRAW
// ═══════════════════════════════════════════════════════════════
async function buildAndSubmitTransfer(fromAddr, privKey, toAddr, amountUSDT, maxFeeUSDT) {
  const c = cfg();
  if(!c.gfKey || !c.gfSecret) throw new Error('Укажите GasFree API Key и Secret в настройках');
  if(!c.provider) throw new Error('Укажите адрес Service Provider в настройках');

  // Step 1: get GasFree account info to fetch nonce
  const acctData = await getGasFreeAccountInfo(fromAddr);
  const acct = acctData.data || acctData;
  console.log('[Transfer] GasFree account info:', JSON.stringify(acct));

  // nonce is per-account, comes from GasFree
  const nonce = (acct.nonce !== undefined && acct.nonce !== null) ? Number(acct.nonce) : 0;

  // values must be integers (Sun/micro units), passed as numbers not strings
  const valueInt   = Math.round(amountUSDT * 1e6);
  const maxFeeInt  = Math.round(maxFeeUSDT * 1e6);
  const deadline   = Math.floor(Date.now() / 1000) + 600;

  // Step 2: build the TIP-712 permit message
  // All numeric fields as numbers (not strings, not BigInt)
  const message = {
    token:           c.usdt,
    serviceProvider: c.provider,
    user:            fromAddr,
    receiver:        toAddr,
    value:           valueInt,
    maxFee:          maxFeeInt,
    deadline:        deadline,
    version:         1,
    nonce:           nonce,
  };

  console.log('[Transfer] Permit message:', JSON.stringify(message));

  // Step 3: sign with TIP-712
  const sig = await signPermitTransfer(privKey, message);
  console.log('[Transfer] Signature:', sig);

  // Step 4: submit to GasFree relay
  // Try all known field name variants across different GasFree API versions

  // Variant A: sig field (older docs)
  const bodyA = {
    token:           c.usdt,
    serviceProvider: c.provider,
    user:            fromAddr,
    receiver:        toAddr,
    value:           String(valueInt),
    maxFee:          String(maxFeeInt),
    deadline:        String(deadline),
    version:         1,
    nonce:           nonce,
    sig:             sig,
  };

  // Variant B: signature field (newer docs)
  const bodyB = { ...bodyA, signature: sig };
  delete bodyB.sig;

  // Variant C: numeric value/maxFee/deadline/nonce
  const bodyC = {
    token:           c.usdt,
    serviceProvider: c.provider,
    user:            fromAddr,
    receiver:        toAddr,
    value:           valueInt,
    maxFee:          maxFeeInt,
    deadline:        deadline,
    version:         1,
    nonce:           nonce,
    sig:             sig,
  };

  // Variant D: numeric + signature field name
  const bodyD = { ...bodyC, signature: sig };
  delete bodyD.sig;

  const attempts = [
    { endpoint: '/transfer',        body: bodyA, label: 'A: /transfer sig=string' },
    { endpoint: '/transfer',        body: bodyB, label: 'B: /transfer signature=string' },
    { endpoint: '/transfer',        body: bodyC, label: 'C: /transfer sig=number' },
    { endpoint: '/transfer',        body: bodyD, label: 'D: /transfer signature=number' },
    { endpoint: '/transfer/submit', body: bodyA, label: 'E: /transfer/submit sig=string' },
    { endpoint: '/transfer/submit', body: bodyB, label: 'F: /transfer/submit signature=string' },
  ];

  let lastResult;
  for (const attempt of attempts) {
    console.log(`[Transfer] Trying ${attempt.label}:`, JSON.stringify(attempt.body));
    try {
      const result = await gfPost(attempt.endpoint, attempt.body);
      console.log(`[Transfer] ${attempt.label} response:`, JSON.stringify(result));
      lastResult = result;

      // Success — no code 500/400
      if (!result || result.code === undefined || (result.code >= 200 && result.code < 300)) {
        return result;
      }
      if (result.code !== 500 && result.code !== 400 && result.code !== 422) {
        return result;
      }
      console.warn(`[Transfer] ${attempt.label} returned code ${result.code}, trying next...`);
    } catch(e) {
      console.warn(`[Transfer] ${attempt.label} threw:`, e.message);
      lastResult = { code: 500, message: e.message };
    }
  }

  // All failed — throw with last response
  const msg = lastResult?.message || lastResult?.reason || JSON.stringify(lastResult);
  throw new Error(`GasFree relay ошибка: ${msg}`);
}

async function doGasFreeWithdraw() {
  if (!guardWithdraw()) return;
  const fromAddr = document.getElementById('wd-from-select').value;
  const toAddr   = document.getElementById('wd-to').value.trim();
  const amount   = parseFloat(document.getElementById('wd-amount').value);
  const maxfee   = parseFloat(document.getElementById('wd-maxfee').value);
  const privKey  = document.getElementById('wd-key').value.trim().replace(/^0x/,'');

  if(!fromAddr)                            { toast('Выберите кошелёк', 'error'); return; }
  if(!toAddr.startsWith('T')||toAddr.length<20) { toast('Неверный адрес получателя', 'error'); return; }
  if(!amount || amount <= 0)               { toast('Введите сумму', 'error'); return; }
  if(!privKey || privKey.length !== 64)    { toast('Неверный приватный ключ', 'error'); return; }

  const btn = document.getElementById('wd-btn');
  btn.innerHTML = '<span class="spin-el"></span> Подпись и отправка…';
  btn.disabled = true;
  document.getElementById('wd-result-box').style.display = 'none';

  try {
    const result = await buildAndSubmitTransfer(fromAddr, privKey, toAddr, amount, maxfee);
    const traceId = result?.data?.id || result?.id || result?.traceId || JSON.stringify(result);

    document.getElementById('wd-result-box').innerHTML = `
      <div class="info-box" style="flex-direction:column;gap:6px">
        <div style="font-weight:700;color:#00e676">✓ Транзакция отправлена в GasFree relay</div>
        <div><span style="color:#334d66">Trace ID:</span> <span style="font-family:\'Space Mono\',monospace;font-size:10px">${escHtml(String(traceId))}</span></div>
        <div style="font-size:10px;color:#6e8fad">Статус появится на chain через несколько секунд</div>
      </div>`;
    document.getElementById('wd-result-box').style.display = 'block';

    // Save tx to project history
    addTxToProject(fromAddr, { hash: String(traceId), type:'out', amount, to:toAddr, time:nowStr(), status:'pending' });
    toast(`Отправлено ${amount} USDT ✓`, 'success');
  } catch(e) {
    document.getElementById('wd-result-box').innerHTML = `<div class="err-box"><span>✕</span><span>${escHtml(e.message)}</span></div>`;
    document.getElementById('wd-result-box').style.display = 'block';
    toast('Ошибка: '+e.message, 'error');
  }

  btn.innerHTML = '↑ Отправить через GasFree';
  btn.disabled = false;
}

// MODAL WITHDRAW
function openModalWithdraw(wid, projId) {
  const w = DB[projId].active.find(x=>x.id===wid);
  if(!w) return;
  mwdWallet = { ...w, projId };
  document.getElementById('mwd-from-addr').textContent = w.addr;
  document.getElementById('mwd-from-bal').textContent  = fmt(w.balance) + ' USDT';
  document.getElementById('mwd-avail').textContent     = `Доступно: ${fmt(w.balance)} USDT`;
  document.getElementById('mwd-maxfee').value          = cfg().maxfee || 5;
  document.getElementById('mwd-to').value     = '';
  document.getElementById('mwd-amount').value = '';
  document.getElementById('mwd-key').value    = '';
  document.getElementById('mwd-result').style.display = 'none';
  document.getElementById('mwd-btn').innerHTML = '↑ Отправить USDT';
  document.getElementById('mwd-btn').disabled = false;
  document.getElementById('wd-modal').classList.add('open');
}

async function execModalWithdraw() {
  if (!guardWithdraw()) return;
  const toAddr  = document.getElementById('mwd-to').value.trim();
  const amount  = parseFloat(document.getElementById('mwd-amount').value);
  const maxfee  = parseFloat(document.getElementById('mwd-maxfee').value) || 5;
  const privKey = document.getElementById('mwd-key').value.trim().replace(/^0x/,'');

  if(!toAddr.startsWith('T')||toAddr.length<20) { toast('Неверный адрес получателя','error'); return; }
  if(!amount||amount<=0) { toast('Введите сумму','error'); return; }
  if(!privKey||privKey.length!==64) { toast('Неверный приватный ключ','error'); return; }

  const btn = document.getElementById('mwd-btn');
  btn.innerHTML = '<span class="spin-el"></span> Подпись…';
  btn.disabled = true;
  document.getElementById('mwd-result').style.display = 'none';

  try {
    const result = await buildAndSubmitTransfer(mwdWallet.addr, privKey, toAddr, amount, maxfee);
    const traceId = result?.data?.id || result?.id || result?.traceId || JSON.stringify(result);

    document.getElementById('mwd-result').innerHTML = `
      <div class="info-box" style="flex-direction:column;gap:5px">
        <div style="color:#00e676;font-weight:700">✓ Отправлено в GasFree relay</div>
        <div style="font-family:\'Space Mono\',monospace;font-size:10px">${escHtml(String(traceId))}</div>
      </div>`;
    document.getElementById('mwd-result').style.display = 'block';

    addTxToProject(mwdWallet.addr, { hash:String(traceId), type:'out', amount, to:toAddr, time:nowStr(), status:'pending' });
    toast(`Отправлено ${amount} USDT ✓`, 'success');
    btn.innerHTML = '✓ Отправлено';
  } catch(e) {
    document.getElementById('mwd-result').innerHTML = `<div class="err-box"><span>✕</span><span>${escHtml(e.message)}</span></div>`;
    document.getElementById('mwd-result').style.display = 'block';
    toast('Ошибка: '+e.message, 'error');
    btn.innerHTML = '↑ Отправить USDT';
    btn.disabled = false;
  }
}

function addTxToProject(fromAddr, tx) {
  PROJECTS.forEach(p => {
    if(DB[p.id].active.some(w=>w.addr===fromAddr)) {
      DB[p.id].txs.unshift(tx);
      rerenderProj(p.id);
    }
  });
  saveWallets();
  updateGlobalStats();
}

// ═══════════════════════════════════════════════════════════════
// WALLET MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function archiveWallet(wid, projId) {
  const d = DB[projId];
  const idx = d.active.findIndex(w=>w.id===wid);
  if(idx===-1) return;
  const w = d.active.splice(idx,1)[0];
  w.archivedAt = new Date().toISOString().split('T')[0];
  d.archived.push(w);
  saveWallets(); rerenderProj(projId); updateGlobalStats();
  populateWithdrawSelect();
  toast('Кошелёк архивирован', 'success');
}

function unarchiveWallet(wid, projId) {
  const d = DB[projId];
  const idx = d.archived.findIndex(w=>w.id===wid);
  if(idx===-1) return;
  const w = d.archived.splice(idx,1)[0];
  delete w.archivedAt;
  d.active.push(w);
  saveWallets(); rerenderProj(projId); updateGlobalStats();
  populateWithdrawSelect();
  toast('Кошелёк восстановлен', 'success');
}

async function enrollWalletGF(wid, projId) {
  const w = DB[projId].active.find(x=>x.id===wid);
  if(!w) return;
  toast('Запрос GasFree статуса…');
  await fetchGasFreeInfo(w, projId, false);
  toast('GasFree статус получен ✓', 'success');
}

// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════
function renderProjTabs() {
  const bar = document.getElementById('proj-tabs-bar');
  bar.innerHTML = PROJECTS.map(p => {
    const cnt = DB[p.id].active.length;
    return `<div class="proj-tab ${p.id===currentProjId?'active':''}" id="ptab-${p.id}" onclick="switchProjTab('${p.id}')">
      ${p.name}<span class="proj-tab-count">${cnt}</span>
    </div>`;
  }).join('');
}

function renderAllProjPanels() {
  const host = document.getElementById('proj-panels-host');
  host.innerHTML = PROJECTS.map((p,i) => renderProjPanel(p, i===0)).join('');
}

function renderProjPanel(proj, isActive) {
  const d = DB[proj.id];
  const totalBal = d.active.reduce((s,w)=>s+w.balance, 0);
  return `
  <div class="proj-panel ${isActive?'active':''}" id="ppanel-${proj.id}">
    <div class="stats-row" style="margin-bottom:18px">
      <div class="stat-box"><div class="stat-lbl">Баланс проекта</div><div class="stat-val" style="color:${proj.color};font-size:18px">${fmt(totalBal)} USDT</div><div class="stat-sub">Сумма активных</div></div>
      <div class="stat-box"><div class="stat-lbl">Активных</div><div class="stat-val c-green">${d.active.length}</div><div class="stat-sub">Кошельков</div></div>
      <div class="stat-box"><div class="stat-lbl">В архиве</div><div class="stat-val" style="color:#6e8fad">${d.archived.length}</div><div class="stat-sub">Архивировано</div></div>
      <div class="stat-box"><div class="stat-lbl">Транзакций</div><div class="stat-val c-yellow">${d.txs.length}</div><div class="stat-sub">В истории</div></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px">
      <div class="inner-tabs" id="itabs-${proj.id}">
        <div class="inner-tab active" onclick="switchInner('${proj.id}','active',this)">Активные <span class="proj-tab-count">${d.active.length}</span></div>
        <div class="inner-tab" onclick="switchInner('${proj.id}','archive',this)">Архив <span class="proj-tab-count">${d.archived.length}</span></div>
        <div class="inner-tab" onclick="switchInner('${proj.id}','history',this)">История TX <span class="proj-tab-count">${d.txs.length}</span></div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="refreshTxHistory('${d.active[0]?.id||''}','${proj.id}')">↻ История</button>
        <button class="btn btn-primary btn-sm" onclick="openGenModal('${proj.id}')">+ Добавить</button>
      </div>
    </div>
    <div class="inner-panel active" id="ipanel-${proj.id}-active">
      ${d.active.length===0 ? '<div class="empty-state"><div class="empty-icon">◈</div>Нет активных кошельков</div>' : ''}
      <div class="wallet-list">${d.active.map(w=>renderWalletItem(w,proj.id,false)).join('')}</div>
    </div>
    <div class="inner-panel" id="ipanel-${proj.id}-archive">
      ${d.archived.length===0 ? '<div class="empty-state"><div class="empty-icon">📦</div>Архив пуст</div>' : ''}
      <div class="wallet-list">${d.archived.map(w=>renderWalletItem(w,proj.id,true)).join('')}</div>
    </div>
    <div class="inner-panel" id="ipanel-${proj.id}-history">
      ${d.txs.length===0
        ? '<div class="empty-state"><div class="empty-icon">◎</div>Транзакций нет · Нажмите «↻ История» для загрузки</div>'
        : `<div class="table-wrap"><table class="tx-table"><thead><tr>
            <th>TX Hash / Trace ID</th><th>Тип</th><th>Сумма</th><th>Контрагент</th><th>Время</th><th>Статус</th>
           </tr></thead><tbody>${d.txs.map(tx=>`
            <tr>
              <td class="tx-hash-cell"><a href="https://tronscan.org/#/transaction/${escHtml(tx.hash)}" target="_blank">${escHtml(tx.hash.substring(0,16))}…</a></td>
              <td>${tx.type==='out'?'<span style="color:#ff3b5c">↑ Исходящая</span>':'<span style="color:#00e676">↓ Входящая</span>'}</td>
              <td class="${tx.type==='out'?'tx-amount-out':'tx-amount-in'}">${tx.type==='out'?'−':'+'}${fmt(tx.amount)} USDT</td>
              <td class="tx-hash-cell" style="font-size:10px">${escHtml((tx.to||tx.from||'').substring(0,18))}…</td>
              <td class="tx-time-cell">${escHtml(tx.time)}</td>
              <td>${tx.status==='confirmed'?'<span class="badge badge-green">✓ Подтверждена</span>':tx.status==='pending'?'<span class="badge badge-yellow">⏳ Ожидание</span>':'<span class="badge badge-red">✕ Ошибка</span>'}</td>
            </tr>`).join('')}</tbody></table></div>`
      }
    </div>
  </div>`;
}

function renderWalletItem(w, projId, archived) {
  return `
  <div class="wallet-item ${archived?'archived':''}" id="witem-${w.id}">
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap">
        ${w.label?`<span style="font-size:11px;font-weight:700;color:#6e8fad">${escHtml(w.label)}</span>`:''}
        ${w.enrolled?'<span class="badge badge-green">⚡ GasFree</span>':'<span class="badge badge-gray">Не подключён</span>'}
        ${archived?'<span class="badge badge-gray">Архив</span>':''}
      </div>
      <div class="wallet-addr" onclick="copyRaw('${escHtml(w.addr)}')" title="Нажмите для копирования">${escHtml(w.addr)}</div>
      ${w.gasFreeAddr?`<div style="font-size:9px;color:#334d66;margin-top:3px;font-family:\'Space Mono\',monospace">GF: ${escHtml(w.gasFreeAddr)}</div>`:''}
      <div class="wallet-meta">
        <span class="wallet-tag">Создан: ${w.created}</span>
        ${archived?`<span class="wallet-tag">Архивирован: ${w.archivedAt||'—'}</span>`:`<span class="wallet-tag" id="trx-${w.id}">TRX: ${w.trx.toFixed(2)}</span>`}
        ${w.nonce!==undefined&&!archived?`<span class="wallet-tag">Nonce: ${w.nonce}</span>`:''}
      </div>
    </div>
    <div>
      <div class="wallet-balance ${w.balance===0?'zero':''}" id="bal-${w.id}">${fmt(w.balance)} USDT</div>
      <div class="wallet-balance-usd" id="usd-${w.id}">≈ $${fmt(w.balance)} · ${w.trx.toFixed(2)} TRX</div>
      <div class="wallet-actions">
        ${!archived?`
          <button class="btn btn-ghost btn-xs" onclick="refreshSingleBalance('${w.id}','${projId}')">↻</button>
          ${currentRole && currentRole.canWithdraw ? `<button class="btn btn-outline btn-xs" onclick="openModalWithdraw('${w.id}','${projId}')">↑ Вывод</button>` : ''}
          ${!w.enrolled?`<button class="btn btn-ghost btn-xs" onclick="enrollWalletGF('${w.id}','${projId}')">⚡ GF статус</button>`:''}
          <button class="btn btn-ghost btn-xs" onclick="archiveWallet('${w.id}','${projId}')">Архив</button>
        `:`
          <button class="btn btn-ghost btn-xs" onclick="unarchiveWallet('${w.id}','${projId}')">↩ Восстановить</button>
        `}
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION & UI
// ═══════════════════════════════════════════════════════════════
function setMainPage(id, el) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.topbar-nav-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  if(id==='withdraw') loadProviders();
}

function sideNav(el, page) {
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  const map = { wallets:'Кошельки', withdraw:'Вывод', config:'Настройки' };
  document.querySelectorAll('.topbar-nav-btn').forEach(b=>{ if(b.textContent.trim()===map[page]) b.classList.add('active'); });
  if(page==='withdraw') loadProviders();
}

function switchProjTab(id) {
  currentProjId = id;
  document.querySelectorAll('.proj-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('ptab-'+id).classList.add('active');
  document.querySelectorAll('.proj-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('ppanel-'+id).classList.add('active');
}

function switchInner(projId, tab, el) {
  document.getElementById('itabs-'+projId).querySelectorAll('.inner-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  ['active','archive','history'].forEach(t => {
    const p = document.getElementById(`ipanel-${projId}-${t}`);
    if(p) p.classList.remove('active');
  });
  const target = document.getElementById(`ipanel-${projId}-${tab}`);
  if(target) target.classList.add('active');
}

function rerenderProj(projId) {
  const proj = PROJECTS.find(p=>p.id===projId);
  const panel = document.getElementById('ppanel-'+projId);
  if(!panel) return;
  const isActive = panel.classList.contains('active');
  const tmp = document.createElement('div');
  tmp.innerHTML = renderProjPanel(proj, isActive);
  panel.replaceWith(tmp.firstElementChild);
  const tabEl = document.getElementById('ptab-'+projId);
  if(tabEl) {
    tabEl.innerHTML = `${proj.name}<span class="proj-tab-count">${DB[projId].active.length}</span>`;
    if(isActive) tabEl.classList.add('active');
  }
}

function updateGlobalStats() {
  let total=0, active=0, archived=0, txs=0;
  Object.values(DB).forEach(d => {
    d.active.forEach(w=>total+=w.balance);
    active   += d.active.length;
    archived += d.archived.length;
    txs      += d.txs.length;
  });
  document.getElementById('gstat-total').textContent    = fmt(total)+' USDT';
  document.getElementById('gstat-active').textContent   = active;
  document.getElementById('gstat-archived').textContent = archived;
  document.getElementById('gstat-tx').textContent       = txs;
}

function populateWithdrawSelect() {
  const sel = document.getElementById('wd-from-select');
  sel.innerHTML = '<option value="">— Выберите кошелёк —</option>';
  PROJECTS.forEach(p => {
    DB[p.id].active.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.addr;
      opt.textContent = `[${p.name}] ${w.addr.substring(0,14)}… · ${fmt(w.balance)} USDT`;
      sel.appendChild(opt);
    });
  });
  sel.onchange = () => {
    let bal = 0;
    Object.values(DB).forEach(d => d.active.forEach(w=>{ if(w.addr===sel.value) bal=w.balance; }));
    document.getElementById('wd-avail').textContent = sel.value ? `Доступно: ${fmt(bal)} USDT` : 'Доступно: —';
  };
}

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════
function fmt(n) { return Number(n||0).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function nowStr() { const d=new Date(); return d.toLocaleDateString('ru-RU')+' '+d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); }
function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function delay(ms) { return new Promise(r=>setTimeout(r,ms)); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function togglePwd(id,btn) {
  const inp=document.getElementById(id);
  if(inp.type==='password'){inp.type='text';btn.textContent='Скрыть';}
  else{inp.type='password';btn.textContent='Показать';}
}
function copyEl(id,btn) {
  navigator.clipboard.writeText(document.getElementById(id).textContent).then(()=>{
    const o=btn.textContent; btn.textContent='Скопировано!'; btn.style.color='#00e676';
    setTimeout(()=>{btn.textContent=o;btn.style.color='';},1500);
  });
}
function copyText(text,btn) {
  navigator.clipboard.writeText(text).then(()=>{
    const o=btn.textContent; btn.textContent='Скопировано!'; btn.style.color='#00e676';
    setTimeout(()=>{btn.textContent=o;btn.style.color='';},1500);
  });
}
function copyRaw(text) { navigator.clipboard.writeText(text).then(()=>toast('Адрес скопирован','success')); }
function toast(msg,type='info') {
  const el=document.getElementById('toast');
  el.className='toast '+type;
  document.getElementById('toast-icon').textContent=type==='success'?'✓':type==='error'?'✕':'ℹ';
  document.getElementById('toast-msg').textContent=msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),3200);
}

// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  loadConfigFromStorage();
  checkSession();
  renderProjTabs();
  renderAllProjPanels();
  populateWithdrawSelect();
  updateGlobalStats();
});

// ═══════════════════════════════════════════════════════════════
// AUTH — ROLE-BASED ACCESS CONTROL
// ═══════════════════════════════════════════════════════════════

// ── HARDCODED PASSWORDS — change these directly in this file ──
const PASSWORDS = {
  admin: 'admin123',   // Super Admin — full access
  mull:  'mull111',    // User Mull   — tab Mull only
  time:  'time222',    // User Time   — tab Time only
  sov:   'sov333',     // User Sov    — tab Sov only
  rail:  'rail444',    // User Rail   — tab Rail only
  temp:  'temp555',    // User Temp   — tab Temp only
};

// ── ROLES ──
const ROLES = {
  admin: { label:'Super Admin', tabs:['mull','time','sov','rail','temp'], canWithdraw:true,  canConfig:true,  canSeeKeys:true  },
  mull:  { label:'Mull',        tabs:['mull'],                            canWithdraw:false, canConfig:false, canSeeKeys:false },
  time:  { label:'Time',        tabs:['time'],                            canWithdraw:false, canConfig:false, canSeeKeys:false },
  sov:   { label:'Sov',         tabs:['sov'],                             canWithdraw:false, canConfig:false, canSeeKeys:false },
  rail:  { label:'Rail',        tabs:['rail'],                            canWithdraw:false, canConfig:false, canSeeKeys:false },
  temp:  { label:'Temp',        tabs:['temp'],                            canWithdraw:false, canConfig:false, canSeeKeys:false },
};

let currentRole = null; // set after login

function doLogin() {
  const userId = document.getElementById('auth-user').value;
  const pass   = document.getElementById('auth-pass').value;
  const errEl  = document.getElementById('auth-error');

  if (!pass || PASSWORDS[userId] !== pass) {
    errEl.textContent = 'Неверный пароль';
    errEl.classList.add('show');
    document.getElementById('auth-pass').value = '';
    document.getElementById('auth-pass').focus();
    return;
  }

  currentRole = ROLES[userId];
  errEl.classList.remove('show');

  // Hide login screen
  document.getElementById('auth-overlay').style.display = 'none';

  // Apply role restrictions
  applyRole(userId);

  // Store in sessionStorage (clears on tab close)
  try { sessionStorage.setItem('tgf_role', userId); } catch(e) {}

  toast(`Добро пожаловать, ${currentRole.label}!`, 'success');
}

function applyRole(userId) {
  const role = ROLES[userId];
  currentRole = role;

  // ── Project tabs: hide tabs user can't access ──
  PROJECTS.forEach(p => {
    const tabEl = document.getElementById('ptab-' + p.id);
    if (tabEl) tabEl.style.display = role.tabs.includes(p.id) ? '' : 'none';
  });

  // Switch to first allowed tab
  if (!role.tabs.includes(currentProjId)) {
    switchProjTab(role.tabs[0]);
  }

  // ── Topbar: hide Withdraw and Config for non-admins ──
  document.querySelectorAll('.topbar-nav-btn').forEach(btn => {
    const txt = btn.textContent.trim();
    if (txt === 'Вывод' && !role.canWithdraw)   btn.style.display = 'none';
    if (txt === 'Настройки' && !role.canConfig)  btn.style.display = 'none';
  });

  // ── Sidebar: hide Withdraw and Config nav items ──
  document.querySelectorAll('.nav-item').forEach(item => {
    const txt = item.textContent.trim();
    if ((txt.includes('Вывод') || txt.includes('вывод')) && !role.canWithdraw) item.style.display = 'none';
    if ((txt.includes('Настройки') || txt.includes('настройки')) && !role.canConfig) item.style.display = 'none';
  });

  // ── Show role badge in topbar ──
  const existing = document.getElementById('role-badge');
  if (existing) existing.remove();
  const badge = document.createElement('div');
  badge.id = 'role-badge';
  badge.style.cssText = 'display:flex;align-items:center;gap:7px;padding:4px 11px;border-radius:5px;font-size:11px;font-weight:700;background:rgba(0,229,255,0.07);border:1px solid rgba(0,229,255,0.15);color:#6e8fad;white-space:nowrap;';
  badge.innerHTML = `<span style="color:#00e5ff">◈</span> ${role.label}
    <button onclick="doLogout()" style="background:none;border:none;color:#334d66;cursor:pointer;font-size:11px;margin-left:4px;font-family:'Syne',sans-serif;padding:0" title="Выйти">✕</button>`;
  document.querySelector('.topbar-right').prepend(badge);

  // ── Page-level restrictions ──
  if (!role.canWithdraw) {
    // If somehow on withdraw page, redirect
    const wdPage = document.getElementById('page-withdraw');
    if (wdPage && wdPage.classList.contains('active')) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-wallets').classList.add('active');
    }
  }
}

function doLogout() {
  currentRole = null;
  try { sessionStorage.removeItem('tgf_role'); } catch(e) {}
  // Clear password field and show login
  document.getElementById('auth-pass').value = '';
  document.getElementById('auth-overlay').style.display = 'flex';
  // Reset nav buttons visibility
  document.querySelectorAll('.topbar-nav-btn').forEach(b => b.style.display = '');
  document.querySelectorAll('.nav-item').forEach(b => b.style.display = '');
  PROJECTS.forEach(p => {
    const t = document.getElementById('ptab-' + p.id);
    if(t) t.style.display = '';
  });
  const badge = document.getElementById('role-badge');
  if (badge) badge.remove();
}

// Guard: intercept withdraw attempts from non-admins
function guardWithdraw() {
  if (!currentRole || !currentRole.canWithdraw) {
    toast('Нет доступа — только Super Admin может выводить средства', 'error');
    return false;
  }
  return true;
}

// Guard: intercept key reveal for non-admins
function guardKeys() {
  if (!currentRole || !currentRole.canSeeKeys) {
    toast('Нет доступа к приватным ключам', 'error');
    return false;
  }
  return true;
}

// Check session on load — restore role if session exists
function checkSession() {
  try {
    const saved = sessionStorage.getItem('tgf_role');
    if (saved && ROLES[saved]) {
      currentRole = ROLES[saved];
      document.getElementById('auth-overlay').style.display = 'none';
      applyRole(saved);
    }
  } catch(e) {}
}

</script>
</body>
</html>
