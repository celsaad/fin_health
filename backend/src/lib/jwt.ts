import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return 'dev-jwt-secret-unsafe';
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();
const TOKEN_TTL = '24h';

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): { userId: string; iat: number } {
  const payload = jwt.verify(token, JWT_SECRET) as { userId: string; iat: number };
  return { userId: payload.userId, iat: payload.iat };
}
