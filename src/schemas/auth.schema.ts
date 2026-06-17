import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(8, 'Пароль має містити мінімум 8 символів'),
});

export const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(1, 'Пароль обов\'язковий'),
});