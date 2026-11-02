import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import type { AppConfig } from './config/env.js';
import { authRoutes } from './routes/authRoutes.js';
import { taskRoutes } from './routes/taskRoutes.js';
import { AppError, errorHandler, notFound } from './middlewares/errors.js';

export function createApp(config: AppConfig): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      // Las herramientas CLI no envían Origin; CORS protege el acceso desde navegadores.
      if (!origin || origin === config.clientOrigin) callback(null, true);
      else callback(new AppError(403, 'Este origen no está autorizado para acceder a la API.'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 600,
  }));
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
      success: connected,
      ...(connected ? { data: { status: 'ok', database: 'connected' } } : { message: 'La base de datos no está disponible.' }),
    });
  });
  app.use('/api/auth', authRoutes(config));
  app.use('/api/tasks', taskRoutes(config));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
