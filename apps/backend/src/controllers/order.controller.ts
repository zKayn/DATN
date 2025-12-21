import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Voucher from '../models/Voucher';
import { createNotificationForAdmins, createNotificationForUser } from './notification.controller';
import { addPointsForOrder, usePoints } from '../services/point.service';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate stock availability before creating order
    for (const item of req.body.sanPham) {
      const product = await Product.findById(item.sanPham);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm với ID: ${item.sanPham}`
        });
      }

      if (product.soLuongTonKho < item.soLuong) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.ten}" chỉ còn ${product.soLuongTonKho} sản phẩm, không đủ số lượng yêu cầu (${item.soLuong})`
        });
      }
    }

    // Xử lý điểm tích lũy nếu user muốn sử dụng
    let pointsUsed = 0;
    let discountFromPoints = 0;

    if (req.body.diemSuDung && req.body.diemSuDung > 0) {
      const pointResult = await usePoints(
        req.user?._id!,
        req.body.diemSuDung
      );

      if (!pointResult.success) {
        return res.status(400).json({
          success: false,
          message: pointResult.message || 'Không thể sử dụng điểm'
        });
      }

      pointsUsed = req.body.diemSuDung;
      discountFromPoints = pointResult.discountAmount;
    }

    const orderData = {
      ...req.body,
      nguoiDung: req.user?._id,
      diemSuDung: pointsUsed,
      giamGiaTuDiem: discountFromPoints,
      lichSuTrangThai: [{
        trangThai: 'cho-xac-nhan',
        moTa: 'Đơn hàng đã được tạo',
        thoiGian: new Date()
      }]
    };

    const order = new Order(orderData);
    await order.save();

    // Cập nhật giao dịch điểm với order ID
    if (pointsUsed > 0) {
      // The transaction was already created in usePoints, just need to update with order ID
      // This is already handled in the usePoints service
    }

    // Cập nhật số lượng tồn kho (giảm tồn kho khi đặt hàng)
    // Lưu ý: daBan chỉ được tăng khi đơn hàng giao thành công (trạng thái da-giao)
    for (const item of order.sanPham) {
      await Product.findByIdAndUpdate(item.sanPham, {
        $inc: {
          soLuongTonKho: -item.soLuong
        }
      });
    }

    // Nếu có voucher, cập nhật số lượng đã sử dụng
    if (order.maGiamGia && order.maGiamGia.voucher) {
      await Voucher.findByIdAndUpdate(order.maGiamGia.voucher, {
        $inc: { daSuDung: 1 },
        $push: { nguoiDungApDung: req.user?._id }
      });
    }

    // Tạo thông báo cho admin
    await createNotificationForAdmins({
      tieuDe: 'Đơn hàng mới',
      noiDung: `Có đơn hàng mới #${order.maDonHang} với tổng giá trị ${order.tongTien.toLocaleString('vi-VN')}₫`,
      loai: 'don-hang-moi',
      donHang: order._id.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.trangThai) query.trangThaiDonHang = req.query.trangThai;
    if (req.query.status) query.trangThaiDonHang = req.query.status;

    const orders = await Order.find(query)
      .populate('nguoiDung', 'hoTen email soDienThoai')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('nguoiDung', 'hoTen email soDienThoai')
      .populate('sanPham.sanPham');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra quyền xem đơn hàng
    if (req.user?.vaiTro === 'khach-hang' && order.nguoiDung._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ nguoiDung: req.user?._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trangThai, moTa } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    order.trangThaiDonHang = trangThai;
    order.lichSuTrangThai.push({
      trangThai,
      moTa: moTa || `Đơn hàng ${trangThai}`,
      thoiGian: new Date()
    });

    if (trangThai === 'da-giao') {
      order.giaoThanhCongLuc = new Date();
      order.trangThaiThanhToan = 'da-thanh-toan';

      // Cập nhật số lượng đã bán cho các sản phẩm
      for (const item of order.sanPham) {
        await Product.findByIdAndUpdate(item.sanPham, {
          $inc: {
            daBan: item.soLuong
          }
        });
      }
      console.log(`✅ Đã cập nhật số lượng đã bán cho đơn hàng ${order.maDonHang}`);

      // Thêm điểm tích lũy cho khách hàng
      const pointResult = await addPointsForOrder(
        order.nguoiDung,
        order._id,
        order.tongThanhToan
      );

      if (pointResult.success && pointResult.points > 0) {
        console.log(`Đã thêm ${pointResult.points} điểm cho người dùng ${order.nguoiDung}`);
      }
    }

    // Xử lý trả hàng - giảm daBan và hoàn lại tồn kho
    if (trangThai === 'tra-hang') {
      for (const item of order.sanPham) {
        await Product.findByIdAndUpdate(item.sanPham, {
          $inc: {
            daBan: -item.soLuong,
            soLuongTonKho: item.soLuong
          }
        });
      }
      console.log(`✅ Đã xử lý trả hàng cho đơn hàng ${order.maDonHang}`);
    }

    await order.save();

    // Gửi thông báo cho khách hàng khi trạng thái thay đổi
    const statusNotifications: Record<string, { title: string; content: string; type: any }> = {
      'da-xac-nhan': {
        title: 'Đơn hàng đã được xác nhận',
        content: `Đơn hàng #${order.maDonHang} của bạn đã được xác nhận và đang được chuẩn bị.`,
        type: 'don-hang-xac-nhan' as const
      },
      'dang-chuan-bi': {
        title: 'Đơn hàng đang được chuẩn bị',
        content: `Đơn hàng #${order.maDonHang} của bạn đang được chuẩn bị để giao hàng.`,
        type: 'don-hang-dang-chuan-bi' as const
      },
      'dang-giao': {
        title: 'Đơn hàng đang được giao',
        content: `Đơn hàng #${order.maDonHang} của bạn đang trên đường giao đến bạn.`,
        type: 'don-hang-dang-giao' as const
      },
      'da-giao': {
        title: 'Đơn hàng đã được giao thành công',
        content: `Đơn hàng #${order.maDonHang} của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!`,
        type: 'don-hang-giao-thanh-cong' as const
      }
    };

    // Gửi thông báo nếu trạng thái có trong danh sách
    if (statusNotifications[trangThai]) {
      const notification = statusNotifications[trangThai];
      console.log(`📧 Sending notification to user ${order.nguoiDung}: ${notification.title}`);

      await createNotificationForUser({
        tieuDe: notification.title,
        noiDung: notification.content,
        loai: notification.type,
        nguoiNhan: order.nguoiDung.toString(),
        donHang: order._id.toString()
      });

      console.log(`✅ Notification sent successfully for order ${order.maDonHang}`);
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.nguoiDung.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy đơn hàng này'
      });
    }

    if (!['cho-xac-nhan', 'da-xac-nhan'].includes(order.trangThaiDonHang)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng ở trạng thái này'
      });
    }

    order.trangThaiDonHang = 'da-huy';
    order.lyDoHuy = req.body.lyDoHuy;
    order.lichSuTrangThai.push({
      trangThai: 'da-huy',
      moTa: req.body.lyDoHuy || 'Khách hàng hủy đơn',
      thoiGian: new Date()
    });

    await order.save();

    // Hoàn lại số lượng tồn kho (vì đã giảm khi tạo đơn)
    // Không cần giảm daBan vì chưa tăng (chỉ tăng khi giao thành công)
    for (const item of order.sanPham) {
      await Product.findByIdAndUpdate(item.sanPham, {
        $inc: {
          soLuongTonKho: item.soLuong
        }
      });
    }

    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Hoàn lại số lượng trước khi xóa (nếu cần)
    if (order.trangThaiDonHang !== 'da-huy') {
      for (const item of order.sanPham) {
        const updateData: any = {
          soLuongTonKho: item.soLuong
        };

        // Chỉ giảm daBan nếu đơn đã giao thành công (vì chỉ tăng daBan khi da-giao)
        if (order.trangThaiDonHang === 'da-giao') {
          updateData.daBan = -item.soLuong;
        }

        await Product.findByIdAndUpdate(item.sanPham, {
          $inc: updateData
        });
      }
    }

    // Xóa đơn hàng
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Đã xóa đơn hàng và hoàn lại tồn kho'
    });
  } catch (error) {
    next(error);
  }
};
