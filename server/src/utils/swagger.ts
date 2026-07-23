import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kapda POS API',
      version: '1.0.0',
      description:
        'Point of Sale system for clothing (Kapda) stores. Complete POS solution with billing, inventory, GST, returns, and reporting.',
      contact: {
        name: 'Kapda POS Team',
      },
    },
    servers: [{ url: '/api', description: 'API Base URL' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.validation.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
