import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import { notFound, errorHandler } from './middlewares/error.js';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'https://task-client-nu.vercel.app',
  'http://localhost:5173',
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

// ✅ Routes
app.get('/', (req, res) => {
  res.send('✅ Backend deployed successfully');
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

// ✅ Vercel doesn't use app.listen() — so only run this locally:
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(env.PORT, () => {
      console.log(`API running at http://localhost:${env.PORT}`);
    });
  });
} else {
  connectDB().then(() => console.log('✅ DB Connected (Serverless)'));
}

export default app;
