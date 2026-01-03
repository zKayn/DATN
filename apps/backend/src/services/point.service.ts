import User from '../models/User';
import Order from '../models/Order';
import PointTransaction from '../models/PointTransaction';
import mongoose from 'mongoose';

// Tỷ lệ quy đổi điểm: 10,000 VND = 1 điểm
const POINT_RATE = 10000;

// Giá trị quy đổi: 1 điểm = 1,000 VND giảm giá
const POINT_VALUE = 1000;

/**
 * Tính điểm tích lũy từ số tiền đơn hàng
 * @param amount Số tiền đơn hàng (VND)
 * @returns Số điểm được tích lũy
 */
export const calculatePointsFromAmount = (amount: number): number => {
  return Math.floor(amount / POINT_RATE);
};

/**
 * Tính số tiền giảm giá từ điểm tích lũy
 * @param points Số điểm muốn sử dụng
 * @returns Số tiền giảm giá (VND)
 */
export const calculateDiscountFromPoints = (points: number): number => {
  return points * POINT_VALUE;
};

/**
 * Thêm điểm tích lũy cho người dùng sau khi hoàn thành đơn hàng
 * @param userId ID người dùng
 * @param orderId ID đơn hàng
 * @param orderAmount Số tiền đơn hàng
 * @returns Promise<{ success: boolean, points: number, newBalance: number }>
 */
export const addPointsForOrder = async (
  userId: string | mongoose.Types.ObjectId,
  orderId: string | mongoose.Types.ObjectId,
  orderAmount: number
): Promise<{ success: boolean; points: number; newBalance: number; message?: string }> => {
  try {
    // Tính điểm được tích lũy
    const points = calculatePointsFromAmount(orderAmount);

    if (points === 0) {
      return {
        success: true,
        points: 0,
        newBalance: 0,
        message: 'Đơn hàng chưa đủ giá trị để nhận điểm'
      };
    }

    // Lấy thông tin đơn hàng để có mã đơn hàng
    const order = await Order.findById(orderId);
    const orderCode = order?.maDonHang || orderId.toString();

    // Cập nhật điểm cho user
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { diemTichLuy: points } },
      { new: true }
    );

    if (!user) {
      return {
        success: false,
        points: 0,
        newBalance: 0,
        message: 'Không tìm thấy người dùng'
      };
    }

    // Tạo bản ghi giao dịch điểm
    await PointTransaction.create({
      nguoiDung: userId,
      loai: 'cong',
      soLuong: points,
      moTa: `Nhận điểm từ đơn hàng #${orderCode}`,
      donHang: orderId,
      soDuSau: user.diemTichLuy
    });

    return {
      success: true,
      points,
      newBalance: user.diemTichLuy
    };
  } catch (error) {
    console.error('Lỗi khi thêm điểm:', error);
    return {
      success: false,
      points: 0,
      newBalance: 0,
      message: 'Có lỗi xảy ra khi thêm điểm'
    };
  }
};

/**
 * Sử dụng điểm tích lũy để giảm giá
 * @param userId ID người dùng
 * @param pointsToUse Số điểm muốn sử dụng
 * @param orderId ID đơn hàng (optional)
 * @returns Promise<{ success: boolean, discountAmount: number, newBalance: number }>
 */
export const usePoints = async (
  userId: string | mongoose.Types.ObjectId,
  pointsToUse: number,
  orderId?: string | mongoose.Types.ObjectId
): Promise<{ success: boolean; discountAmount: number; newBalance: number; message?: string }> => {
  try {
    // Kiểm tra số điểm hợp lệ
    if (pointsToUse <= 0) {
      return {
        success: false,
        discountAmount: 0,
        newBalance: 0,
        message: 'Số điểm sử dụng phải lớn hơn 0'
      };
    }

    // Lấy thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        discountAmount: 0,
        newBalance: 0,
        message: 'Không tìm thấy người dùng'
      };
    }

    // Kiểm tra số dư điểm
    if (user.diemTichLuy < pointsToUse) {
      return {
        success: false,
        discountAmount: 0,
        newBalance: user.diemTichLuy,
        message: `Không đủ điểm. Số dư hiện tại: ${user.diemTichLuy} điểm`
      };
    }

    // Trừ điểm
    user.diemTichLuy -= pointsToUse;
    await user.save();

    // Tính số tiền giảm giá
    const discountAmount = calculateDiscountFromPoints(pointsToUse);

    // Lấy mã đơn hàng nếu có orderId
    let orderCode = '';
    if (orderId) {
      const order = await Order.findById(orderId);
      orderCode = order?.maDonHang || orderId.toString();
    }

    // Tạo bản ghi giao dịch điểm
    await PointTransaction.create({
      nguoiDung: userId,
      loai: 'tru',
      soLuong: pointsToUse,
      moTa: orderId
        ? `Sử dụng điểm cho đơn hàng #${orderCode}`
        : 'Sử dụng điểm tích lũy',
      donHang: orderId,
      soDuSau: user.diemTichLuy
    });

    return {
      success: true,
      discountAmount,
      newBalance: user.diemTichLuy
    };
  } catch (error) {
    console.error('Lỗi khi sử dụng điểm:', error);
    return {
      success: false,
      discountAmount: 0,
      newBalance: 0,
      message: 'Có lỗi xảy ra khi sử dụng điểm'
    };
  }
};

/**
 * Lấy lịch sử giao dịch điểm của người dùng
 * @param userId ID người dùng
 * @param limit Giới hạn số bản ghi
 * @returns Promise<PointTransaction[]>
 */
export const getPointHistory = async (
  userId: string | mongoose.Types.ObjectId,
  limit: number = 50
): Promise<any[]> => {
  try {
    const history = await PointTransaction.find({ nguoiDung: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('donHang', 'maDonHang tongThanhToan')
      .lean();

    return history;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử điểm:', error);
    return [];
  }
};

export default {
  calculatePointsFromAmount,
  calculateDiscountFromPoints,
  addPointsForOrder,
  usePoints,
  getPointHistory,
  POINT_RATE,
  POINT_VALUE
};
