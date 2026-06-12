import crypto from 'crypto';
import { describe, it, expect, afterEach } from 'vitest';
import prisma from './prisma';
import { hashPassword } from './password';
import { createRefreshToken, consumeRefreshToken, cleanExpiredRefreshTokens } from './refreshToken';
import { uniqueEmail } from '../test/helpers';

describe('refreshToken', () => {
  const userIds: string[] = [];

  afterEach(async () => {
    for (const id of userIds) {
      await prisma.user.delete({ where: { id } }).catch(() => {});
    }
    userIds.length = 0;
  });

  async function makeUser() {
    const password = await hashPassword('Test1234!');
    const user = await prisma.user.create({
      data: { email: uniqueEmail(), password, name: 'Test User' },
    });
    userIds.push(user.id);
    return user;
  }

  it('stores a hashed token, not the raw value', async () => {
    const user = await makeUser();
    const token = await createRefreshToken(user.id);

    const stored = await prisma.refreshToken.findFirst({ where: { userId: user.id } });
    expect(stored).not.toBeNull();
    expect(stored!.token).not.toBe(token);
    expect(stored!.token).toBe(crypto.createHash('sha256').update(token).digest('hex'));
  });

  it('consumes a valid token exactly once', async () => {
    const user = await makeUser();
    const token = await createRefreshToken(user.id);

    const first = await consumeRefreshToken(token);
    expect(first).not.toBeNull();
    expect(first!.userId).toBe(user.id);

    const second = await consumeRefreshToken(token);
    expect(second).toBeNull();
  });

  it('returns null for an unknown token', async () => {
    const result = await consumeRefreshToken('not-a-real-token');
    expect(result).toBeNull();
  });

  it('returns null for an expired token', async () => {
    const user = await makeUser();
    const token = await createRefreshToken(user.id);

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.refreshToken.update({
      where: { token: hashed },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const result = await consumeRefreshToken(token);
    expect(result).toBeNull();
  });

  it('cleanExpiredRefreshTokens removes expired tokens', async () => {
    const user = await makeUser();
    const token = await createRefreshToken(user.id);
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.refreshToken.update({
      where: { token: hashed },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await cleanExpiredRefreshTokens();

    const stored = await prisma.refreshToken.findUnique({ where: { token: hashed } });
    expect(stored).toBeNull();
  });
});
