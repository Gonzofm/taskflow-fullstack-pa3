import { Router } from 'express';
import type { AppConfig } from '../config/env.js';
import { authenticate } from '../middlewares/auth.js';
import { validateTaskId } from '../middlewares/validateId.js';
import { createTask, deleteTask, getTask, listTasks, updateTask } from '../controllers/taskController.js';

export function taskRoutes(config: AppConfig): Router {
  const router = Router();
  router.use(authenticate(config.jwtSecret));
  router.route('/').get(listTasks).post(createTask);
  router.route('/:id').all(validateTaskId).get(getTask).put(updateTask).delete(deleteTask);
  return router;
}
