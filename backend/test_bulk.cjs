const http = require('http');

const data = JSON.stringify({ ids: [672] });
const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/api/category-data/br-residential/bulk-delete',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});
req.write(data);
req.end();
