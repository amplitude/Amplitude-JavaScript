const express = require('express');
const https = require('https');
const fs = require('fs');

const port = 9000;
const httpsPort = 9001;

const app = express();
app.post('/test2.html', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(fs.readFileSync(__dirname + '/test2.html'));
});
app.use(express.static(__dirname + '/../..'));
app.use(express.static(__dirname));

app.listen(port);
console.log(`Listening on http://localhost:${port}`);

if (!!process.env.USE_SSL) {
  const options = {
    key: fs.readFileSync(`${__dirname}/wildcard.amplidev.com.key`),
    cert: fs.readFileSync(`${__dirname}/wildcard.amplidev.com.crt`),
  };
  https.createServer(options, app).listen(httpsPort);
  console.log(`Listening with https on port ${httpsPort}...`);
}
