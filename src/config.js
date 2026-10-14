const fs = require('fs');
const os = require('os');
const path = require('path');

const CONFIG_PATH = path.join(os.homedir(), '.claude-notify.json');

const DEFAULTS = {
  events: {
    stop: {
      enabled: true,
      title: 'Claude Code ✓',
      body: '{project} — {duration} sürdü',
      sound: 'default',
      minDurationSeconds: 20,
    },
    notification: {
      enabled: true,
      title: 'Claude seni bekliyor',
      body: '{project}: {message}',
      sound: 'default',
      // Claude'un "60 sn'dir girdi bekliyorum" hatırlatmasını atla (Stop zaten bildirdi)
      ignoreIdle: true,
    },
  },
  quietHours: { enabled: false, from: '23:00', to: '08:00' },
  channels: {
    desktop: true,
    ntfy: { enabled: false, server: 'https://ntfy.sh', topic: '' },
    webhook: { enabled: false, url: '' },
  },
  projects: {},
};

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge(base, override) {
  if (!isObject(override)) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    out[key] = isObject(value) && isObject(base[key]) ? deepMerge(base[key], value) : value;
  }
  return out;
}

function readUserConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') process.stderr.write(`claude-notify: ${CONFIG_PATH} okunamadı: ${err.message}\n`);
    return {};
  }
}

// Varsayılanlar <- kullanıcı ayarları <- projects[projectName] ayarları
function loadConfig(projectName) {
  const merged = deepMerge(DEFAULTS, readUserConfig());
  const projectOverride = projectName && merged.projects[projectName];
  return projectOverride ? deepMerge(merged, projectOverride) : merged;
}

function ensureConfigFile() {
  if (!fs.existsSync(CONFIG_PATH)) {
    const { projects, ...rest } = DEFAULTS;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ ...rest, projects: {} }, null, 2) + '\n');
  }
  return CONFIG_PATH;
}

module.exports = { CONFIG_PATH, DEFAULTS, loadConfig, ensureConfigFile };
