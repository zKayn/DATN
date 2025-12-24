import { Request, Response, NextFunction } from 'express';
import Newsletter from '../models/Newsletter';
import Voucher from '../models/Voucher';
import emailService from '../services/email.service';

export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email này đã đăng ký nhận tin'
        });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();

        // Send welcome email
        try {
          await emailService.sendWelcomeEmail(email);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Continue even if email fails
        }

        return res.status(200).json({
          success: true,
          message: 'Đã kích hoạt lại đăng ký nhận tin thành công!'
        });
      }
    }

    // Create new subscriber
    const subscriber = await Newsletter.create({ email });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if email fails - subscriber is still created
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký nhận tin thành công! Vui lòng kiểm tra email của bạn.',
      data: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email chưa đăng ký nhận tin'
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({
      success: true,
      message: 'Đã hủy đăng ký nhận tin thành công'
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;

    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Newsletter.countDocuments(query);

    res.json({
      success: true,
      data: {
        subscribers,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendBulkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu subject hoặc content'
      });
    }

    const subscribers = await Newsletter.find({ isActive: true });

    let sentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      try {
        await emailService.sendPromotionalEmail(subscriber.email, subject, content);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    res.json({
      success: true,
      message: `Đã gửi email thành công đến ${sentCount} người. Thất bại: ${failedCount}`,
      data: {
        sent: sentCount,
        failed: failedCount,
        total: subscribers.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendVoucherToSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { voucherId } = req.body;

    if (!voucherId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu voucherId'
      });
    }

    // Find voucher
    const voucher = await Voucher.findById(voucherId);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    // Check if voucher is active
    if (voucher.trangThai !== 'hoat-dong') {
      return res.status(400).json({
        success: false,
        message: 'Voucher không trong trạng thái hoạt động'
      });
    }

    // Check if voucher is expired
    if (new Date() > voucher.ngayKetThuc) {
      return res.status(400).json({
        success: false,
        message: 'Voucher đã hết hạn'
      });
    }

    // Get all active subscribers
    const subscribers = await Newsletter.find({ isActive: true });

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có subscriber nào để gửi'
      });
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send voucher email to each subscriber
    for (const subscriber of subscribers) {
      try {
        await emailService.sendVoucherEmail(subscriber.email, {
          ma: voucher.ma,
          loai: voucher.loai,
          giaTriGiam: voucher.giaTriGiam,
          giamToiDa: voucher.giamToiDa,
          donToiThieu: voucher.donToiThieu,
          ngayKetThuc: voucher.ngayKetThuc,
          moTa: voucher.moTa
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send voucher to ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    res.json({
      success: true,
      message: `Đã gửi voucher ${voucher.ma} thành công đến ${sentCount} người. Thất bại: ${failedCount}`,
      data: {
        voucher: {
          ma: voucher.ma,
          loai: voucher.loai,
          giaTriGiam: voucher.giaTriGiam
        },
        sent: sentCount,
        failed: failedCount,
        total: subscribers.length
      }
    });
  } catch (error) {
    next(error);
  }
};
