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

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      'https://task-client-nu.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

//  No '/api' prefix here – Vercel adds it
app.get('/', (req, res) => {
  res.send('✅ Backend deployed successfully');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

// Connect DB once
connectDB().then(() => console.log(' DB connected'));

// Export the app for Vercel


// Optional: local dev server when not on Vercel
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  const port = env.PORT || 3001;
  app.listen(port, () => console.log(`API local on :${port}`));
}
export default app;