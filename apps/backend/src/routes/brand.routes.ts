import express from 'express';
import {
  getBrands,
  getBrand,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/brand.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/slug/:slug', getBrandBySlug);
router.get('/:id', getBrand);

// Protected routes - Admin & Nhân viên
router.post('/', protect, authorize('quan-tri', 'nhan-vien'), createBrand);
router.put('/:id', protect, authorize('quan-tri', 'nhan-vien'), updateBrand);
router.delete('/:id', protect, authorize('quan-tri'), deleteBrand);

export default router;
