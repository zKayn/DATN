import express from 'express';
import {
  register,
  registerAdmin,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  uploadAvatar
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/upload-avatar', protect, uploadAvatar);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Address routes
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.put('/addresses/:addressId/set-default', protect, setDefaultAddress);

export default router;
