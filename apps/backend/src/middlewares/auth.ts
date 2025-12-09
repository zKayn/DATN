import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
}

// Bảo vệ routes - yêu cầu đăng nhập
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Lấy token từ header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Kiểm tra token có tồn tại không
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      // Lấy thông tin user
      const user = await User.findById(decoded.id).select('-matKhau');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      if (user.trangThai === 'khoa') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản của bạn đã bị khóa'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Phân quyền
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    if (!roles.includes(req.user.vaiTro)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập'
      });
    }

    next();
  };
};
