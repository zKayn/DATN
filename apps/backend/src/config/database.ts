import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);

    console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    console.log('⚠️ Server sẽ chạy nhưng các chức năng database sẽ không khả dụng');
    console.log('💡 Vui lòng kiểm tra MONGODB_URI trong file .env');
  }
};

// Xử lý disconnect
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB đã ngắt kết nối');
});

// Xử lý errors
mongoose.connection.on('error', (err) => {
  console.error('❌ Lỗi MongoDB:', err);
});

export default connectDB;
