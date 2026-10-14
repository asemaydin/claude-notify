const { spawnDetached } = require('./spawn');

// Metinler AppleScript'e argv olarak verilir; betiğin içine gömülmediği için kaçış sorunu olmaz.
function notify({ title, body, sound }) {
  const silent = sound === 'none' || sound === false;
  const soundName = !sound || sound === 'default' ? 'Glass' : sound;
  const line = silent
    ? 'display notification (item 2 of argv) with title (item 1 of argv)'
    : 'display notification (item 2 of argv) with title (item 1 of argv) sound name (item 3 of argv)';
  return spawnDetached('osascript', ['-e', 'on run argv', '-e', line, '-e', 'end run', title, body, String(soundName)]);
}

module.exports = { notify };
