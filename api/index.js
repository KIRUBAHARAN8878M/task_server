import app from '../src/server.js';
import { createServer } from 'http';

export default function handler(req, res) {
  // Patch for Vercel's weird behavior with trailing slashes
  if (req.url === '/api' || req.url === '/api/') {
    req.url = '/';
  }

  return createServer(app).emit('request', req, res);
}
