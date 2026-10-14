# claude-notify — Geliştirme Günlüğü

## 2026-10-14 — v1 yazıldı

### Ne yapıldı
- Sıfır bağımlılıklı Node.js CLI: `bin/notify.js` (komutlar: prompt, stop, notification, install, uninstall, config, test).
- Claude Code hook'larıyla çalışıyor: `UserPromptSubmit` (süre başlat), `Stop` (bitti), `Notification` (izin/girdi bekliyor).
- Masaüstü bildirimi: Windows (PowerShell 5.1 + WinRT toast), macOS (`osascript`), Linux (`notify-send`).
- Ek kanallar: ntfy (telefon) ve webhook (Discord/Slack) — ayarlarda kapalı.
- Özelleştirme: `~/.claude-notify.json` — şablonlar, ses, minimum süre, sessiz saatler, proje bazlı ayar.
- README.md yazıldı.

### Test edilenler (Windows)
- [x] `prompt` hook'u başlangıç zamanını ve prompt'u `%TEMP%\claude-notify\<session>.json`'a yazıyor
- [x] 20 sn altı `stop` → bildirim yok (beklenen)
- [x] Süre biçimi: `5sn`, `2dk 14sn`, `1sa 2dk`
- [x] install/uninstall settings.json kopyasında: tekrar çalıştırınca hook çoğalmıyor, `statusLine` korunuyor, uninstall orijinale dönüyor
- [x] `test stop` / `test notification` komutları hatasız çalıştı

### Henüz doğrulanmadı
- [ ] Windows toast bildirimleri ekranda gerçekten görünüyor mu? (komut hatasız çalıştı ama görsel olarak kontrol edilmedi)
- [ ] Gerçek ayarlara kurulum yapılmadı (`node bin/notify.js install` çalıştırılmadı)
- [ ] Gerçek Claude Code oturumunda uçtan uca test
- [ ] macOS ve Linux — bu makinede denenemedi
- [ ] ntfy ve webhook kanalları — hiç denenmedi
- [ ] `notification_type === 'idle_prompt'` alanının Claude Code'da gerçekten gelip gelmediği (yedek olarak mesaj metni de kontrol ediliyor)
- [x] Ayrı repo olarak ilk commit atıldı (henüz GitHub'a push edilmedi)

### Notlar
- Test sırasında Git Bash'te `echo` ile verilen JSON içindeki `\` ters eğik çizgileri bozuyor → geçersiz JSON. Elle test ederken yolları `C:/proje/...` şeklinde yaz.
- Windows'ta pwsh 7 değil `powershell.exe` kullanılıyor; WinRT tipleri sadece 5.1'de var.

### Sonraki adımlar (fikir)
- Pencere odaktaysa bildirim gösterme
- Ayarlar için küçük web arayüzü (`claude-notify ui`)
- Gönderilen bildirimleri bir log dosyasına yazma (hata ayıklama için)
