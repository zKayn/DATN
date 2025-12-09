import express from 'express';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  rejectReview
} from '../controllers/review.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin routes
router.get('/', protect, authorize('quan-tri', 'nhan-vien'), getAllReviews);
router.put('/:id/approve', protect, authorize('quan-tri', 'nhan-vien'), approveReview);
router.put('/:id/reject', protect, authorize('quan-tri', 'nhan-vien'), rejectReview);

export default router;
