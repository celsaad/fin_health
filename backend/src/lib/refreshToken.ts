import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import prisma from './prisma';

const REFRESH_TOKEN_TTL_DAYS = 30;

export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(64).toString('base64url');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = generateRefreshTokenValue();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshToken.create({
    data: { token: hashToken(token), userId, expiresAt },
  });

  return token;
}

export async function consumeRefreshToken(token: string) {
  const hashedToken = hashToken(token);

  let record;
  try {
    // Delete the consumed token directly (single-use rotation). This makes
    // consumption atomic — concurrent requests with the same token can't
    // both succeed, since only one delete can find the row.
    record = await prisma.refreshToken.delete({ where: { token: hashedToken } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }
    throw err;
  }

  if (record.expiresAt < new Date()) return null;

  return record;
}

export async function revokeUserRefreshTokens(userId: string) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function cleanExpiredRefreshTokens() {
  await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
