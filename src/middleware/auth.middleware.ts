import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = verifyAccess(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
};