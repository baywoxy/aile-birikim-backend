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

/**
 * TCMB Döviz (USD / EUR) – ForexBuying
 */
app.get("/api/doviz", (req, res) => {
  const url = "https://api.exchangerate.host/latest?base=TRY&symbols=USD,EUR";

  https.get(url, (response) => {
    let data = "";

    response.on("data", chunk => {
      data += chunk;
    });

    response.on("end", () => {
      try {
        const json = JSON.parse(data);

        if (!json.rates || !json.rates.USD || !json.rates.EUR) {
          return res.status(500).json({ hata: "Döviz verisi alınamadı" });
        }

        res.json({
          tarih: new Date().toLocaleString("tr-TR"),
          USD: parseFloat((1 / json.rates.USD).toFixed(4)),
          EUR: parseFloat((1 / json.rates.EUR).toFixed(4))
        });
      } catch (err) {
        res.status(500).json({ hata: "JSON parse hatası" });
      }
    });
  }).on("error", () => {
    res.status(500).json({ hata: "Döviz API bağlantı hatası" });
  });
});


/**
 * Server start
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Sunucu çalışıyor:", PORT);
});
