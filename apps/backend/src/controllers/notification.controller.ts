import { Request, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';

// Get notifications for current user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, daDoc } = req.query;

    const query: any = { nguoiNhan: req.user?._id };
    if (daDoc !== undefined) {
      query.daDoc = daDoc === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('donHang', 'maDonHang tongTien trangThai')
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      nguoiNhan: req.user?._id,
      daDoc: false
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    });
  } catch (error: any) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách thông báo'
    });
  }
};

// Get unread count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await Notification.countDocuments({
      nguoiNhan: req.user?._id,
      daDoc: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy số thông báo chưa đọc'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, nguoiNhan: req.user?._id },
      { daDoc: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      data: notification,
      message: 'Đã đánh dấu thông báo là đã đọc'
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật thông báo'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { nguoiNhan: req.user?._id, daDoc: false },
      { daDoc: true }
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc'
    });
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật thông báo'
    });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      nguoiNhan: req.user?._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa thông báo'
    });
  }
};

// Helper function to create notification for all admins
export const createNotificationForAdmins = async (data: {
  tieuDe: string;
  noiDung: string;
  loai: 'don-hang-moi' | 'don-hang-huy' | 'danh-gia-moi' | 'khac';
  donHang?: string;
  danhGia?: string;
}) => {
  try {
    // Get all admin users
    const admins = await User.find({ vaiTro: 'quan-tri' }).select('_id');

    if (admins.length === 0) {
      console.log('No admin users found');
      return;
    }

    // Create notification for each admin
    const notifications = admins.map(admin => ({
      tieuDe: data.tieuDe,
      noiDung: data.noiDung,
      loai: data.loai,
      nguoiNhan: admin._id,
      donHang: data.donHang,
      danhGia: data.danhGia,
      daDoc: false
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications for admins`);
  } catch (error) {
    console.error('Error creating notifications for admins:', error);
  }
};
