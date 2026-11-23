import type { RequestHandler } from 'express';
import type { Pool } from 'mysql2/promise';
import { z } from 'zod';
import { AppError } from '../middlewares/errors.js';
import { createTaskModel, publicTask } from '../models/taskModel.js';

const fields = {
  title: z.string().trim().min(1, 'Escribe un título para la tarea.').max(120),
  description: z.string().trim().max(2000),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'completed']),
};
const createSchema = z.object({ ...fields, description: fields.description.default(''), priority: fields.priority.default('medium'), status: fields.status.default('pending') }).strict();
const updateSchema = z.object(fields).partial().strict().refine((value) => Object.keys(value).length > 0, 'Envía al menos un campo para actualizar.');

export function createTaskController(database: Pool): { list: RequestHandler; create: RequestHandler; get: RequestHandler; update: RequestHandler; remove: RequestHandler } {
  const tasks = createTaskModel(database);
  return {
    list: async (req, res) => res.json({ success: true, data: { tasks: (await tasks.list(req.auth!.userId)).map(publicTask) } }),
    create: async (req, res) => {
      const task = await tasks.create(req.auth!.userId, createSchema.parse(req.body));
      res.status(201).json({ success: true, data: { task: publicTask(task) } });
    },
    get: async (req, res) => {
      const task = await tasks.byId(String(req.params.id), req.auth!.userId);
      if (!task) throw new AppError(404, 'No se encontró la tarea.');
      res.json({ success: true, data: { task: publicTask(task) } });
    },
    update: async (req, res) => {
      const task = await tasks.update(String(req.params.id), req.auth!.userId, updateSchema.parse(req.body));
      if (!task) throw new AppError(404, 'No se encontró la tarea.');
      res.json({ success: true, data: { task: publicTask(task) } });
    },
    remove: async (req, res) => {
      if (!(await tasks.remove(String(req.params.id), req.auth!.userId))) throw new AppError(404, 'No se encontró la tarea.');
      res.json({ success: true, message: 'Tarea eliminada correctamente.' });
    },
  };
}
