import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().positive()).default('3000'),
  HOST: z.string().default('localhost'),

  MONGODB_URI: z.string().url(),
  MONGODB_TEST_URI: z.string().url().optional(),

  REDIS_URL: z.string().url().optional(),

  SESSION_SECRET: z.string().min(32),

  STEAM_API_KEY: z.string().min(1),
  GIANTBOMB_API_KEY: z.string().min(1),
  GIANTBOMB_DELAY_MS: z.string().transform(Number).pipe(z.number().positive()).default('15000'),

  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
