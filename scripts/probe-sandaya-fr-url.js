const https = require('https');

const urls = [
  'https://www.sandaya.fr/nos-campings?country=1',
  'https://www.sandaya.fr/nos-campings/france',
  'https://www.sandaya.fr/france/nos-campings',
  'https://www.sandaya.fr/nos-campings?destination=france'
];

function get(u) {
  return new Promise((resolve) => {
    https.get(
      u,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
      (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => resolve({ u, status: r.statusCode, len: d.length, hasItaly: /italie|toscane/i.test(d) }));
      }
    ).on('error', () => resolve({ u, err: true }));
  });
}

(async () => {
  for (const u of urls) {
    console.log(await get(u));
  }
})();
