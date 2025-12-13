import { PrismaClient } from './generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/food_waste_db';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });