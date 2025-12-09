import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewData = {
      ...req.body,
      nguoiDung: req.user?._id
    };

    const review = await Review.create(reviewData);

    // Cập nhật rating trung bình của sản phẩm
    await updateProductRating(review.sanPham.toString());

    res.status(201).json({
      success: true,
      message: 'Đánh giá đã được gửi',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({
      sanPham: req.params.productId,
      trangThai: 'da-duyet'
    })
      .populate('nguoiDung', 'hoTen avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    if (review.nguoiDung.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đánh giá này'
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công',
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    if (review.nguoiDung.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa đánh giá này'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) {
      query.trangThai = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find(query)
      .populate('nguoiDung', 'hoTen email')
      .populate('sanPham', 'ten slug')
      .populate('donHang', 'maDonHang')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const approveReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { trangThai: 'da-duyet' },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Update product rating after approval
    await updateProductRating(review.sanPham.toString());

    res.json({
      success: true,
      message: 'Duyệt đánh giá thành công',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const rejectReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { trangThai: 'tu-choi' },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    res.json({
      success: true,
      message: 'Từ chối đánh giá thành công',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
async function updateProductRating(productId: string) {
  const reviews = await Review.find({
    sanPham: productId,
    trangThai: 'da-duyet'
  });

  const avgRating = reviews.reduce((acc, review) => acc + review.danhGia, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    danhGiaTrungBinh: avgRating || 0,
    soLuongDanhGia: reviews.length
  });
}
