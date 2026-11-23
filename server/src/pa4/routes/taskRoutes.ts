import { Router } from 'express';
import type { Pool } from 'mysql2/promise';
import type { SqlConfig } from '../config/env.js';
import { createTaskController } from '../controllers/taskController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateTaskId } from '../middlewares/validateId.js';

export function taskRoutes(database: Pool, config: SqlConfig): Router {
  const router = Router();
  const controller = createTaskController(database);
  router.use(authenticate(database, config.jwtSecret));
  router.route('/').get(controller.list).post(controller.create);
  router.route('/:id').all(validateTaskId).get(controller.get).put(controller.update).delete(controller.remove);
  return router;
}
