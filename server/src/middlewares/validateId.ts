import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from './errors.js';

export const validateTaskId: RequestHandler = (req, _res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    throw new AppError(400, 'El identificador de la tarea no es válido.');
  }
  next();
};
