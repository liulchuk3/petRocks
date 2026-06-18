import { prisma } from '../lib/prisma.js';

export async function getUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      // password НЕ вибираємо — він не повинен потрапляти в шаблон
    },
  });
}