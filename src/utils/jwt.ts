import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const signAccess = (userId: string) =>
  jwt.sign({ userId }, SECRET, { expiresIn: '15m' });

export const signRefresh = (userId: string) =>
  jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });

export const verifyAccess = (token: string) =>
  jwt.verify(token, SECRET) as { userId: string };

export const verifyRefresh = (token: string) =>
  jwt.verify(token, REFRESH_SECRET) as { userId: string };