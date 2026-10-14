// Genel webhook: Discord "content", Slack "text" alanını okur; diğer servisler için yapılandırılmış alanlar da var.
async function send({ title, body, event, vars }, config) {
  const { enabled, url } = config.channels.webhook || {};
  if (!enabled) return;
  if (!url) throw new Error('webhook açık ama "url" boş');
  const text = `**${title}**\n${body}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text, text, title, body, event, project: vars.project, cwd: vars.cwd }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`webhook HTTP ${res.status}`);
}

module.exports = { name: 'webhook', send };
