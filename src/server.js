import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();

// ----- Base middleware -----
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// ----- CORS (global) -----
const allowedOrigins = [
  'https://task-client-nu.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));           // let CORS set headers
app.use((req, res, next) => {                  // ensure 204 for all preflights
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ----- Rate limit AFTER preflight is handled -----
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ----- Health & base -----
app.get('/', (_req, res) => res.send('✅ Backend deployed successfully'));
app.get('/health', (_req, res) => res.json({ message: 'ok' }));

// ----- Routes (NO /api prefix here) -----
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);

// ----- Errors -----
app.use(notFound);
app.use(errorHandler);

// ----- DB connect (cache for serverless) -----
let dbConnected = false;
async function initDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log('✅ DB connected');
  }
}
initDB();

// ----- Local dev only -----
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  const port = env.PORT || 3001;
  app.listen(port, () => console.log(`🚀 Local API on http://localhost:${port}`));
}

export default app;
