// auth.middleware.ts
// Обидва middleware перевіряють access токен з куків і дістають userId.
// Різниця лише в тому, що робити коли токена немає або він невалідний:
// requireAuth — блокує запит, optionalAuth — пропускає в будь-якому разі.
import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt.js';

export interface AuthRequest extends Request { // Розширюємо Request, додаючи userId
  userId?: string;
}

// Спільна логіка: пробує дістати userId з токена.
// Повертає userId або undefined — нічого не вирішує сама, тільки дістає дані.
function extractUserId(req: AuthRequest): string | undefined {
  const token = req.cookies?.accessToken;
  if (!token) return undefined;

  try {
    return verifyAccess(token).userId; // токен валідний, повертаємо userId
  } catch {
    return undefined; // токен є, але невалідний/протух
  }
}

// Жорсткий варіант — для приватних роутів (/profile, /orders)
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = extractUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.userId = userId;
  next();
};

// М'який варіант — для публічних роутів ("/", де є гості й залогінені)
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  req.userId = extractUserId(req); // якщо undefined — просто немає userId
  next(); // пропускаємо завжди, незалежно від результату
};