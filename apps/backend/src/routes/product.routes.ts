import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getFeaturedProducts,
  getNewProducts,
  getProductBySlug,
  recalculateStock
} from '../controllers/product.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new', getNewProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Protected routes - Admin & Nhân viên
router.post('/', protect, authorize('quan-tri', 'nhan-vien'), createProduct);
router.post('/recalculate-stock', protect, authorize('quan-tri'), recalculateStock);
router.put('/:id', protect, authorize('quan-tri', 'nhan-vien'), updateProduct);
router.delete('/:id', protect, authorize('quan-tri'), deleteProduct);

export default router;
