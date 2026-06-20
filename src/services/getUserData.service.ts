import { prisma } from '../lib/prisma.js';

export async function getShortUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      imageUrl: true,
    },
  });
}

export async function getFullUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      imageUrl: true,
    },
  });
}