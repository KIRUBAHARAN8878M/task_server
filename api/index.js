import app from '../src/server.js';
import { createServer } from 'http';

export default function handler(req, res) {
  // Patch: remove /api prefix before handing to Express
  if (req.url === '/api' || req.url === '/api/') {
    req.url = '/';
  } else if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }

  return createServer(app).emit('request', req, res);
}
