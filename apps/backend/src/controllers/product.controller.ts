import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';

// @desc    Lấy danh sách sản phẩm
// @route   GET /api/products
// @access  Public
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Filters
    const query: any = {};

    // Filter by status
    // If trangThai is provided, use it (can be 'active', 'inactive', or 'all')
    // If not provided, default to showing only active products (for public API)
    if (req.query.trangThai) {
      if (req.query.trangThai !== 'all') {
        query.trangThai = req.query.trangThai;
      }
      // If trangThai is 'all', don't add any status filter (show all products)
    } else {
      // Default to active for public API when no status is specified
      query.trangThai = 'active';
    }

    if (req.query.danhMuc) {
      query.danhMuc = req.query.danhMuc;
    }

    if (req.query.loaiSanPham) {
      query.loaiSanPham = req.query.loaiSanPham;
    }

    if (req.query.thuongHieu) {
      query.thuongHieu = req.query.thuongHieu;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.gia = {};
      if (req.query.minPrice) query.gia.$gte = parseInt(req.query.minPrice as string);
      if (req.query.maxPrice) query.gia.$lte = parseInt(req.query.maxPrice as string);
    }

    // Special filters
    if (req.query.noiBat === 'true') {
      query.noiBat = true;
    }

    if (req.query.sanPhamMoi === 'true') {
      query.sanPhamMoi = true;
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    // Sort
    let sort: any = { createdAt: -1 };
    if (req.query.sort === 'gia') sort = { gia: 1 };
    if (req.query.sort === '-gia') sort = { gia: -1 };
    if (req.query.sort === '-daBan') sort = { daBan: -1 };
    if (req.query.sort === '-danhGiaTrungBinh') sort = { danhGiaTrungBinh: -1 };
    if (req.query.sort === '-createdAt') sort = { createdAt: -1 };

    const products = await Product.find(query)
      .populate('danhMuc', 'ten slug')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
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

// @desc    Lấy chi tiết sản phẩm
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('danhMuc', 'ten slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Tăng lượt xem
    product.luotXem += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tìm kiếm sản phẩm
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    const products = await Product.find({
      $text: { $search: q as string },
      trangThai: 'active'
    })
      .populate('danhMuc', 'ten slug')
      .limit(20);

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy sản phẩm theo slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('danhMuc', 'ten slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Tăng lượt xem
    product.luotXem += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy sản phẩm nổi bật
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find({
      noiBat: true,
      trangThai: 'active'
    })
      .populate('danhMuc', 'ten slug')
      .limit(8)
      .sort({ daBan: -1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy sản phẩm mới
// @route   GET /api/products/new
// @access  Public
export const getNewProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find({
      sanPhamMoi: true,
      trangThai: 'active'
    })
      .populate('danhMuc', 'ten slug')
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tính lại số lượng đã bán cho tất cả sản phẩm dựa trên đơn hàng thực tế
// @route   POST /api/products/recalculate-stock
// @access  Private/Admin
export const recalculateStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Order = require('../models/Order').default;

    // Lấy tất cả sản phẩm
    const products = await Product.find({});

    let updatedCount = 0;
    const results: any[] = [];

    for (const product of products) {
      // Tính tổng số lượng đã bán từ các đơn hàng KHÔNG bị hủy
      const orders = await Order.find({
        'sanPham.sanPham': product._id,
        trangThaiDonHang: { $ne: 'da-huy' } // Loại bỏ đơn đã hủy
      });

      let totalSold = 0;
      for (const order of orders) {
        const item = order.sanPham.find((item: any) =>
          item.sanPham.toString() === product._id.toString()
        );
        if (item) {
          totalSold += item.soLuong;
        }
      }

      // Lưu giá trị cũ để so sánh
      const oldSold = product.daBan;
      const oldStock = product.soLuongTonKho;

      // Tính số lượng tồn kho = số lượng tồn kho hiện tại + (số đã bán cũ - số đã bán mới)
      // Công thức: Tồn kho ban đầu = Tồn kho hiện tại + Đã bán
      // Tồn kho mới = Tồn kho ban đầu - Đã bán mới
      const initialStock = oldStock + oldSold;
      const newStock = initialStock - totalSold;

      // Cập nhật
      product.daBan = totalSold;
      product.soLuongTonKho = Math.max(0, newStock); // Không cho âm
      await product.save();

      if (oldSold !== totalSold || oldStock !== newStock) {
        updatedCount++;
        results.push({
          productId: product._id,
          productName: product.ten,
          oldSold,
          newSold: totalSold,
          oldStock,
          newStock: Math.max(0, newStock),
          difference: totalSold - oldSold
        });
      }
    }

    res.json({
      success: true,
      message: `Đã tính lại tồn kho cho ${updatedCount} sản phẩm`,
      data: {
        totalProducts: products.length,
        updatedProducts: updatedCount,
        details: results
      }
    });
  } catch (error) {
    next(error);
  }
};
