import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/auth.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Wishlist routes (require authentication)
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// Cart routes (require authentication)
router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCart);
router.put('/cart', protect, updateCartItem);
router.delete('/cart/item', protect, removeFromCart);  // Remove single item
router.delete('/cart', protect, clearCart);  // Clear entire cart

// Admin routes only
router.use(protect);
router.use(authorize('quan-tri'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
