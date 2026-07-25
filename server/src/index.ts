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

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(config.upload.dir)));

// Serve built client
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath, {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

// Request logging
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// API routes
app.use('/api', routes);

// Catch-all: serve client index.html for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

export default app;
