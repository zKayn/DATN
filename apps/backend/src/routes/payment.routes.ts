import express from 'express';
import {
  createVNPayPayment,
  vnpayReturn,
  createMoMoPayment,
  momoCallback
} from '../controllers/payment.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

// VNPay
router.post('/vnpay/create', protect, createVNPayPayment);
router.get('/vnpay/return', vnpayReturn);

// MoMo
router.post('/momo/create', protect, createMoMoPayment);
router.post('/momo/callback', momoCallback);

export default router;
