import express from 'express';
import { uploadImage, uploadMultipleImages } from '../controllers/upload.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/image', protect, uploadImage);
router.post('/images', protect, uploadMultipleImages);

export default router;
