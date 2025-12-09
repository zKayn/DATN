import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all categories or filter by status if provided
    const filter: any = {};
    if (req.query.trangThai) {
      filter.trangThai = req.query.trangThai;
    }

    const categories = await Category.find(filter)
      .populate('danhMucCha')
      .sort({ thuTu: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findById(req.params.id).populate('danhMucCha');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).populate('danhMucCha');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    next(error);
  }
};
