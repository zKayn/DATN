import express from 'express';
import {
  getRecommendations,
  chatbot,
  searchByImage,
  getTrends
} from '../controllers/ai.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

// AI routes
router.get('/recommendations', protect, getRecommendations);
router.post('/chatbot', chatbot);
router.post('/search-image', searchByImage);
router.get('/trends', protect, getTrends);

export default router;
