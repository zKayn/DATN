import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Public route - anyone can read settings
router.get('/', getSettings);

// Protected route - only admin can update settings
router.put('/', protect, authorize('quan-tri'), updateSettings);

export default router;
