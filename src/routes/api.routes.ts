import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getCartHandler, addToCartHandler, updateCartHandler, removeFromCartHandler,
         getLikesHandler, toggleLikeHandler,
         getOwnItemsHandler,
} from '../controllers/items.controllers.js';

const router = Router();

// Cart
router.get('/profile/cart', requireAuth, getCartHandler); // Get all cart items for the authenticated user
router.post('/profile/cart/:itemId', requireAuth, addToCartHandler);
router.patch('/profile/cart/:itemId', requireAuth, updateCartHandler);
router.delete('/profile/cart/:itemId', requireAuth, removeFromCartHandler);

// Likes
router.get('/profile/likes', requireAuth, getLikesHandler);
router.post('/profile/likes/:itemId', requireAuth, toggleLikeHandler);

// Own items
router.get('/profile/items', requireAuth, getOwnItemsHandler);

export default router;
