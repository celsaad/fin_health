import crypto from 'crypto';
import prisma from './prisma';

const REFRESH_TOKEN_TTL_DAYS = 30;

export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(64).toString('base64url');
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = generateRefreshTokenValue();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function consumeRefreshToken(token: string) {
  const record = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!record) return null;

  // Delete the consumed token (single-use rotation)
  await prisma.refreshToken.delete({ where: { id: record.id } });

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
