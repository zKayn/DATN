import express from 'express';
import {
  getVouchers,
  getVoucherById,
  kiemTraVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getAvailableVouchers
} from '../controllers/voucher.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/kiem-tra', kiemTraVoucher); // Check voucher validity
router.get('/kha-dung', getAvailableVouchers); // Get available vouchers for customers

// Admin routes
router.get('/', protect, authorize('quan-tri'), getVouchers);
router.get('/:id', protect, authorize('quan-tri'), getVoucherById);
router.post('/', protect, authorize('quan-tri'), createVoucher);
router.put('/:id', protect, authorize('quan-tri'), updateVoucher);
router.delete('/:id', protect, authorize('quan-tri'), deleteVoucher);

export default router;
