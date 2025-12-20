import { Request, Response, NextFunction } from 'express';
import { getPointHistory, calculateDiscountFromPoints } from '../services/point.service';
import User from '../models/User';

/**
 * Lấy thông tin điểm tích lũy của người dùng
 */
export const getMyPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).select('diemTichLuy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: {
        diemTichLuy: user.diemTichLuy || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy lịch sử giao dịch điểm
 */
export const getMyPointHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await getPointHistory(req.user?._id!, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tính toán số tiền giảm giá từ điểm
 */
export const calculateDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số điểm phải lớn hơn 0'
      });
    }

    const user = await User.findById(req.user?._id).select('diemTichLuy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (user.diemTichLuy < points) {
      return res.status(400).json({
        success: false,
        message: `Không đủ điểm. Số dư hiện tại: ${user.diemTichLuy} điểm`
      });
    }

    const discountAmount = calculateDiscountFromPoints(points);

    res.json({
      success: true,
      data: {
        points,
        discountAmount,
        currentBalance: user.diemTichLuy
      }
    });
  } catch (error) {
    next(error);
  }
};
