import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { addToCartController, 
         updateCartQuantityController,
         removeFromCartController,
         createAdminItemController, updateAdminItemController
         
} from '../controllers/items.controllers.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js'; // Import the upload middleware for handling file uploads
import { searchCities, searchWarehouses } from '../services/novaposhta.service.js';

const router = Router();

// Add an item to the user's cart
router.post('/addToCart/:itemId', requireAuth, addToCartController);

// Update an item quantity in the user's cart
router.patch('/profile/cart/:itemId', requireAuth, updateCartQuantityController);

// Remove an item from the user's cart
router.delete('/profile/cart/:itemId', requireAuth, removeFromCartController);



 // Create a new item (Admin only)
router.post('/items', requireAuth, requireAdmin, upload.single('image'), createAdminItemController);

// Update an existing item (Admin only)
router.put('/items/change/:itemId', requireAuth, requireAdmin, upload.single('image'), updateAdminItemController);



// Search for cities by name
router.get('/cities', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);
  const cities = await searchCities(query as string);
  res.json(cities);
});

// Search for warehouses in a specific city
router.get('/warehouses', async (req, res) => {
  const { cityRef, query } = req.query;
  if (!cityRef) return res.json([]);

  const warehouses = await searchWarehouses(cityRef as string, query as string);
  res.json(warehouses);
});

export default router;