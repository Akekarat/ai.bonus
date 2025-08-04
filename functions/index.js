const functions = require('firebase-functions');
const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { distDir: '.next' } });
const handle = app.getRequestHandler();

exports.nextjsFunc = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
