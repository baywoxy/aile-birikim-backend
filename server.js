const express = require("express");
const app = express();

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
