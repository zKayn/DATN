import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  sanPham: mongoose.Types.ObjectId;
  nguoiDung: mongoose.Types.ObjectId;
  donHang: mongoose.Types.ObjectId;
  danhGia: number;
  tieuDe: string;
  noiDung: string;
  hinhAnh?: string[];
  phanHoi?: {
    noiDung: string;
    nguoiPhanHoi: mongoose.Types.ObjectId;
    thoiGian: Date;
  };
  huuIch: number;
  trangThai: 'cho-duyet' | 'da-duyet' | 'tu-choi';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    sanPham: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    nguoiDung: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    donHang: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    danhGia: {
      type: Number,
      required: [true, 'Vui lòng đánh giá sao'],
      min: 1,
      max: 5
    },
    tieuDe: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề đánh giá'],
      maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
    },
    noiDung: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung đánh giá'],
      maxlength: [1000, 'Nội dung không được quá 1000 ký tự']
    },
    hinhAnh: [String],
    phanHoi: {
      noiDung: String,
      nguoiPhanHoi: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      thoiGian: Date
    },
    huuIch: {
      type: Number,
      default: 0
    },
    trangThai: {
      type: String,
      enum: ['cho-duyet', 'da-duyet', 'tu-choi'],
      default: 'cho-duyet'
    }
  },
  {
    timestamps: true
  }
);

// Một user chỉ được đánh giá 1 lần cho mỗi sản phẩm trong 1 đơn hàng
ReviewSchema.index({ sanPham: 1, nguoiDung: 1, donHang: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
