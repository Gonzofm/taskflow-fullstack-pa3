import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'mysql2/promise';
import type { SqlConfig } from './config/env.js';
import { checkDatabase } from './config/database.js';
import { catalogRoutes } from './routes/catalogRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { taskRoutes } from './routes/taskRoutes.js';
import { AppError, errorHandler, notFound } from './middlewares/errors.js';

export function createSqlApp(database: Pool, config: SqlConfig): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || origin === config.clientOrigin) callback(null, true);
      else callback(new AppError(403, 'Este origen no está autorizado para acceder a la API.'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 600,
  }));
  app.use(express.json({ limit: '16kb' }));
  app.use('/images', express.static(fileURLToPath(new URL('../../public/images/', import.meta.url)), { dotfiles: 'deny', maxAge: '1d', index: false }));
  app.get('/', (_req, res) => res.json({ success: true, data: { name: 'TaskFlow API', database: 'MariaDB / MySQL', endpoints: ['/api/health', '/api/integrantes', '/api/categorias', '/api/plantillas', '/api/plantillas/categoria/1', '/api/plantillas/1'] } }));
  app.get('/api/health', async (_req, res) => {
    try {
      await checkDatabase(database);
      res.json({ success: true, data: { status: 'ok', database: 'connected', engine: 'mysql' } });
    } catch {
      res.status(503).json({ success: false, message: 'La base de datos no está disponible.' });
    }
  });
  app.use('/api', catalogRoutes(database, config.apiPublicUrl));
  app.use('/api/auth', authRoutes(database, config));
  app.use('/api/tasks', taskRoutes(database, config));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
