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

// -------------------- Security & Basic Middleware --------------------
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// -------------------- Improved Dynamic CORS --------------------
const allowedOrigins = [
  'https://task-client-nu.vercel.app', // Your deployed frontend
  'http://localhost:5173',
  'http://localhost:5174',
  // Add your custom domain here if you start using one, e.g.:
  // 'https://your-custom-domain.com'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow REST tools or same-origin requests with no Origin
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
  })
);

// Handle preflight requests for all routes
app.options('*', cors());

// -------------------- Rate Limiting --------------------
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

// -------------------- Health & Base Routes --------------------
app.get('/', (req, res) => {
  res.send('✅ Backend deployed successfully');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'ok' });
});

// -------------------- Feature Routes --------------------
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);


// -------------------- Error Handlers --------------------
app.use(notFound);
app.use(errorHandler);

// -------------------- MongoDB Connection --------------------
// Cache DB connection in serverless to avoid reconnect loops
let dbConnected = false;
async function initDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log('✅ DB connected');
  }
}
initDB();

// -------------------- Local Dev vs Vercel Export --------------------

// Local dev only: listen on a port
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  const port = env.PORT || 3001;
  app.listen(port, () => console.log(`🚀 API running locally on :${port}`));
}

// Vercel requires export of the app as default
export default app;
