import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  ten: string;
  slug: string;
  moTa?: string;
  logo?: string;
  thuTu: number;
  trangThai: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    ten: {
      type: String,
      required: [true, 'Vui lòng nhập tên thương hiệu'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên thương hiệu không được quá 100 ký tự']
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
    logo: String,
    thuTu: {
      type: Number,
      default: 0
    },
    trangThai: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Tạo slug tự động từ tên thương hiệu
BrandSchema.pre('save', function(next) {
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

export default mongoose.model<IBrand>('Brand', BrandSchema);
