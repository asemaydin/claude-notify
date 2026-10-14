# claude-notify

Claude Code bir prompt'u bitirdiğinde veya senden izin/girdi beklediğinde bildirim gönderir.
Windows, macOS ve Linux'ta çalışır; Node.js 18+ dışında hiçbir bağımlılığı yok.

## Kurulum

```sh
node bin/notify.js install     # hook'ları ~/.claude/settings.json'a ekler (yedek: settings.json.bak)
node bin/notify.js test        # örnek bildirim
```

Kurulumdan sonra açık Claude Code oturumlarını yeniden başlat. Kaldırmak için: `node bin/notify.js uninstall`.

Gereksinimler:
- **Windows 10/11:** ek bir şey gerekmez (Windows PowerShell 5.1 kullanılır).
- **macOS:** ilk bildirimde "Script Editor" için bildirim izni vermen gerekebilir.
- **Linux:** `notify-send` (`sudo apt install libnotify-bin`); ses için isteğe bağlı `canberra-gtk-play`.

## Nasıl çalışır

Claude Code'un hook'larını kullanır, arka planda sürekli çalışan bir şey yoktur:

| Hook | Komut | Ne yapar |
|---|---|---|
| `UserPromptSubmit` | `prompt` | Başlangıç zamanını ve prompt'u kaydeder |
| `Stop` | `stop` | Süre `minDurationSeconds`'tan uzunsa "bitti" bildirimi |
| `Notification` | `notification` | İzin/girdi bekleniyor bildirimi |

## Özelleştirme

`node bin/notify.js config` ayar dosyasını (`~/.claude-notify.json`) oluşturur ve açar.
Yalnızca değiştirmek istediğin alanları yazman yeterli; gerisi varsayılan kalır.

```json
{
  "events": {
    "stop": {
      "enabled": true,
      "title": "Claude Code ✓",
      "body": "{project} — {duration} sürdü",
      "sound": "default",
      "minDurationSeconds": 20
    },
    "notification": {
      "enabled": true,
      "title": "Claude seni bekliyor",
      "body": "{project}: {message}",
      "sound": "default",
      "ignoreIdle": true
    }
  },
  "quietHours": { "enabled": false, "from": "23:00", "to": "08:00" },
  "channels": {
    "desktop": true,
    "ntfy": { "enabled": false, "server": "https://ntfy.sh", "topic": "" },
    "webhook": { "enabled": false, "url": "" }
  },
  "projects": {
    "my-project": { "events": { "stop": { "minDurationSeconds": 0 } } }
  }
}
```

- **Şablon değişkenleri:** `{project}` (klasör adı), `{cwd}`, `{duration}`, `{message}`, `{prompt}` (ilk 60 karakter), `{time}`
- **Ses:** `"default"`, `"none"` veya platforma özgü ad: macOS `"Glass"`, `"Ping"`…; Windows `"ms-winsoundevent:Notification.Reminder"`, `"ms-winsoundevent:Notification.Looping.Alarm"`…; Linux freedesktop ses kimliği (`"complete"`).
- **ignoreIdle:** Claude'un "60 sn'dir girdi bekliyorum" hatırlatmasını atlar (Stop bildirimi zaten geldiği için).
- **quietHours:** bu aralıkta hiçbir kanal bildirim göndermez.
- **projects:** klasör adına göre ayarları ezer.

### Telefona bildirim (ntfy)
1. Telefona [ntfy](https://ntfy.sh) uygulamasını kur, tahmin edilmesi zor bir topic'e abone ol (ör. `claude-a8f3k2x`).
2. Ayarlarda `"ntfy": { "enabled": true, "topic": "claude-a8f3k2x" }`.

### Discord / Slack (webhook)
`"webhook": { "enabled": true, "url": "<webhook adresi>" }` — Discord `content`, Slack `text` alanını okur.

### Yeni kanal eklemek
`src/channels/` altına `{ name, send(message, config) }` dışa aktaran bir dosya koy ve `src/channels/index.js`'e ekle.
