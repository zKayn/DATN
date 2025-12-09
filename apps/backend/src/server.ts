import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import errorHandler from './middlewares/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import brandRoutes from './routes/brand.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';
import reviewRoutes from './routes/review.routes';
import aiRoutes from './routes/ai.routes';
import chatRoutes from './routes/chat.routes';
import uploadRoutes from './routes/upload.routes';
import paymentRoutes from './routes/payment.routes';
import settingsRoutes from './routes/settings.routes';
import voucherRoutes from './routes/voucher.routes';
import notificationRoutes from './routes/notification.routes';

// Load env vars
dotenv.config();

// Kết nối Database
connectDB();

const app: Application = express();

// Middlewares
app.use(helmet()); // Bảo mật HTTP headers
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001'
  ],
  credentials: true
}));
app.use(compression()); // Nén responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API đang hoạt động',
    timestamp: new Date().toISOString()
  });
});

// Error Handler (phải đặt cuối cùng)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
