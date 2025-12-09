import mongoose, { Document, Schema } from 'mongoose';

export interface IVoucher extends Document {
  ma: string; // Mã voucher (VD: SALE50, FREESHIP)
  loai: 'phan-tram' | 'so-tien'; // Loại giảm giá
  giaTriGiam: number; // Giá trị giảm (% hoặc số tiền)
  giamToiDa?: number; // Giảm tối đa (cho loại %)
  donToiThieu: number; // Đơn hàng tối thiểu
  soLuong: number; // Số lượng voucher
  daSuDung: number; // Số lượng đã sử dụng
  ngayBatDau: Date; // Ngày bắt đầu
  ngayKetThuc: Date; // Ngày kết thúc
  moTa?: string; // Mô tả voucher
  trangThai: 'hoat-dong' | 'tam-dung' | 'het-han'; // Trạng thái
  nguoiDungApDung: string[]; // Danh sách user ID đã sử dụng
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>(
  {
    ma: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    loai: {
      type: String,
      enum: ['phan-tram', 'so-tien'],
      required: true
    },
    giaTriGiam: {
      type: Number,
      required: true,
      min: 0
    },
    giamToiDa: {
      type: Number,
      min: 0
    },
    donToiThieu: {
      type: Number,
      default: 0,
      min: 0
    },
    soLuong: {
      type: Number,
      required: true,
      min: 0
    },
    daSuDung: {
      type: Number,
      default: 0,
      min: 0
    },
    ngayBatDau: {
      type: Date,
      required: true
    },
    ngayKetThuc: {
      type: Date,
      required: true
    },
    moTa: {
      type: String,
      trim: true
    },
    trangThai: {
      type: String,
      enum: ['hoat-dong', 'tam-dung', 'het-han'],
      default: 'hoat-dong'
    },
    nguoiDungApDung: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

// Validate ngày kết thúc phải sau ngày bắt đầu
voucherSchema.pre('save', function(next) {
  if (this.ngayKetThuc <= this.ngayBatDau) {
    next(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
  }

  // Validate giá trị giảm % không quá 100
  if (this.loai === 'phan-tram' && this.giaTriGiam > 100) {
    next(new Error('Giá trị giảm % không được vượt quá 100'));
  }

  next();
});

// Tự động cập nhật trạng thái hết hạn
voucherSchema.methods.kiemTraHetHan = function() {
  const now = new Date();
  if (now > this.ngayKetThuc) {
    this.trangThai = 'het-han';
  }
  return this.trangThai === 'het-han';
};

export default mongoose.model<IVoucher>('Voucher', voucherSchema);
