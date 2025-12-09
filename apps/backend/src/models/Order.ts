import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  maDonHang: string;
  nguoiDung: mongoose.Types.ObjectId;
  sanPham: {
    sanPham: mongoose.Types.ObjectId;
    tenSanPham: string;
    hinhAnh: string;
    gia: number;
    soLuong: number;
    size?: string;
    mauSac?: string;
    thanhTien: number;
  }[];
  tongTien: number;
  phiVanChuyen: number;
  giamGia: number;
  maGiamGia?: {
    voucher: mongoose.Types.ObjectId;
    ma: string;
    giaTriGiam: number;
  };
  tongThanhToan: number;
  diaChiGiaoHang: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
  };
  phuongThucThanhToan: 'cod' | 'vnpay' | 'momo' | 'the-atm';
  trangThaiThanhToan: 'chua-thanh-toan' | 'da-thanh-toan' | 'hoan-tien';
  trangThaiDonHang: 'cho-xac-nhan' | 'da-xac-nhan' | 'dang-chuan-bi' | 'dang-giao' | 'da-giao' | 'da-huy' | 'tra-hang';
  ghiChu?: string;
  lyDoHuy?: string;
  thanhToanLuc?: Date;
  giaoDuKienLuc?: Date;
  giaoThanhCongLuc?: Date;
  lichSuTrangThai: {
    trangThai: string;
    moTa: string;
    thoiGian: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    maDonHang: {
      type: String,
      unique: true
    },
    nguoiDung: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sanPham: [{
      sanPham: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      tenSanPham: {
        type: String,
        required: true
      },
      hinhAnh: {
        type: String,
        required: true
      },
      gia: {
        type: Number,
        required: true
      },
      soLuong: {
        type: Number,
        required: true,
        min: 1
      },
      size: String,
      mauSac: String,
      thanhTien: {
        type: Number,
        required: true
      }
    }],
    tongTien: {
      type: Number,
      required: true
    },
    phiVanChuyen: {
      type: Number,
      default: 0
    },
    giamGia: {
      type: Number,
      default: 0
    },
    maGiamGia: {
      voucher: {
        type: Schema.Types.ObjectId,
        ref: 'Voucher'
      },
      ma: String,
      giaTriGiam: Number
    },
    tongThanhToan: {
      type: Number,
      required: true
    },
    diaChiGiaoHang: {
      hoTen: {
        type: String,
        required: true
      },
      soDienThoai: {
        type: String,
        required: true
      },
      tinh: {
        type: String,
        required: true
      },
      huyen: {
        type: String,
        required: true
      },
      xa: {
        type: String,
        required: true
      },
      diaChiChiTiet: {
        type: String,
        required: true
      }
    },
    phuongThucThanhToan: {
      type: String,
      enum: ['cod', 'vnpay', 'momo', 'the-atm'],
      required: true
    },
    trangThaiThanhToan: {
      type: String,
      enum: ['chua-thanh-toan', 'da-thanh-toan', 'hoan-tien'],
      default: 'chua-thanh-toan'
    },
    trangThaiDonHang: {
      type: String,
      enum: ['cho-xac-nhan', 'da-xac-nhan', 'dang-chuan-bi', 'dang-giao', 'da-giao', 'da-huy', 'tra-hang'],
      default: 'cho-xac-nhan'
    },
    ghiChu: String,
    lyDoHuy: String,
    thanhToanLuc: Date,
    giaoDuKienLuc: Date,
    giaoThanhCongLuc: Date,
    lichSuTrangThai: [{
      trangThai: String,
      moTa: String,
      thoiGian: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Virtual field for backwards compatibility: trangThai -> trangThaiDonHang
OrderSchema.virtual('trangThai').get(function() {
  return this.trangThaiDonHang;
});

// Ensure virtuals are included when converting to JSON
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

// Tạo mã đơn hàng tự động
OrderSchema.pre('save', async function(next) {
  if (!this.maDonHang) {
    const count = await mongoose.model('Order').countDocuments();
    this.maDonHang = `DH${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);
