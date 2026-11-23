import type { RequestHandler } from 'express';
import { AppError } from './errors.js';

export const validateNumericId: RequestHandler = (req, _res, next) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !/^[1-9]\d{0,9}$/.test(id) || Number(id) > 4294967295) {
    throw new AppError(400, 'El identificador debe ser un entero positivo válido.');
  }
  next();
};

export const validateTaskId: RequestHandler = (req, _res, next) => {
  if (typeof req.params.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) {
    throw new AppError(400, 'El identificador de tarea no es válido.');
  }
  next();
};
