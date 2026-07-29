import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.SERVER_NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (isProduction) {
  if (!accessSecret || accessSecret === 'access-secret-dev') {
    throw new Error('JWT_ACCESS_SECRET must be set to a strong random value in production');
  }
  if (!refreshSecret || refreshSecret === 'refresh-secret-dev') {
    throw new Error('JWT_REFRESH_SECRET must be set to a strong random value in production');
  }
}

export const config = {
  port: Number(process.env.SERVER_PORT) || Number(process.env.PORT) || 4000,
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN || (isProduction ? 'https://erp.shadowlabz.in' : 'http://localhost:5173'),
  jwt: {
    accessSecret: accessSecret || 'access-secret-dev',
    refreshSecret: refreshSecret || 'refresh-secret-dev',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '365d',
  },
  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },
  upload: {
    dir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../../uploads'),
    maxFileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE) || 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
} as const;