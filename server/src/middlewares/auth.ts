import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { AppError } from './errors.js';

export const JWT_ISSUER = 'taskflow-api';
export const JWT_AUDIENCE = 'taskflow-client';

export function authenticate(secret: string): RequestHandler {
  return async (req, _res, next) => {
    const authorization = req.get('authorization');
    if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
      throw new AppError(401, 'Debes iniciar sesión para continuar.');
    }
    const token = authorization.replace(/^Bearer\s+/i, '');
    let payload: string | jwt.JwtPayload;
    try {
      payload = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Tu sesión ha expirado. Inicia sesión nuevamente.');
      }
      throw new AppError(401, 'La sesión no es válida. Inicia sesión nuevamente.');
    }
    if (typeof payload === 'string' || !payload.sub || !mongoose.isObjectIdOrHexString(payload.sub)) {
      throw new AppError(401, 'La sesión no es válida. Inicia sesión nuevamente.');
    }
    const exists = await User.exists({ _id: payload.sub });
    if (!exists) throw new AppError(401, 'La cuenta asociada a la sesión ya no existe.');
    req.auth = { userId: payload.sub };
    next();
  };
}
