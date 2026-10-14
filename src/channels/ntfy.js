// https://ntfy.sh — telefona ntfy uygulamasını kurup aynı topic'e abone olman yeterli.
async function send({ title, body, event }, config) {
  const { enabled, server, topic } = config.channels.ntfy || {};
  if (!enabled) return;
  if (!topic) throw new Error('ntfy açık ama "topic" boş');
  // JSON yayınlama, başlıkta Türkçe karakterleri sorunsuz taşır (HTTP header'ları taşımaz).
  const res = await fetch(String(server || 'https://ntfy.sh').replace(/\/+$/, ''), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, title, message: body, tags: [event === 'stop' ? 'white_check_mark' : 'bell'] }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`ntfy HTTP ${res.status}`);
}

module.exports = { name: 'ntfy', send };
