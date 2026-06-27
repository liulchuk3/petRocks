import { prisma } from '../lib/prisma.js';
import { compressAndSave } from '../utils/upload.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Response } from 'express';

// Get all items for the home page (active items only)
export const getAllItemsForHomePageService = async () => {

const randomIdsResult = await prisma.$queryRaw<{ id: number }[]>`
  SELECT id FROM "Items" WHERE "isActive" = true ORDER BY RANDOM() LIMIT 12
`;

const randomIds = randomIdsResult.map(item => item.id);

const items = await prisma.items.findMany({
  where: { id: { in: randomIds } },
  select: { 
    id: true, 
    name: true, 
    price: true, 
    discountPrice: true, 
    imageUrl: true, 
    slug: true, 
    owner: { select: { role: true } } //
  },
});

const hitItemsService = items.sort(() => Math.random() - 0.5);

  const newItemsService = await prisma.items.findMany({
  where: { isActive: true },
  orderBy: {
    createdAt: 'desc',
  },
  take: 12,
  select: { 
    id: true, 
    name: true, 
    price: true, 
    discountPrice: true, 
    imageUrl: true, 
    slug: true, 
    owner: { select: { role: true } } 
  },
});
  return { hitItems: hitItemsService, newItems: newItemsService };
}

// Get all items for the catalog page (active items only)
export const getAllItemsForCatalogService = async () => {
  const fullItemsData = await prisma.items.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      discountPrice: true,
      isActive: true,
      imageUrl: true,
      slug: true,
      owner: { select: { role: true } }
    }
  });
  
  const items = fullItemsData.sort(() => Math.random() - 0.5).sort((a, b) => Number(b.isActive) - Number(a.isActive)); // Сортуємо за isActive, де true (1) буде перед false (0)

  return items;
}

// Create a new item (Admin only has access to this)
export const createAdminItemService = async (data: { name: string; description: string; price: number; ownerId: string }, imageFile: Express.Multer.File) => {
  try {
    const imageUrl = await compressAndSave(imageFile);

    const slug = data.name // Генерація slug з назви товару
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now();

    const sku = `SKU-${Date.now()}-${Math.random().toString(36).slice(2).toUpperCase()}`; // Генерація SKU

    const item = await prisma.items.create({
      data: { name: data.name,
        description: data.description,
        price: data.price,
        sku,
        slug,
        imageUrl,
        ownerId: data.ownerId,
      },
    });

    return { success: true, item };
  } catch (error) {
    throw new Error('Failed to create item');
  }
};





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

export async function getCartCount(userId: string) {
  const count = await prisma.cartItem.aggregate({
    where: { userId },
    _sum: { quantity: true },
  });
  return count._sum.quantity || 0;
}


