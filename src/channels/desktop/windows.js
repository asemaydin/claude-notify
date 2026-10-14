const { spawnDetached } = require('./spawn');

// PowerShell'in kayıtlı AppUserModelID'si; ayrı bir uygulama kaydı gerektirmeden toast göstermeyi sağlar.
const APP_ID = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe';

function escapeXml(text) {
  return String(text).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
}

function audioTag(sound) {
  if (sound === 'none' || sound === false) return '<audio silent="true"/>';
  if (!sound || sound === 'default') return '<audio src="ms-winsoundevent:Notification.Default"/>';
  return `<audio src="${escapeXml(sound)}"/>`;
}

function notify({ title, body, sound }) {
  const xml =
    '<toast><visual><binding template="ToastGeneric">' +
    `<text>${escapeXml(title)}</text><text>${escapeXml(body)}</text>` +
    `</binding></visual>${audioTag(sound)}</toast>`;

  // Kullanıcı metni betiğe base64 olarak girer, böylece PowerShell enjeksiyonu mümkün olmaz.
  const xmlB64 = Buffer.from(xml, 'utf8').toString('base64');
  const script = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null
$doc = New-Object Windows.Data.Xml.Dom.XmlDocument
$doc.LoadXml([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${xmlB64}')))
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('${APP_ID}').Show([Windows.UI.Notifications.ToastNotification]::new($doc))
`;
  const encoded = Buffer.from(script, 'utf16le').toString('base64');
  // WinRT tipleri yalnızca Windows PowerShell 5.1'de var (pwsh 7'de yok), o yüzden powershell.exe.
  return spawnDetached('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-EncodedCommand', encoded]);
}

module.exports = { notify };
