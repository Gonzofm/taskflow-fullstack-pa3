import type { RequestHandler } from 'express';
import type { Pool } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { AppError } from './errors.js';
import { createUserModel } from '../models/userModel.js';

export const JWT_ISSUER = 'taskflow-api';
export const JWT_AUDIENCE = 'taskflow-client';

export function authenticate(database: Pool, secret: string): RequestHandler {
  const users = createUserModel(database);
  return async (req, _res, next) => {
    const authorization = req.get('authorization');
    if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) throw new AppError(401, 'Debes iniciar sesión para continuar.');
    let payload: string | jwt.JwtPayload;
    try {
      payload = jwt.verify(authorization.replace(/^Bearer\s+/i, ''), secret, { algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw new AppError(401, 'Tu sesión ha expirado. Inicia sesión nuevamente.');
      throw new AppError(401, 'La sesión no es válida. Inicia sesión nuevamente.');
    }
    if (typeof payload === 'string' || !payload.sub || !/^[0-9a-f-]{36}$/i.test(payload.sub)) throw new AppError(401, 'La sesión no es válida. Inicia sesión nuevamente.');
    if (!(await users.byId(payload.sub))) throw new AppError(401, 'La cuenta asociada a la sesión ya no existe.');
    req.auth = { userId: payload.sub };
    next();
  };
}
