import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'La ruta solicitada no existe.'));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Revisa los datos enviados.',
      errors: error.issues.map((issue) => ({ field: issue.path.join('.') || 'body', message: issue.message })),
    });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: 'Los datos no cumplen las validaciones del modelo.' });
    return;
  }
  if (error instanceof Error && 'code' in error && error.code === 11000) {
    res.status(400).json({ success: false, message: 'Ya existe una cuenta con este correo electrónico.' });
    return;
  }
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ success: false, message: 'El cuerpo de la solicitud debe contener JSON válido.' });
    return;
  }
  if (error instanceof URIError) {
    res.status(400).json({ success: false, message: 'La dirección de la solicitud no tiene un formato válido.' });
    return;
  }
  if (error instanceof Error && 'type' in error && error.type === 'entity.too.large') {
    res.status(413).json({ success: false, message: 'La solicitud supera el tamaño permitido.' });
    return;
  }
  // No imprimir el objeto error: puede contener credenciales, cuerpos o URIs.
  console.error('Error interno de la API.');
  res.status(500).json({ success: false, message: 'Ocurrió un error interno. Inténtalo nuevamente.' });
};
