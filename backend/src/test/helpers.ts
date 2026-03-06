import crypto from 'crypto';
import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import { hashPassword } from '../lib/password';
import { generateToken } from '../lib/jwt';

export function uniqueEmail(): string {
  return `test-${crypto.randomUUID()}@test.com`;
}

export interface TestUser {
  id: string;
  email: string;
  token: string;
}

export async function createTestUser(
  overrides: { email?: string; password?: string; name?: string } = {}
): Promise<TestUser> {
  const email = overrides.email || uniqueEmail();
  const password = await hashPassword(overrides.password || 'Test1234!');

  const user = await prisma.user.create({
    data: {
      email,
      password,
      name: overrides.name || 'Test User',
    },
  });

  const token = generateToken(user.id);
  return { id: user.id, email, token };
}

export async function cleanupUser(userId: string): Promise<void> {
  // Cascade delete handles related records
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
}

export function api() {
  return request(app);
}
