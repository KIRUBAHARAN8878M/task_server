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

// -------------------- Middleware --------------------
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// -------------------- CORRECT CORS HANDLING --------------------
const allowedOrigins = [
  'https://task-client-nu.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

const corsOptions = {
  origin: function (origin, callback) {
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
// ✅ This MUST come after `app.use(cors(...))`
app.options('*', cors(corsOptions));

// -------------------- Rate Limit --------------------
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// -------------------- Routes --------------------
app.get('/', (req, res) => {
  res.send('✅ Backend deployed successfully');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'ok' });
});

// ✅ All APIs WITHOUT /api prefix
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);


// -------------------- Error Handlers --------------------
app.use(notFound);
app.use(errorHandler);

// -------------------- DB Connect --------------------
let dbConnected = false;
async function initDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log('✅ DB connected');
  }
}
initDB();

// -------------------- Dev Server --------------------
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  const port = env.PORT || 3001;
  app.listen(port, () => console.log(`🚀 Local API running on http://localhost:${port}`));
}

// -------------------- Vercel Export --------------------
export default app;
