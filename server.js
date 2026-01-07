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
  const url = "https://www.tcmb.gov.tr/kurlar/today.xml";

  https.get(url, (response) => {
    let data = "";

    response.on("data", chunk => {
      data += chunk;
    });

    response.on("end", () => {
      const usdMatch = data.match(
        /<Currency Code="USD">[\s\S]*?<ForexBuying>(.*?)<\/ForexBuying>/
      );
      const eurMatch = data.match(
        /<Currency Code="EUR">[\s\S]*?<ForexBuying>(.*?)<\/ForexBuying>/
      );

      if (!usdMatch || !eurMatch) {
        return res.status(500).json({ hata: "Döviz verisi alınamadı" });
      }

      res.json({
        tarih: new Date().toLocaleString("tr-TR"),
        USD: parseFloat(usdMatch[1]),
        EUR: parseFloat(eurMatch[1])
      });
    });
  }).on("error", () => {
    res.status(500).json({ hata: "TCMB bağlantı hatası" });
  });
});

/**
 * Server start
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Sunucu çalışıyor:", PORT);
});
