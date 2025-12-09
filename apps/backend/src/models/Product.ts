import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  ten: string;
  tenSanPham: string; // Virtual alias
  slug: string;
  moTa: string;
  moTaChiTiet?: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  danhMuc: mongoose.Types.ObjectId;
  thuongHieu: string;
  kichThuoc: string[];
  mauSac: {
    ten: string;
    ma: string;
  }[];
  soLuongTonKho: number;
  daBan: number;
  luotXem: number;
  danhGiaTrungBinh: number;
  soLuongDanhGia: number;
  trangThai: 'active' | 'inactive';
  noiBat: boolean;
  sanPhamMoi: boolean;
  dacDiem: string[];
  thongSoKyThuat?: Record<string, string>;
  tags: string[];
  seoKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    ten: {
      type: String,
      required: [true, 'Vui lòng nhập tên sản phẩm'],
      trim: true,
      maxlength: [200, 'Tên sản phẩm không được quá 200 ký tự']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    moTa: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả sản phẩm'],
      maxlength: [500, 'Mô tả không được quá 500 ký tự']
    },
    moTaChiTiet: {
      type: String
    },
    gia: {
      type: Number,
      required: [true, 'Vui lòng nhập giá sản phẩm'],
      min: [0, 'Giá không thể âm']
    },
    giaKhuyenMai: {
      type: Number,
      min: [0, 'Giá khuyến mãi không thể âm']
    },
    hinhAnh: {
      type: [String],
      default: []
    },
    danhMuc: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Vui lòng chọn danh mục']
    },
    thuongHieu: {
      type: String,
      required: [true, 'Vui lòng nhập thương hiệu']
    },
    kichThuoc: {
      type: [String],
      default: []
    },
    mauSac: [{
      ten: {
        type: String,
        required: true
      },
      ma: {
        type: String,
        required: true
      }
    }],
    soLuongTonKho: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    daBan: {
      type: Number,
      default: 0,
      min: 0
    },
    luotXem: {
      type: Number,
      default: 0,
      min: 0
    },
    danhGiaTrungBinh: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    soLuongDanhGia: {
      type: Number,
      default: 0,
      min: 0
    },
    trangThai: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    noiBat: {
      type: Boolean,
      default: false
    },
    sanPhamMoi: {
      type: Boolean,
      default: true
    },
    dacDiem: {
      type: [String],
      default: []
    },
    thongSoKyThuat: {
      type: Map,
      of: String
    },
    tags: [String],
    seoKeywords: [String]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for backward compatibility
ProductSchema.virtual('tenSanPham').get(function() {
  return this.ten;
});

// Tạo slug tự động từ tên sản phẩm
ProductSchema.pre('save', function(next) {
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

// Indexes để tối ưu tìm kiếm
ProductSchema.index({ ten: 'text', moTa: 'text', tags: 'text' });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ danhMuc: 1 });
ProductSchema.index({ gia: 1 });
ProductSchema.index({ noiBat: -1 });
ProductSchema.index({ sanPhamMoi: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
