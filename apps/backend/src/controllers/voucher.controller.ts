import { Request, Response } from 'express';
import Voucher from '../models/Voucher';

// Lấy danh sách voucher (Admin)
export const getVouchers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, trangThai } = req.query;
    const query: any = {};

    if (trangThai) {
      query.trangThai = trangThai;
    }

    const vouchers = await Voucher.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Voucher.countDocuments(query);

    res.status(200).json({
      success: true,
      data: vouchers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error getting vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách voucher',
      error: error.message
    });
  }
};

// Lấy voucher theo ID (Admin)
export const getVoucherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: voucher
    });
  } catch (error: any) {
    console.error('Error getting voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải voucher',
      error: error.message
    });
  }
};

// Kiểm tra voucher (Public - cho customer)
export const kiemTraVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ma, tongTien } = req.body;
    const userId = req.user?._id;

    if (!ma) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã voucher'
      });
      return;
    }

    const voucher = await Voucher.findOne({ ma: ma.toUpperCase() });

    if (!voucher) {
      res.status(404).json({
        success: false,
        message: 'Mã voucher không tồn tại'
      });
      return;
    }

    // Kiểm tra trạng thái
    if (voucher.trangThai !== 'hoat-dong') {
      res.status(400).json({
        success: false,
        message: 'Mã voucher không khả dụng'
      });
      return;
    }

    // Kiểm tra hạn sử dụng
    const now = new Date();
    if (now < voucher.ngayBatDau) {
      res.status(400).json({
        success: false,
        message: 'Mã voucher chưa đến thời gian sử dụng'
      });
      return;
    }

    if (now > voucher.ngayKetThuc) {
      // Tự động cập nhật trạng thái
      voucher.trangThai = 'het-han';
      await voucher.save();

      res.status(400).json({
        success: false,
        message: 'Mã voucher đã hết hạn'
      });
      return;
    }

    // Kiểm tra số lượng
    if (voucher.daSuDung >= voucher.soLuong) {
      res.status(400).json({
        success: false,
        message: 'Mã voucher đã hết lượt sử dụng'
      });
      return;
    }

    // Kiểm tra user đã sử dụng chưa (nếu có userId)
    if (userId && voucher.nguoiDungApDung.includes(userId.toString())) {
      res.status(400).json({
        success: false,
        message: 'Bạn đã sử dụng mã voucher này rồi'
      });
      return;
    }

    // Kiểm tra đơn tối thiểu
    if (tongTien < voucher.donToiThieu) {
      res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${voucher.donToiThieu.toLocaleString('vi-VN')}₫ để sử dụng mã này`
      });
      return;
    }

    // Tính giá trị giảm
    let giaTriGiam = 0;
    if (voucher.loai === 'phan-tram') {
      giaTriGiam = (tongTien * voucher.giaTriGiam) / 100;
      if (voucher.giamToiDa && giaTriGiam > voucher.giamToiDa) {
        giaTriGiam = voucher.giamToiDa;
      }
    } else {
      giaTriGiam = voucher.giaTriGiam;
    }

    res.status(200).json({
      success: true,
      message: 'Áp dụng mã voucher thành công',
      data: {
        voucher: {
          _id: voucher._id,
          ma: voucher.ma,
          loai: voucher.loai,
          giaTriGiam: voucher.giaTriGiam,
          moTa: voucher.moTa
        },
        giaTriGiamThucTe: giaTriGiam
      }
    });
  } catch (error: any) {
    console.error('Error checking voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra voucher',
      error: error.message
    });
  }
};

// Tạo voucher mới (Admin)
export const createVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const voucher = await Voucher.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo voucher thành công',
      data: voucher
    });
  } catch (error: any) {
    console.error('Error creating voucher:', error);

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Mã voucher đã tồn tại'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tạo voucher',
      error: error.message
    });
  }
};

// Cập nhật voucher (Admin)
export const updateVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!voucher) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật voucher thành công',
      data: voucher
    });
  } catch (error: any) {
    console.error('Error updating voucher:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể cập nhật voucher',
      error: error.message
    });
  }
};

// Xóa voucher (Admin)
export const deleteVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);

    if (!voucher) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Xóa voucher thành công'
    });
  } catch (error: any) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa voucher',
      error: error.message
    });
  }
};

// Lấy danh sách voucher khả dụng (Customer)
export const getAvailableVouchers = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    const vouchers = await Voucher.find({
      trangThai: 'hoat-dong',
      ngayBatDau: { $lte: now },
      ngayKetThuc: { $gte: now },
      $expr: { $lt: ['$daSuDung', '$soLuong'] }
    })
      .select('-nguoiDungApDung')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: vouchers
    });
  } catch (error: any) {
    console.error('Error getting available vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách voucher',
      error: error.message
    });
  }
};
