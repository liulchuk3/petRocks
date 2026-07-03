import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { compressAndSave } from '../utils/upload.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Response } from 'express';
import type { CatalogQueryOptions } from '../utils/catalog-query.js';

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

// Get all items for the catalog page with optional server-side filtering and sorting
export const getAllItemsForCatalogService = async (options: CatalogQueryOptions = {}) => {
  const where: Prisma.ItemsWhereInput = {};
  const orderBy: Prisma.ItemsOrderByWithRelationInput[] = [
    { isActive: 'desc' },
  ];

  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    where.price = {
      ...(options.minPrice !== undefined ? { gte: options.minPrice } : {}),
      ...(options.maxPrice !== undefined ? { lte: options.maxPrice } : {}),
    };
  }

  if (options.sortByPrice) {
    orderBy.push({ price: options.sortByPrice });
  }

  if (options.sortByDate) {
    orderBy.push({ createdAt: options.sortByDate === 'newest' ? 'desc' : 'asc' });
  }

  if (!options.sortByPrice && !options.sortByDate) {
    orderBy.push({ createdAt: 'desc' });
  }

  const items = await prisma.items.findMany({
    where,
    orderBy,
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

  return items;
}

// Get item by slug for the item page
export const getItemBySlugService = async (slug: string) => {
  return prisma.items.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      price: true,
      discountPrice: true,
      description: true,
      imageUrl: true,
      slug: true,
      owner: { select: { role: true } }
    }
  });
}

// Create a new item (Admin only has access to this)
export const createAdminItemService = async (data: { "name-uk": string; "name-en": string; "description-uk": string; "description-en": string; price: number; ownerId: string }, imageFile: Express.Multer.File) => {
  console.log('Received data:', data);
  try {
    const imageUrl = await compressAndSave(imageFile);

    const slug = data["name-en"] // Генерація slug з назви товару
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now();

    const sku = `SKU-${Date.now()}-${Math.random().toString(36).slice(2).toUpperCase()}`; // Генерація SKU

    const item = await prisma.items.create({
      data: { 
        name: {
        en: data["name-en"],
        uk: data["name-uk"]
        },
        description: {
        en: data["description-en"],
        uk: data["description-uk"]
        },
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


