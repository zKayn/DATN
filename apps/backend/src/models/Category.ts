import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  ten: string;
  tenDanhMuc: string; // Alias for compatibility
  slug: string;
  moTa?: string;
  hinhAnh?: string;
  danhMucCha?: mongoose.Types.ObjectId;
  loaiSanPham?: string[]; // Các loại sản phẩm con (subcategories)
  thuTu: number;
  trangThai: 'active' | 'inactive';
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    ten: {
      type: String,
      required: [true, 'Vui lòng nhập tên danh mục'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên danh mục không được quá 100 ký tự']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    moTa: {
      type: String,
      maxlength: [500, 'Mô tả không được quá 500 ký tự']
    },
    hinhAnh: String,
    danhMucCha: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    loaiSanPham: {
      type: [String],
      default: []
    },
    thuTu: {
      type: Number,
      default: 0
    },
    trangThai: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    seoTitle: String,
    seoDescription: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for backward compatibility
CategorySchema.virtual('tenDanhMuc').get(function() {
  return this.ten;
});

// Tạo slug tự động từ tên danh mục
CategorySchema.pre('save', function(next) {
  if (this.isModified('ten') && !this.slug) {
    this.slug = this.ten
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

export default mongoose.model<ICategory>('Category', CategorySchema);
