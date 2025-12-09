import express from 'express';
import { chatWithAI } from '../controllers/chat.controller';

const router = express.Router();

// Public route - không cần authentication
router.post('/ai', chatWithAI);

export default router;
