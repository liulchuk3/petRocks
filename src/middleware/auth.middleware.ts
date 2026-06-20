// auth.middleware.ts
// Обидва middleware перевіряють access токен з куків і дістають userId.
// Різниця лише в тому, що робити коли токена немає або він невалідний:
// requireAuth — блокує запит, optionalAuth — пропускає в будь-якому разі.
import { Request, Response, NextFunction } from 'express';
import { verifyAccess, verifyRefresh, signAccess, signRefresh } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';

export interface AuthRequest extends Request { // Розширюємо Request, додаючи userId
  userId?: string;
}

// Спільна логіка: пробує дістати userId з токена.
// Повертає userId або undefined — нічого не вирішує сама, тільки дістає дані.
function extractUserId(req: AuthRequest): string | undefined {
  const token = req.cookies?.accessToken;
  if (!token) return undefined;

  try {
    return verifyAccess(token).userId; //
  } catch {
    return undefined; // токен є, але невалідний/протух
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    try {
      req.userId = verifyAccess(accessToken).userId;
      return next(); // accessToken валідний — все добре
    } catch {
      // accessToken протух — пробуємо refresh
    }
  }

  // Немає accessToken або він протух — дивимось на refreshToken
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return next(); // немає нічого — гість

  try {
    const { userId } = verifyRefresh(refreshToken); // Якщо refreshToken невалідний, буде кинута помилка і ми потрапимо в catch, де просто пропустимо запит як гість.

    // Перевіряємо чи є в БД
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored) return next(); // токен відкликаний — гість

    // Ротація — видаляємо старий, видаємо новий
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newAccess = signAccess(userId);
    const newRefresh = signRefresh(userId);
    await prisma.refreshToken.create({ data: { token: newRefresh, userId } });

    // Встановлюємо нові куки
    res.cookie('accessToken', newAccess, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    req.userId = userId;
  } catch {
    // refreshToken невалідний — гість
  }

  next();
};



// Жорсткий варіант — для приватних роутів (/profile, /orders)
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = extractUserId(req); // спочатку пробуємо accessToken

  if (userId) {
    req.userId = userId;
    return next(); // accessToken валідний — все добре
  }

  // accessToken протух або відсутній — пробуємо refreshToken
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized' }); // нема нічого — відмова
  }

  try {
    const { userId } = verifyRefresh(refreshToken);

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored) return res.status(401).json({ error: 'Unauthorized' }); // токен відкликаний

    // Rotation
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newAccess = signAccess(userId);
    const newRefresh = signRefresh(userId);
    await prisma.refreshToken.create({ data: { token: newRefresh, userId } });

    res.cookie('accessToken', newAccess, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' }); // refreshToken невалідний
  }
};