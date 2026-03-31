const https = require('https');

https.get(
  'https://www.sandaya.fr/nos-campings',
  { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120' } },
  (r) => {
    let d = '';
    r.on('data', (c) => (d += c));
    r.on('end', () => {
      const needles = [
        'NEXT_DATA',
        'graphql',
        'latitude',
        'sandaya',
        '/api/',
        'campings',
        'application/json'
      ];
      for (const n of needles) {
        const i = d.toLowerCase().indexOf(n.toLowerCase());
        console.log(n, i >= 0 ? i : '—');
      }
      const m = d.match(/\/_next\/static\/[^"']+\.js/g);
      console.log('next chunks sample', m ? m.slice(0, 5) : null);
      const m2 = d.match(/https:\/\/[^"'\s]+\/api\/[^"'\s]+/gi);
      console.log('absolute api', m2 ? [...new Set(m2)].slice(0, 15) : null);
    });
  }
).on('error', console.error);
