// import app from '../src/server.js';
// import { createServer } from 'http';

// export default function handler(req, res) {
//   const url = req.url || '';

//   // Strip only the `/api` prefix once
//   if (url.startsWith('/api/')) {
//     req.url = url.replace(/^\/api/, '') || '/';
//   } else if (url === '/api') {
//     req.url = '/';
//   }

//   return createServer(app).emit('request', req, res);
// }
// api/index.js
import app from '../src/server.js';
export default app;
