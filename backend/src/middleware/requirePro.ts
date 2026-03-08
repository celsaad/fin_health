import { Request, Response, NextFunction } from 'express';

export function requirePro(req: Request, res: Response, next: NextFunction): void {
  const sub = req.subscription;

  if (sub && sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing')) {
    next();
    return;
  }

  res.status(403).json({
    error: 'This feature requires a Pro plan',
    code: 'PRO_REQUIRED',
  });
}
