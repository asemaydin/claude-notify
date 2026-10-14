const { spawnDetached } = require('./spawn');

async function notify({ title, body, sound }) {
  try {
    await spawnDetached('notify-send', ['--app-name=Claude Code', title, body]);
  } catch (err) {
    throw new Error(`notify-send bulunamadı (libnotify-bin paketini kur): ${err.message}`);
  }
  if (sound === 'none' || sound === false) return;
  // Ses isteğe bağlı: canberra yoksa sessizce geç.
  const id = !sound || sound === 'default' ? 'message-new-instant' : String(sound);
  await spawnDetached('canberra-gtk-play', ['-i', id]).catch(() => {});
}

module.exports = { notify };
