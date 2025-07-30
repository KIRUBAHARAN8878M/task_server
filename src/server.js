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
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true
}));
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }); // 300 requests / 15 min per IP
app.use(limiter);
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.PORT, () => console.log(`API on :${env.PORT}`));
});
