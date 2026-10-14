const fs = require('fs');
const os = require('os');
const path = require('path');

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
// İleri eğik çizgi hem Windows'ta hem Git Bash/sh'de çalışır.
const SCRIPT_PATH = path.resolve(__dirname, '..', 'bin', 'notify.js').replace(/\\/g, '/');

const HOOKS = { UserPromptSubmit: 'prompt', Stop: 'stop', Notification: 'notification' };

function isOurs(hook) {
  return hook && typeof hook.command === 'string' && hook.command.includes(SCRIPT_PATH);
}

function readSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return {};
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
}

function writeSettings(settings) {
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  if (fs.existsSync(SETTINGS_PATH)) fs.copyFileSync(SETTINGS_PATH, SETTINGS_PATH + '.bak');
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
}

// Bizim eklediğimiz hook'ları çıkarır, başkalarına dokunmaz; boş kalan grupları/olayları temizler.
function stripOurs(settings) {
  const hooks = settings.hooks || {};
  for (const event of Object.keys(HOOKS)) {
    if (!Array.isArray(hooks[event])) continue;
    hooks[event] = hooks[event]
      .map((group) => ({ ...group, hooks: (group.hooks || []).filter((h) => !isOurs(h)) }))
      .filter((group) => group.hooks.length > 0);
    if (hooks[event].length === 0) delete hooks[event];
  }
  if (Object.keys(hooks).length === 0) delete settings.hooks;
  else settings.hooks = hooks;
  return settings;
}

function install() {
  const settings = stripOurs(readSettings());
  settings.hooks = settings.hooks || {};
  for (const [event, arg] of Object.entries(HOOKS)) {
    settings.hooks[event] = settings.hooks[event] || [];
    settings.hooks[event].push({
      hooks: [{ type: 'command', command: `node "${SCRIPT_PATH}" ${arg}`, timeout: 15 }],
    });
  }
  writeSettings(settings);
  console.log(`Hook'lar eklendi: ${SETTINGS_PATH}`);
  console.log('Yedek: settings.json.bak. Açık Claude Code oturumlarını yeniden başlat (veya /hooks ile onayla).');
}

function uninstall() {
  if (!fs.existsSync(SETTINGS_PATH)) return console.log('settings.json yok, kaldırılacak bir şey yok.');
  writeSettings(stripOurs(readSettings()));
  console.log(`Hook'lar kaldırıldı: ${SETTINGS_PATH}`);
}

module.exports = { install, uninstall };
