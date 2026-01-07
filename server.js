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
app.get("/api/doviz", async (req, res) => {
  try {
    const url = "https://api.allorigins.win/raw?url=https://www.google.com/finance/quote/USD-TRY";

    https.get(url, (response) => {
      let data = "";

      response.on("data", chunk => data += chunk);

      response.on("end", () => {
        const usdMatch = data.match(/data-last-price="([\d.,]+)"/);

        const urlEur = "https://api.allorigins.win/raw?url=https://www.google.com/finance/quote/EUR-TRY";

        https.get(urlEur, (res2) => {
          let data2 = "";

          res2.on("data", c => data2 += c);
          res2.on("end", () => {
            const eurMatch = data2.match(/data-last-price="([\d.,]+)"/);

            if (!usdMatch || !eurMatch) {
              return res.status(500).json({ hata: "Google verisi okunamadı" });
            }

            res.json({
              tarih: new Date().toLocaleString("tr-TR"),
              USD: parseFloat(usdMatch[1].replace(",", ".")),
              EUR: parseFloat(eurMatch[1].replace(",", "."))
            });
          });
        });
      });
    });

  } catch (err) {
    res.status(500).json({ hata: "Google Finance hatası" });
  }
});



/**
 * Server start
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Sunucu çalışıyor:", PORT);
});
