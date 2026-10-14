#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');
const { loadConfig, ensureConfigFile } = require('../src/config');
const { render, formatDuration, truncate } = require('../src/template');
const { recordStart, readStart } = require('../src/timing');
const { dispatch } = require('../src/channels');
const { install, uninstall } = require('../src/install');

const USAGE = `claude-notify — Claude Code bildirimleri

Hook komutları (Claude Code çağırır, stdin'den JSON okur):
  prompt          Prompt gönderildi, süreyi başlat
  stop            Claude bitirdi
  notification    Claude izin/girdi bekliyor

Senin kullanacağın komutlar:
  install         Hook'ları ~/.claude/settings.json'a ekle
  uninstall       Hook'ları kaldır
  config          Ayar dosyasını (~/.claude-notify.json) oluştur ve aç
  test [olay]     Örnek bildirim gönder (olay: stop | notification, varsayılan stop)`;

function readStdin() {
  if (process.stdin.isTTY) return Promise.resolve({});
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
}

function inQuietHours({ enabled, from, to }) {
  if (!enabled) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(from);
  const end = toMinutes(to);
  // Gece yarısını aşan aralıklar (23:00–08:00) için iki parça kontrol edilir.
  return start <= end ? cur >= start && cur < end : cur >= start || cur < end;
}

function isIdleReminder(input) {
  return input.notification_type === 'idle_prompt' || /waiting for your input/i.test(input.message || '');
}

async function handle(event, input, { force = false } = {}) {
  const cwd = input.cwd || process.cwd();
  const project = path.basename(cwd);
  const config = loadConfig(project);
  const eventConfig = config.events[event];
  if (!eventConfig || !eventConfig.enabled) return;
  if (!force && inQuietHours(config.quietHours)) return;

  const { seconds, prompt } = readStart(input.session_id);
  if (event === 'stop' && !force && seconds != null && seconds < (eventConfig.minDurationSeconds || 0)) return;
  if (event === 'notification' && !force && eventConfig.ignoreIdle && isIdleReminder(input)) return;

  const vars = {
    project,
    cwd,
    duration: formatDuration(seconds),
    message: input.message || '',
    prompt: truncate(prompt, 60),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  await dispatch(
    {
      event,
      vars,
      title: render(eventConfig.title, vars) || 'Claude Code',
      body: render(eventConfig.body, vars) || project,
      sound: eventConfig.sound,
    },
    config,
  );
}

function openFile(file) {
  const [cmd, args] =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '""', file]]
      : [process.platform === 'darwin' ? 'open' : 'xdg-open', [file]];
  spawn(cmd, args, { stdio: 'ignore', detached: true, windowsHide: true }).on('error', () => {}).unref();
}

async function main() {
  const [command, arg] = process.argv.slice(2);
  switch (command) {
    case 'prompt': {
      const input = await readStdin();
      return recordStart(input.session_id, input.prompt);
    }
    case 'stop':
    case 'notification':
      return handle(command, await readStdin());
    case 'test': {
      const event = arg === 'notification' ? 'notification' : 'stop';
      await handle(event, { cwd: process.cwd(), message: 'Bash komutu için izin istiyor' }, { force: true });
      return console.log(`Test bildirimi gönderildi (${event}).`);
    }
    case 'install':
      return install();
    case 'uninstall':
      return uninstall();
    case 'config': {
      const file = ensureConfigFile();
      console.log(`Ayar dosyası: ${file}`);
      return openFile(file);
    }
    default:
      console.log(USAGE);
  }
}

// Hook asla Claude Code'u engellememeli: her durumda 0 ile çık.
main()
  .catch((err) => process.stderr.write(`claude-notify: ${err.message}\n`))
  .finally(() => (process.exitCode = 0));
