import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1).max(64),
  DB_SSL: z.enum(['true', 'false']).default('false'),
  CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
  API_PUBLIC_URL: z.url().default('http://localhost:4000'),
  JWT_SECRET: z.string().refine((value) => Buffer.byteLength(value, 'utf8') >= 32),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().min(60).max(86400).default(3600),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10000).default(20),
});

export interface SqlConfig {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbSsl: boolean;
  clientOrigin: string;
  apiPublicUrl: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  authRateLimitMax: number;
}

export function loadSqlConfig(environment: NodeJS.ProcessEnv = process.env): SqlConfig {
  const result = schema.safeParse(environment);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => issue.path.join('.')))];
    throw new Error(`Configuración inválida: ${fields.join(', ')}. Revisa server/.env.pa4.`);
  }
  const value = result.data;
  for (const field of ['CLIENT_ORIGIN', 'API_PUBLIC_URL'] as const) {
    const url = new URL(value[field]);
    if (url.origin !== value[field] || !['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`${field} debe ser un origen HTTP/HTTPS sin ruta ni barra final.`);
    }
    if (value.NODE_ENV === 'production' && url.protocol !== 'https:') {
      throw new Error(`${field} debe usar HTTPS en producción.`);
    }
  }
  return {
    nodeEnv: value.NODE_ENV, host: value.HOST, port: value.PORT,
    dbHost: value.DB_HOST, dbPort: value.DB_PORT, dbUser: value.DB_USER,
    dbPassword: value.DB_PASSWORD, dbName: value.DB_NAME, dbSsl: value.DB_SSL === 'true',
    clientOrigin: value.CLIENT_ORIGIN, apiPublicUrl: value.API_PUBLIC_URL,
    jwtSecret: value.JWT_SECRET, jwtExpiresInSeconds: value.JWT_EXPIRES_IN_SECONDS,
    authRateLimitMax: value.AUTH_RATE_LIMIT_MAX,
  };
}
