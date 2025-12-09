import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get notifications (for current user)
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
