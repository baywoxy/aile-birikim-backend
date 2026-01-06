const express = require("express");
const https = require("https");

const app = express();

/**
 * TCMB Döviz Verisi
 */
app.get("/api/doviz", (req, res) => {
  const url = "https://www.tcmb.gov.tr/kurlar/today.xml";

  https.get(url, (response) => {
    let data = "";

    response.on("data", chunk => {
      data += chunk;
    });

    response.on("end", () => {
      const usd = data.match(/<Currency Code="USD"[\s\S]*?<ForexSelling>(.*?)<\/ForexSelling>/);
      const eur = data.match(/<Currency Code="EUR"[\s\S]*?<ForexSelling>(.*?)<\/ForexSelling>/);


      if (!usd || !eur) {
        return res.status(500).json({ hata: "Döviz verisi alınamadı" });
      }

      res.json({
        tarih: new Date().toLocaleString("tr-TR"),
        USD: parseFloat(usd[1]),
        EUR: parseFloat(eur[1])
      });
    });
  }).on("error", () => {
    res.status(500).json({ hata: "TCMB bağlantı hatası" });
  });
});

/**
 * Sağlık kontrolü
 */
app.get("/api/status", (req, res) => {
  res.json({
    durum: "Backend çalışıyor",
    zaman: new Date().toLocaleString("tr-TR")
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Sunucu çalışıyor:", PORT);
});
