const { spawn } = require('child_process');

// Bildirim sürecini arka planda başlatır; hook'un hızlıca bitebilmesi için beklemez.
// Windows'ta alt süreçler ebeveynden bağımsız yaşadığı için detached gerekmez (pencere de açmaz).
function spawnDetached(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'ignore',
      windowsHide: true,
      detached: process.platform !== 'win32',
    });
    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
}

module.exports = { spawnDetached };
