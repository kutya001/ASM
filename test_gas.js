const https = require('https');
const GAS_URL = "https://script.google.com/macros/s/AKfycbwohflNTW3z1cknnf80XAEhmavcITwdt9PYSUEq6EJP-2EmsxHiRBNvcUSGJ_i-cu-4/exec";

const data = JSON.stringify({ action: "getUsernames" });

const req = https.request(GAS_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", body.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.write(data);
req.end();
