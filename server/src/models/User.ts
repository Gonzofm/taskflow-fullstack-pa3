import { Schema, model, type HydratedDocument } from 'mongoose';
import type { PublicUser } from '../types/entities.js';

export interface UserFields {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserFields>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true,
  },
  password: { type: String, required: true, select: false, minlength: 60, maxlength: 60 },
}, { timestamps: true, versionKey: false });

export const User = model<UserFields>('User', userSchema);

export function publicUser(user: HydratedDocument<UserFields>): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
