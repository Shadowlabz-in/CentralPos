import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import logger from './utils/logger';
import { generalLimiter } from './utils/rateLimiter';
import routes from './routes';
import { swaggerSpec } from './utils/swagger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.set('trust proxy', 1);

if (config.nodeEnv === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] === 'http') {
      return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    }
    next();
  });
}

app.use('/uploads', express.static(path.resolve(config.upload.dir)));

const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath, {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'https://*.firebaseio.com',
        'https://identitytoolkit.googleapis.com',
        'https://securetoken.googleapis.com',
        'wss://*',
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      fontSrc: ["'self'"],
      frameSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  next();
});

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/api', routes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

export default app;