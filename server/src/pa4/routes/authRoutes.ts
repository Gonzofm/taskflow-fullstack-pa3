import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { Pool } from 'mysql2/promise';
import type { SqlConfig } from '../config/env.js';
import { createAuthController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

export function authRoutes(database: Pool, config: SqlConfig): Router {
  const router = Router();
  const controller = createAuthController(database, config);
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: config.authRateLimitMax, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Demasiados intentos. Inténtalo nuevamente en quince minutos.' } });
  router.post('/register', limiter, controller.register);
  router.post('/login', limiter, controller.login);
  router.get('/me', authenticate(database, config.jwtSecret), controller.me);
  return router;
}
