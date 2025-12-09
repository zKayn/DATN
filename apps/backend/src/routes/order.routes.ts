import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  deleteOrder
} from '../controllers/order.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Protected routes - Customer
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, authorize('quan-tri', 'nhan-vien'), getOrders);
router.put('/:id/status', protect, authorize('quan-tri', 'nhan-vien'), updateOrderStatus);
router.delete('/:id', protect, authorize('quan-tri'), deleteOrder);

export default router;
