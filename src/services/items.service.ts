import { prisma } from '../lib/prisma.js';

// ── CART ──────────────────────────────────────────────────────────────────────

export async function getCart(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      item: {
        select: { id: true, name: true, price: true, discountPrice: true, imageUrl: true, slug: true, isActive: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addToCart(userId: string, itemId: number) {
  return prisma.cartItem.upsert({
    where: { userId_itemId: { userId, itemId } },
    update: { quantity: { increment: 1 } },
    create: { userId, itemId, quantity: 1 },
    include: {
      item: {
        select: { id: true, name: true, price: true, discountPrice: true, imageUrl: true, slug: true },
      },
    },
  });
}

export async function updateCartQuantity(userId: string, itemId: number, quantity: number) {
  if (quantity < 1) {
    await prisma.cartItem.deleteMany({ where: { userId, itemId } });
    return null;
  }
  return prisma.cartItem.update({
    where: { userId_itemId: { userId, itemId } },
    data: { quantity },
    include: {
      item: {
        select: { id: true, name: true, price: true, discountPrice: true, imageUrl: true, slug: true },
      },
    },
  });
}

export async function removeFromCart(userId: string, itemId: number) {
  return prisma.cartItem.deleteMany({ where: { userId, itemId } });
}

// ── LIKES ─────────────────────────────────────────────────────────────────────

export async function getLikes(userId: string) {
  return prisma.like.findMany({
    where: { userId },
    include: {
      item: {
        select: { id: true, name: true, price: true, discountPrice: true, imageUrl: true, slug: true, isActive: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleLike(userId: string, itemId: number) {
  const existing = await prisma.like.findUnique({
    where: { userId_itemId: { userId, itemId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { userId_itemId: { userId, itemId } } });
    return { liked: false };
  }

  await prisma.like.create({ data: { userId, itemId } });
  return { liked: true };
}

// ── OWN ITEMS ─────────────────────────────────────────────────────────────────

export async function getOwnItems(userId: string) {
  return prisma.items.findMany({
    where: { ownerId: userId },
    select: {
      id: true, name: true, price: true, discountPrice: true,
      imageUrl: true, slug: true, stock: true, isActive: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
