// "{project} — {duration}" gibi şablonlardaki değişkenleri doldurur; bilinmeyenler boş kalır.
function render(template, vars) {
  return String(template || '')
    .replace(/\{(\w+)\}/g, (_, key) => (vars[key] == null ? '' : String(vars[key])))
    .trim();
}

function formatDuration(seconds) {
  if (seconds == null) return '?';
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}sa ${m}dk`;
  if (m) return `${m}dk ${sec}sn`;
  return `${sec}sn`;
}

function truncate(text, max) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

module.exports = { render, formatDuration, truncate };
