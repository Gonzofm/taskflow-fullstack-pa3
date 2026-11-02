import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import type { Priority, PublicTask, TaskStatus } from '../types/entities.js';

export interface TaskFields {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskFields>({
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
}, { timestamps: true, versionKey: false });

taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1 });

export const Task = model<TaskFields>('Task', taskSchema);

export function publicTask(task: HydratedDocument<TaskFields>): PublicTask {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    user: task.user.toString(),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
