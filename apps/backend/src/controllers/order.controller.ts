import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Voucher from '../models/Voucher';
import { createNotificationForAdmins } from './notification.controller';

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

    const orderData = {
      ...req.body,
      nguoiDung: req.user?._id,
      lichSuTrangThai: [{
        trangThai: 'cho-xac-nhan',
        moTa: 'Đơn hàng đã được tạo',
        thoiGian: new Date()
      }]
    };

    const order = new Order(orderData);
    await order.save();

    // Cập nhật số lượng tồn kho và số lượng đã bán
    for (const item of order.sanPham) {
      await Product.findByIdAndUpdate(item.sanPham, {
        $inc: {
          daBan: item.soLuong,
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
    }

    await order.save();

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

    // Hoàn lại số lượng tồn kho
    for (const item of order.sanPham) {
      await Product.findByIdAndUpdate(item.sanPham, {
        $inc: {
          daBan: -item.soLuong,
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

    // Chỉ cho phép xóa đơn đã hủy
    if (order.trangThaiDonHang !== 'da-huy') {
      // Nếu đơn chưa hủy, hoàn lại tồn kho trước khi xóa
      for (const item of order.sanPham) {
        await Product.findByIdAndUpdate(item.sanPham, {
          $inc: {
            daBan: -item.soLuong,
            soLuongTonKho: item.soLuong
          }
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
