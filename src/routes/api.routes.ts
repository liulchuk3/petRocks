import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { createAdminItemController, updateAdminItemController
         
} from '../controllers/items.controllers.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js'; // Import the upload middleware for handling file uploads

const router = Router();

// Get the user's cart
// router.post('/profile/cart/:itemId', requireAuth, addToCartController);

// // Remove an item from the user's cart
// router.delete('/profile/cart/:itemId', requireAuth, removeFromCartController);



 // Create a new item (Admin only)
router.post('/items', requireAuth, requireAdmin, upload.single('image'), createAdminItemController);

// Update an existing item (Admin only)
router.put('/items/change/:itemId', requireAuth, requireAdmin, upload.single('image'), updateAdminItemController);


export default router;
