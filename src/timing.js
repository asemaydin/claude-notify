const fs = require('fs');
const os = require('os');
const path = require('path');

// UserPromptSubmit anında başlangıç zamanını ve prompt'u oturum bazında saklar.
const DIR = path.join(os.tmpdir(), 'claude-notify');

function fileFor(sessionId) {
  return path.join(DIR, `${String(sessionId || 'default').replace(/[^\w-]/g, '_')}.json`);
}

function recordStart(sessionId, prompt) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(fileFor(sessionId), JSON.stringify({ start: Date.now(), prompt: prompt || '' }));
}

// { seconds, prompt } döner; kayıt yoksa seconds null olur.
function readStart(sessionId) {
  try {
    const data = JSON.parse(fs.readFileSync(fileFor(sessionId), 'utf8'));
    return { seconds: (Date.now() - data.start) / 1000, prompt: data.prompt };
  } catch {
    return { seconds: null, prompt: '' };
  }
}

module.exports = { recordStart, readStart };
