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
  diemSuDung?: number;
  giamGiaTuDiem?: number;
  tongThanhToan: number;
  diaChiGiaoHang: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
  };
  phuongThucThanhToan: 'cod' | 'stripe' | 'the-atm' | 'payos';
  trangThaiThanhToan: 'chua-thanh-toan' | 'da-thanh-toan' | 'hoan-tien' | 'that-bai' | 'da-huy';
  trangThaiDonHang: 'cho-xac-nhan' | 'da-xac-nhan' | 'dang-chuan-bi' | 'dang-giao' | 'da-giao' | 'da-huy' | 'tra-hang' | 'dang-xu-ly';
  ghiChu?: string;
  lyDoHuy?: string;
  stripePaymentId?: mongoose.Types.ObjectId;
  payosOrderCode?: number;
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
    diemSuDung: {
      type: Number,
      default: 0
    },
    giamGiaTuDiem: {
      type: Number,
      default: 0
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
      enum: ['cod', 'stripe', 'the-atm', 'payos'],
      required: true
    },
    stripePaymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment'
    },
    payosOrderCode: {
      type: Number
    },
    trangThaiThanhToan: {
      type: String,
      enum: ['chua-thanh-toan', 'da-thanh-toan', 'hoan-tien', 'that-bai', 'da-huy'],
      default: 'chua-thanh-toan'
    },
    trangThaiDonHang: {
      type: String,
      enum: ['cho-xac-nhan', 'da-xac-nhan', 'dang-chuan-bi', 'dang-giao', 'da-giao', 'da-huy', 'tra-hang', 'dang-xu-ly'],
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

// Helper function to generate random order code
function generateOrderCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'DH';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Tạo mã đơn hàng tự động
OrderSchema.pre('save', async function(next) {
  if (!this.maDonHang) {
    // Generate unique order code
    let orderCode = generateOrderCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Check for uniqueness (very rare collision with 36^8 possibilities)
    while (attempts < maxAttempts) {
      const existing = await mongoose.model('Order').findOne({ maDonHang: orderCode });
      if (!existing) {
        break;
      }
      orderCode = generateOrderCode();
      attempts++;
    }

    this.maDonHang = orderCode;
  }
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);
