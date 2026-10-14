// Yeni kanal eklemek için: bu klasöre { name, send(message, config) } dışa aktaran bir dosya koy ve buraya ekle.
const channels = [require('./desktop'), require('./ntfy'), require('./webhook')];

// Kanallar birbirini beklemez; biri hata verirse diğerleri yine gönderilir.
async function dispatch(message, config) {
  const results = await Promise.allSettled(channels.map((c) => c.send(message, config)));
  results.forEach((r, i) => {
    if (r.status === 'rejected') process.stderr.write(`claude-notify [${channels[i].name}]: ${r.reason.message}\n`);
  });
}

module.exports = { dispatch };
