import express from 'express';
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  sendBulkEmail,
  sendVoucherToSubscribers
} from '../controllers/newsletter.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/', protect, authorize('quan-tri', 'nhan-vien'), getAllSubscribers);
router.post('/send-bulk', protect, authorize('quan-tri'), sendBulkEmail);
router.post('/send-voucher', protect, authorize('quan-tri'), sendVoucherToSubscribers);

export default router;
