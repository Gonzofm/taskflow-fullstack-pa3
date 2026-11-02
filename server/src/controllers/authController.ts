import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { AppConfig } from '../config/env.js';
import { AppError } from '../middlewares/errors.js';
import { JWT_AUDIENCE, JWT_ISSUER } from '../middlewares/auth.js';
import { User, publicUser } from '../models/User.js';

const email = z.email('Escribe un correo electrónico válido.').max(254).transform((value) => value.toLowerCase());
const emailInput = z.string().trim().pipe(email);
const password = z.string()
  .min(8, 'La contraseña debe tener al menos ocho caracteres.')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'La contraseña no puede superar 72 bytes.');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos dos caracteres.').max(80, 'El nombre admite hasta 80 caracteres.'),
  email: emailInput,
  password,
}).strict();

const loginSchema = z.object({
  email: emailInput,
  password: z.string().min(1, 'Escribe tu contraseña.').refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'La contraseña no puede superar 72 bytes.'),
}).strict();

export function createAuthController(config: AppConfig): {
  register: RequestHandler;
  login: RequestHandler;
  me: RequestHandler;
} {
  function tokenFor(userId: string): string {
    return jwt.sign({}, config.jwtSecret, {
      algorithm: 'HS256',
      subject: userId,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: config.jwtExpiresInSeconds,
    });
  }

  return {
    register: async (req, res) => {
      const input = registerSchema.parse(req.body);
      const hash = await bcrypt.hash(input.password, 12);
      const user = await User.create({ ...input, password: hash });
      res.status(201).json({ success: true, data: { user: publicUser(user), token: tokenFor(user.id) } });
    },
    login: async (req, res) => {
      const input = loginSchema.parse(req.body);
      const user = await User.findOne({ email: input.email }).select('+password');
      // Comparar también si el usuario no existe reduce diferencias de tiempo evidentes.
      const valid = await bcrypt.compare(input.password, user?.password ?? '$2b$12$BEHv5wceXlPrxL5OtOa3RuJbG9vWuHMSUcSmE7nTT4sPjb7f6bltG');
      if (!user || !valid) throw new AppError(401, 'El correo o la contraseña no son correctos.');
      res.status(200).json({ success: true, data: { user: publicUser(user), token: tokenFor(user.id) } });
    },
    me: async (req, res) => {
      const user = await User.findById(req.auth!.userId);
      if (!user) throw new AppError(401, 'La cuenta asociada a la sesión ya no existe.');
      res.status(200).json({ success: true, data: { user: publicUser(user) } });
    },
  };
}
