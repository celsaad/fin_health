import 'dotenv/config';
import { beforeAll, afterAll } from 'vitest';
import prisma from '../lib/prisma';

beforeAll(async () => {
  await prisma.$queryRaw`SELECT 1`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
