import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';
import { registerSchema } from '../schemas/auth.schema.js';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body); //Валідуємо дані з форми реєстрації за допомогою Zod схеми

  if (!result.success) {
    return res.status(400).json({ 
      error: result.error.issues[0].message 
    });
  }

  const { email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });  // Перевіряємо, чи існує користувач з таким email
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hash },  // Створюємо нового користувача в БД
  });

  const accessToken = signAccess(user.id); // Створюємо access токен для нового користувача з jwt утиліти
  const refreshToken = signRefresh(user.id); // Створюємо refresh токен для нового користувача з jwt утиліти

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id }, // Зберігаємо refresh токен в БД для подальшої валідації
  });

  res
    .cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
    .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json({ success: true });
};



export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccess(user.id);
  const refreshToken = signRefresh(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id },
  });

  res
    .cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
    .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json({ success: true });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const { userId } = verifyRefresh(token);

    // Перевіряємо чи токен є в БД (rotation)
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored) return res.status(401).json({ error: 'Token reuse detected' });

    // Видаляємо старий, видаємо новий (rotation)
    await prisma.refreshToken.delete({ where: { token } });

    const newAccess = signAccess(userId);
    const newRefresh = signRefresh(userId);

    await prisma.refreshToken.create({
      data: { token: newRefresh, userId },
    });

    res
      .cookie('accessToken', newAccess, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', newRefresh, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ success: true });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json({ success: true });
};