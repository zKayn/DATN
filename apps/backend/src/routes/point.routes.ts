import express from 'express';
import {
  getMyPoints,
  getMyPointHistory,
  calculateDiscount
} from '../controllers/point.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get my points balance
router.get('/my-points', getMyPoints);

// Get my point transaction history
router.get('/history', getMyPointHistory);

// Calculate discount from points
router.post('/calculate-discount', calculateDiscount);

export default router;
