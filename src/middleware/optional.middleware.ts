import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt.js';
import { AuthRequest } from './auth.middleware.js';

// Стара — блокує якщо не авторизований
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.userId = verifyAccess(token).userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired' });
  }
};

// Нова — пропускає всіх, але додає userId якщо токен є
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (token) {
    try {
      req.userId = verifyAccess(token).userId;
    } catch {
      // токен є але невалідний — просто ігноруємо
    }
  }

  next(); // пропускаємо завжди
};