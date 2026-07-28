import rateLimit from 'express-rate-limit';

const baseConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    trustProxy: false,
  },
};

export const generalLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});

const isDev = (process.env.SERVER_NODE_ENV || 'development') === 'development';

export const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 50,
  message: { status: 'error', message: 'Too many login attempts, please try again later.' },
});

export const apiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000,
  max: 200,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});
