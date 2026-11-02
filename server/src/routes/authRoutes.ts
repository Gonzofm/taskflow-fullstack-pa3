import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { AppConfig } from '../config/env.js';
import { createAuthController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

export function authRoutes(config: AppConfig): Router {
  const router = Router();
  const controller = createAuthController(config);
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.authRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados intentos. Inténtalo nuevamente en quince minutos.' },
  });
  router.post('/register', authLimiter, controller.register);
  router.post('/login', authLimiter, controller.login);
  router.get('/me', authenticate(config.jwtSecret), controller.me);
  return router;
}
