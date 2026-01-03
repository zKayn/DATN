import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  createRefund,
  getPaymentStatus
} from '../controllers/stripe.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Stripe Payment Routes
router.post('/stripe/create-intent', protect, createPaymentIntent);
router.post('/stripe/confirm', protect, confirmPayment);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.post('/stripe/refund', protect, authorize('quan-tri'), createRefund);
router.get('/stripe/status/:orderId', protect, getPaymentStatus);

export default router;
