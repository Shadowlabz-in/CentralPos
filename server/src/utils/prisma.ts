import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.SERVER_NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;

export type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
