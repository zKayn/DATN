import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
  stack?: string;
}

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi ra console
  console.error('❌ Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'ID không hợp lệ';
    error.statusCode = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Giá trị đã tồn tại trong hệ thống';
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    error.message = errors.join(', ');
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token không hợp lệ';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token đã hết hạn';
    error.statusCode = 401;
  }

  const response: ErrorResponse = {
    success: false,
    message: error.message || 'Lỗi server',
    errors: error.errors
  };

  // Thêm stack trace trong môi trường development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

export default errorHandler;
