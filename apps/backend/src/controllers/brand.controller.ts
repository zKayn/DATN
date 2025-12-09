import { Request, Response, NextFunction } from 'express';
import Brand from '../models/Brand';

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.trangThai) {
      filter.trangThai = req.query.trangThai;
    }

    const brands = await Brand.find(filter).sort({ thuTu: 1, ten: 1 });

    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    next(error);
  }
};

export const getBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await Brand.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo thương hiệu thành công',
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thương hiệu thành công',
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    res.json({
      success: true,
      message: 'Xóa thương hiệu thành công'
    });
  } catch (error) {
    next(error);
  }
};
