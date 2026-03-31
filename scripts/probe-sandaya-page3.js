const https = require('https');

https.get(
  'https://www.sandaya.fr/nos-campings',
  { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120' } },
  (r) => {
    let d = '';
    r.on('data', (c) => (d += c));
    r.on('end', () => {
      const i = d.indexOf('latitude');
      console.log(d.slice(Math.max(0, i - 200), i + 400));
    });
  }
).on('error', console.error);
