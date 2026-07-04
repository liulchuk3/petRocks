import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getCartHandler, addToCartHandler, updateCartHandler, removeFromCartHandler,
         getLikesHandler, toggleLikeHandler,
         createAdminItemController, updateAdminItemController
} from '../controllers/items.controllers.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js'; // Import the upload middleware for handling file uploads

const router = Router();

// Cart
router.get('/profile/cart', requireAuth, getCartHandler); // Get all cart items for the authenticated user
router.post('/profile/cart/:itemId', requireAuth, addToCartHandler);
router.patch('/profile/cart/:itemId', requireAuth, updateCartHandler);
router.delete('/profile/cart/:itemId', requireAuth, removeFromCartHandler);

// Likes
router.get('/profile/likes', requireAuth, getLikesHandler);
router.post('/profile/likes/:itemId', requireAuth, toggleLikeHandler);

// Admin routes
router.post('/items', requireAuth, requireAdmin, upload.single('image'), createAdminItemController); // Create a new item (Admin only)
router.put('/items/change/:itemId', requireAuth, requireAdmin, upload.single('image'), updateAdminItemController); // Update an existing item (Admin only)


export default router;
