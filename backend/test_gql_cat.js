const http = require('http');

const query = JSON.stringify({
  query: `{ categoriesByRootSlug(rootSlug: "location-1-4") { id slug nameEn breadcrumb depth } }`
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(query)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.errors) {
        console.log('ERRORS:', JSON.stringify(parsed.errors, null, 2));
      } else {
        const cats = parsed.data?.categoriesByRootSlug || [];
        console.log(`SUCCESS: ${cats.length} categories returned`);
        cats.slice(0, 10).forEach(c => {
          console.log(`  [${c.depth}] ${c.nameEn} (${c.slug})`);
        });
      }
    } catch(e) {
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', e => console.log('Error:', e.message));
req.write(query);
req.end();
