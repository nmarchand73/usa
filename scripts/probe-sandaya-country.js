const https = require('https');

https.get(
  'https://www.sandaya.fr/nos-campings',
  { headers: { 'User-Agent': 'Mozilla/5.0' } },
  (r) => {
    let d = '';
    r.on('data', (c) => (d += c));
    r.on('end', () => {
      const idx = d.indexOf('data-country');
      console.log('first data-country', idx);
      if (idx >= 0) console.log(d.slice(idx, idx + 120));
      const all = d.match(/data-[a-z-]+=/gi);
      const uniq = [...new Set(all || [])].sort();
      console.log('data- attrs sample', uniq.filter((x) => x.includes('country') || x.includes('pays')).slice(0, 30));
    });
  }
);
