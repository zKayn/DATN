import express from 'express';
import { protect } from '../middlewares/auth';
import {
  createPaymentLink,
  handleWebhook,
  getPaymentStatus,
  cancelPayment
} from '../controllers/payos.controller';

const router = express.Router();

// Create payment link (protected route)
router.post('/create-payment-link', protect, createPaymentLink);

// Webhook endpoint (no auth needed - called by PayOS)
router.post('/webhook', handleWebhook);

// Get payment status (protected route)
router.get('/status/:orderId', protect, getPaymentStatus);

// Cancel payment (protected route)
router.post('/cancel', protect, cancelPayment);

export default router;
