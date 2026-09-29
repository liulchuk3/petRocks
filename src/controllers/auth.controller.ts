import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';
import { registerSchema } from '../schemas/auth.schema.js';
import { sendResetEmail } from '../services/emailService.js'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body); //Валідуємо дані з форми реєстрації за допомогою Zod схеми
  const lang = req.cookies?.i18next || 'UK';
  if (!result.success) {
    return res.status(400).json({ 
      error: result.error.issues[0].message 
    });
  }

  const { email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });  // Перевіряємо, чи існує користувач з таким email
  if (existing) return res.status(409).json({ error: lang === "UK" ? 'Email already in use' : 'Email вже використовується' });

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hash, username: email },  // Створюємо нового користувача в БД
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


// Handle user login request
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const lang = req.cookies?.i18next || 'UK';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: lang === "UK" ? 'Invalid credentials' : 'Невірні облікові дані' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: lang === "UK" ? 'Invalid credentials' : 'Невірні облікові дані' });

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

// Handle forgot password request
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

// Logout the user and clear refresh token from the database
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

// Handle reset password request
export async function forgotPassword(req, res) {
  const { email } = req.body;
  
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 година

  try {
    await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expiry,
    },
  });

  const language = req.language || req.cookies?.i18next || 'uk';
  const setPasswordFormLink = `${process.env.CLIENT_URL}/${language}/auth/set-password-form/${token}`;
  // const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendResetEmail(email, setPasswordFormLink);
  console.log(`Password reset email sent to ${email} with link: ${setPasswordFormLink}`);

  res.json({ message: 'Якщо такий email існує, ми надіслали листа.' });
  } catch (error) {
    console.error(`Error handling forgot password request for email: ${email}`, error);
  }
}

// Shows the reset password form (validate token)
export async function showResetForm(req, res) {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: 'Токен недійсний або застарів.' });
  }
  res.render('pages/set-password-form', {
    token,
    currentLng: req.language || req.cookies?.i18next || 'uk',
    userData: null,
  });
}


export async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  // Знаходимо юзера за токеном, перевіряємо термін дії
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() }, // токен ще дійсний
    },
  });

  if (!user) {
    return res.status(400).json({ message: 'Токен недійсний або застарів.' });
  }

  // Хешуємо новий пароль
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  res.json({ message: 'Пароль успішно змінено.' });
}