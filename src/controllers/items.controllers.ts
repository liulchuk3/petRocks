import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  getCart, addToCart, updateCartQuantity, removeFromCart,
  getLikes, toggleLike,
  getAllItemsForHomePageService,
  getAllItemsForCatalogService,
  createAdminItemService,
  getItemBySlugService
} from '../services/items.service.js';
import { prisma } from '../lib/prisma.js';
import { compressAndSave } from '../utils/upload.js';
import type { CatalogQueryOptions } from '../utils/catalog-query.js';



// ALL ITEMS FOR THE HOME PAGE (hits || new)
export const getAllItemsForHomePageController = async () => {
  const itemsController = await getAllItemsForHomePageService();
  return itemsController;
}

// ALL ITEMS FOR CATALOG PAGE
export const getAllItemsForCatalogController = async (options: CatalogQueryOptions = {}) => {
  const itemsController = await getAllItemsForCatalogService(options);
  return itemsController;
}

// GET ITEM BY SLUG FOR THE ITEM PAGE
export const getItemBySlugController = async (req: AuthRequest) => {
  const normalSlug = Array.isArray(req.params.slug) ? req.params.slug.join('/') : req.params.slug;
  const item = await getItemBySlugService(normalSlug);
  return item;
};

// ── ADMIN: CREATE ITEM
export const createAdminItemController = async (req: AuthRequest, res: Response) => {
  const { "name-uk": nameUk, "name-en": nameEn, "description-uk": descriptionUk, "description-en": descriptionEn, price } = req.body;
  const imageFile = req.file;
  const ownerId = req.userId!; // Ensure ownerId is set to the authenticated user's ID
  if (!nameUk || !nameEn || !descriptionUk || !descriptionEn || !price || !imageFile) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const response = await createAdminItemService({ "name-uk": nameUk, "name-en": nameEn, "description-uk": descriptionUk, "description-en": descriptionEn, price, ownerId }, imageFile);
  res.json(response);
}



// ── CART ──────────────────────────────────────────────────────────────────────

export const getCartHandler = async (req: AuthRequest, res: Response) => {
  const cart = await getCart(req.userId!);
  res.json(cart);
};

export const addToCartHandler = async (req: AuthRequest, res: Response) => {
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) return res.status(400).json({ error: 'Invalid itemId' });

  const cartItem = await addToCart(req.userId!, itemId);
  res.json(cartItem);
};

export const updateCartHandler = async (req: AuthRequest, res: Response) => {
  const itemId = Number(req.params.itemId);
  const quantity = Number(req.body.quantity);
  if (isNaN(itemId) || isNaN(quantity)) return res.status(400).json({ error: 'Invalid data' });

  const result = await updateCartQuantity(req.userId!, itemId, quantity);
  res.json(result ?? { removed: true });
};

export const removeFromCartHandler = async (req: AuthRequest, res: Response) => {
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) return res.status(400).json({ error: 'Invalid itemId' });

  await removeFromCart(req.userId!, itemId);
  res.json({ success: true });
};

// ── LIKES ─────────────────────────────────────────────────────────────────────

export const getLikesHandler = async (req: AuthRequest, res: Response) => {
  const likes = await getLikes(req.userId!);
  res.json(likes);
};

export const toggleLikeHandler = async (req: AuthRequest, res: Response) => {
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) return res.status(400).json({ error: 'Invalid itemId' });

  const result = await toggleLike(req.userId!, itemId);
  res.json(result);
};

// ── OWN ITEMS ─────────────────────────────────────────────────────────────────