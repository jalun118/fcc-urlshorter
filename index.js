require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const dataUrl = [];

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;

  try {
    const newUrl = new URL(url);

    dns.lookup(newUrl.hostname, (err) => {
      if (err) {
        res.json({
          error: "invalid url"
        });
      } else {
        const len = dataUrl.length;

        dataUrl.push({
          dest: newUrl,
          alias: len
        });

        res.json({ original_url: url, short_url: len });
      }
    });
  } catch {
    return res.json({
      error: "invalid url"
    });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const { short_url } = req.params;

  const data = dataUrl.find(v => v.alias === parseInt(short_url));
  if (!data) {
    return res.json({
      error: "invalid url"
    });
  }

  return res.redirect(data.dest);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
