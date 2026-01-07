const express = require("express");
const https = require("https");

const app = express();

/**
 * Sağlık kontrolü
 */
app.get("/api/status", (req, res) => {
  res.json({
    durum: "Backend çalışıyor",
    zaman: new Date().toLocaleString("tr-TR")
  });
});

app.get("/api/doviz", (req, res) => {
  const url = "https://api.frankfurter.app/latest?from=TRY&to=USD,EUR";

  https.get(url, (response) => {
    let data = "";

    response.on("data", chunk => data += chunk);

    response.on("end", () => {
      try {
        const json = JSON.parse(data);

        if (!json.rates || !json.rates.USD || !json.rates.EUR) {
          return res.status(500).json({ hata: "Döviz verisi alınamadı" });
        }

        // TRY → USD/EUR ters gelir, biz TL karşılığını istiyoruz
        const usd = (1 / json.rates.USD).toFixed(4);
        const eur = (1 / json.rates.EUR).toFixed(4);

        res.json({
          tarih: new Date().toLocaleString("tr-TR"),
          USD: parseFloat(usd),
          EUR: parseFloat(eur)
        });
      } catch (e) {
        res.status(500).json({ hata: "JSON parse hatası" });
      }
    });
  }).on("error", () => {
    res.status(500).json({ hata: "Frankfurter API bağlantı hatası" });
  });
});



app.get("/api/altin", (req, res) => {
  const ons = parseFloat(req.query.ons);
  const fire = parseFloat(req.query.fire || 0.01);

  if (!ons || ons <= 0) {
    return res.status(400).json({ hata: "Ons değeri girilmedi" });
  }

  const url = "https://api.frankfurter.app/latest?from=TRY&to=USD";

  https.get(url, (response) => {
    let data = "";

    response.on("data", chunk => data += chunk);

    response.on("end", () => {
      try {
        const json = JSON.parse(data);
        const usdTry = 1 / json.rates.USD;

        const gram = (ons * usdTry) / 31.1035;
        const hurdaNet = gram * (1 - fire);

        res.json({
          ons_usd: ons,
          usd_try: parseFloat(usdTry.toFixed(4)),
          gram_altin: parseFloat(gram.toFixed(2)),
          fire_orani: fire,
          hurda_net: parseFloat(hurdaNet.toFixed(2)),
          tarih: new Date().toLocaleString("tr-TR")
        });
      } catch (e) {
        res.status(500).json({ hata: "Altın hesaplama hatası" });
      }
    });
  });
});


/**
 * Server start
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Sunucu çalışıyor:", PORT);
});
