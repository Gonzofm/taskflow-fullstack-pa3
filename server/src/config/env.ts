import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//, 'MONGODB_URI debe ser una URI de MongoDB.'),
  CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
  JWT_SECRET: z.string().refine((value) => Buffer.byteLength(value, 'utf8') >= 32, 'JWT_SECRET necesita al menos 32 bytes.'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().min(60).max(86400).default(3600),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10000).default(20),
});

export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  mongodbUri: string;
  clientOrigin: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  authRateLimitMax: number;
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(environment);
  if (!parsed.success) {
    // Se mencionan únicamente los nombres de configuración, nunca sus valores.
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
    throw new Error(`Configuración inválida: ${fields.join(', ')}. Revisa server/.env y .env.example.`);
  }
  const values = parsed.data;
  const origin = new URL(values.CLIENT_ORIGIN);
  if (origin.origin !== values.CLIENT_ORIGIN || !['http:', 'https:'].includes(origin.protocol)) {
    throw new Error('CLIENT_ORIGIN debe contener solamente el origen HTTP/HTTPS, sin ruta ni barra final.');
  }
  return {
    nodeEnv: values.NODE_ENV,
    port: values.PORT,
    mongodbUri: values.MONGODB_URI,
    clientOrigin: values.CLIENT_ORIGIN,
    jwtSecret: values.JWT_SECRET,
    jwtExpiresInSeconds: values.JWT_EXPIRES_IN_SECONDS,
    authRateLimitMax: values.AUTH_RATE_LIMIT_MAX,
  };
}
