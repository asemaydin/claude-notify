const notifiers = {
  win32: () => require('./windows'),
  darwin: () => require('./macos'),
  linux: () => require('./linux'),
};

function send(message, config) {
  if (!config.channels.desktop) return;
  const load = notifiers[process.platform];
  if (!load) throw new Error(`Masaüstü bildirimi bu platformda desteklenmiyor: ${process.platform}`);
  return load().notify(message);
}

module.exports = { name: 'desktop', send };
