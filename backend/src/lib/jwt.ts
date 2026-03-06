import jwt from 'jsonwebtoken';
import { env } from './env';

const JWT_SECRET = env.JWT_SECRET;
const TOKEN_TTL = '24h';

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): { userId: string; iat: number } {
  const payload = jwt.verify(token, JWT_SECRET) as { userId: string; iat: number };
  return { userId: payload.userId, iat: payload.iat };
}
