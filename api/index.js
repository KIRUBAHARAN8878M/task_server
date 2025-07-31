import app from '../src/server.js';
import { createServer } from 'http';

export default function handler(req, res) {
  // Strip "/api" from URL before passing to Express
  const url = req.url || '';
  if (url.startsWith('/api/')) {
    req.url = url.replace(/^\/api/, '') || '/';
  } else if (url === '/api') {
    req.url = '/';
  }

  return createServer(app).emit('request', req, res);
}
