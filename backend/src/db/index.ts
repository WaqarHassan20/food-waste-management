import { PrismaClient } from './generated/prisma';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_VSmn0DsF1BLq@ep-misty-sea-aduj1nkg.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const prisma = new PrismaClient({
  datasourceUrl: databaseUrl,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});