import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  getAllItemsForHomePageService,
  getAllItemsForCatalogService,
  createAdminItemService,
  getItemBySlugService,
  getItemByIdService,
  updateAdminItemService,
  addToCartService,
  updateCartQuantityService,
  removeFromCartService,
  getUserCartService
} from '../services/items.service.js';
import { prisma } from '../lib/prisma.js';
import { compressAndSave } from '../utils/upload.js';
import type { CatalogQueryOptions } from '../utils/catalog-query.js';



// ── ALL ITEMS FOR THE HOME PAGE (hits || new)
export const getAllItemsForHomePageController = async () => {
  const itemsController = await getAllItemsForHomePageService();
  return itemsController;
}

// ── ALL ITEMS FOR CATALOG PAGE
export const getAllItemsForCatalogController = async (options: CatalogQueryOptions = {}) => {
  const itemsController = await getAllItemsForCatalogService(options);
  return itemsController;
}

// ── GET ITEM BY SLUG FOR THE ITEM PAGE
export const getItemBySlugController = async (req: AuthRequest) => {
  const normalSlug = Array.isArray(req.params.slug) ? req.params.slug.join('/') : req.params.slug;
  const item = await getItemBySlugService(normalSlug);
  return item;
};

// ── GET ITEM BY ID FOR THE ITEM PAGE
export const getItemByIdController = async (itemId: string) => {
  const item = await getItemByIdService(itemId);
  return item;
};

// ── ADMIN: CREATE ITEM
export const createAdminItemController = async (req: AuthRequest, res: Response) => {
  const { "name-uk": nameUk, "name-en": nameEn, "description-uk": descriptionUk, "description-en": descriptionEn, price } = req.body;
  const imageFile = req.file;
  if (!nameUk || !nameEn || !descriptionUk || !descriptionEn || !price || !imageFile) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const response = await createAdminItemService({ "name-uk": nameUk, "name-en": nameEn, "description-uk": descriptionUk, "description-en": descriptionEn, price }, imageFile);
  res.json(response);
}

// ── ADMIN: UPDATE ITEM
export const updateAdminItemController = async (req: AuthRequest, res: Response) => {
  const itemId = req.params.itemId as string;
  const { "name-uk": nameUk, "name-en": nameEn, "description-uk": descriptionUk, "description-en": descriptionEn, price, discount, isActive } = req.body;
  const imageFile = req.file; // This will be undefined if no new image is uploaded
  if (!nameUk || !nameEn || !descriptionUk || !descriptionEn || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const normalizedPrice = Number(price);
  const normalizedDiscount = discount === '' || discount === undefined || discount === null
    ? null
    : Number(discount);

  if (Number.isNaN(normalizedPrice) || (normalizedDiscount !== null && Number.isNaN(normalizedDiscount))) {
    return res.status(400).json({ error: 'Invalid numeric fields' });
  }

  const response = await updateAdminItemService(itemId, {
    "name-uk": nameUk,
    "name-en": nameEn,
    "description-uk": descriptionUk,
    "description-en": descriptionEn,
    price: normalizedPrice,
    discount: normalizedDiscount,
    isActive: Boolean(isActive),
  }, imageFile);
  res.json(response);
}

// ── GET USER CART ──────────────────────────────────────────────────────────────────────
export const getUserCartController = async (req: AuthRequest) => {
  const { items, totalCount } = await getUserCartService(req.userId!);
  return { items, totalCount };
};

// ── ADD ITEM TO CART ──────────────────────────────────────────────────────────────────────
export const addToCartController = async (req: AuthRequest, res: Response) => {
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) return res.status(400).json({ error: 'Invalid itemId' });
  const cartItem = await addToCartService(req.userId!, itemId);
  console.log('Cart Item Added:', cartItem); // Log the added cart item for debugging
  res.json(cartItem);
};

// ── UPDATE CART ITEM QUANTITY ──────────────────────────────────────────────────────────────────────
export const updateCartQuantityController = async (req: AuthRequest, res: Response) => {
  const itemId = Number(req.params.itemId);
  const quantity = Number(req.body.quantity);

  if (isNaN(itemId) || isNaN(quantity)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }

  const cartItem = await updateCartQuantityService(req.userId!, itemId, quantity);
  res.json(cartItem);
};

// ── REMOVE ITEM FROM CART ──────────────────────────────────────────────────────────────────────
export const removeFromCartController = async (req: AuthRequest, res: Response) => {
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) return res.status(400).json({ error: 'Invalid itemId' });

  const cartItem = await removeFromCartService(req.userId!, itemId);
  res.json(cartItem);
};