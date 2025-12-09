import express from 'express';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategory);

// Protected routes - Admin
router.post('/', protect, authorize('quan-tri', 'nhan-vien'), createCategory);
router.put('/:id', protect, authorize('quan-tri', 'nhan-vien'), updateCategory);
router.delete('/:id', protect, authorize('quan-tri'), deleteCategory);

export default router;
