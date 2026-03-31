const https = require('https');

https.get(
  'https://www.sandaya.fr/nos-campings',
  { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; map-bot/1.0)' } },
  (r) => {
    let d = '';
    r.on('data', (c) => (d += c));
    r.on('end', () => {
      console.log('status', r.statusCode, 'len', d.length);
      const idx = d.indexOf('__NEXT_DATA__');
      console.log('__NEXT_DATA__', idx);
      if (idx >= 0) {
        const s = d.indexOf('>', idx) + 1;
        const e = d.indexOf('</script>', s);
        const json = d.slice(s, e);
        try {
          const o = JSON.parse(json);
          const keys = Object.keys(o);
          console.log('next keys', keys);
          const p = o.props && o.props.pageProps;
          console.log('pageProps keys', p && Object.keys(p));
          if (p) {
            const str = JSON.stringify(p).slice(0, 2000);
            console.log('pageProps sample', str);
          }
        } catch (err) {
          console.error('parse err', err.message);
        }
      }
      const api = d.match(/api\.[a-z0-9.-]+\.[a-z]{2,}/gi);
      console.log('api hosts', api && [...new Set(api)].slice(0, 20));
    });
  }
).on('error', console.error);
