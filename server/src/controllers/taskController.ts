import type { RequestHandler } from 'express';
import { z } from 'zod';
import { Task, publicTask } from '../models/Task.js';
import { AppError } from '../middlewares/errors.js';

const taskFields = {
  title: z.string().trim().min(1, 'Escribe un título para la tarea.').max(120, 'El título admite hasta 120 caracteres.'),
  description: z.string().trim().max(2000, 'La descripción admite hasta 2000 caracteres.'),
  priority: z.enum(['low', 'medium', 'high'], { error: 'Selecciona una prioridad válida.' }),
  status: z.enum(['pending', 'completed'], { error: 'Selecciona un estado válido.' }),
};

const createSchema = z.object({
  ...taskFields,
  description: taskFields.description.default(''),
  priority: taskFields.priority.default('medium'),
  status: taskFields.status.default('pending'),
}).strict();
const updateSchema = z.object(taskFields).partial().strict()
  .refine((value) => Object.keys(value).length > 0, 'Envía al menos un campo para actualizar.');

export const listTasks: RequestHandler = async (req, res) => {
  const tasks = await Task.find({ user: req.auth!.userId }).sort({ createdAt: -1, _id: -1 });
  res.status(200).json({ success: true, data: { tasks: tasks.map(publicTask) } });
};

export const createTask: RequestHandler = async (req, res) => {
  const input = createSchema.parse(req.body);
  // El propietario proviene exclusivamente del JWT verificado.
  const task = await Task.create({ ...input, user: req.auth!.userId });
  res.status(201).json({ success: true, data: { task: publicTask(task) } });
};

export const getTask: RequestHandler = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.auth!.userId });
  if (!task) throw new AppError(404, 'No se encontró la tarea.');
  res.status(200).json({ success: true, data: { task: publicTask(task) } });
};

export const updateTask: RequestHandler = async (req, res) => {
  const input = updateSchema.parse(req.body);
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.auth!.userId },
    { $set: input },
    { new: true, runValidators: true },
  );
  if (!task) throw new AppError(404, 'No se encontró la tarea.');
  res.status(200).json({ success: true, data: { task: publicTask(task) } });
};

export const deleteTask: RequestHandler = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.auth!.userId });
  if (!task) throw new AppError(404, 'No se encontró la tarea.');
  res.status(200).json({ success: true, message: 'Tarea eliminada correctamente.' });
};
