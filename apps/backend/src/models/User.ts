import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai?: string;
  avatar?: string;
  anhDaiDien?: string;
  diaChi?: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
    macDinh: boolean;
  }[];
  vaiTro: 'khach-hang' | 'nhan-vien' | 'quan-tri';
  trangThai: 'hoat-dong' | 'khoa';
  gioiTinh?: 'nam' | 'nu' | 'khac';
  ngaySinh?: Date;
  danhSachYeuThich: mongoose.Types.ObjectId[];
  gioHang: {
    sanPham: mongoose.Types.ObjectId;
    ten: string;
    slug: string;
    hinhAnh: string;
    gia: number;
    giaKhuyenMai?: number;
    kichThuoc: string;
    mauSac: string;
    soLuong: number;
    tonKho: number;
  }[];
  lichSuTimKiem: string[];
  diemTichLuy: number;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  soSanhMatKhau(matKhauNhap: string): Promise<boolean>;
  taoResetPasswordToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    hoTen: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
      maxlength: [100, 'Họ tên không được quá 100 ký tự']
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    matKhau: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false
    },
    soDienThoai: {
      type: String,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
    },
    anhDaiDien: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
    },
    diaChi: [{
      hoTen: { type: String, required: true },
      soDienThoai: { type: String, required: true },
      tinh: { type: String, required: true },
      huyen: { type: String, required: true },
      xa: { type: String, required: true },
      diaChiChiTiet: { type: String, required: true },
      macDinh: { type: Boolean, default: false }
    }],
    vaiTro: {
      type: String,
      enum: ['khach-hang', 'nhan-vien', 'quan-tri'],
      default: 'khach-hang'
    },
    trangThai: {
      type: String,
      enum: ['hoat-dong', 'khoa'],
      default: 'hoat-dong'
    },
    gioiTinh: {
      type: String,
      enum: ['nam', 'nu', 'khac']
    },
    ngaySinh: Date,
    danhSachYeuThich: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    gioHang: [{
      sanPham: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      ten: { type: String, required: true },
      slug: { type: String, required: true },
      hinhAnh: { type: String, required: true },
      gia: { type: Number, required: true },
      giaKhuyenMai: { type: Number },
      kichThuoc: { type: String, required: true },
      mauSac: { type: String, required: true },
      soLuong: {
        type: Number,
        required: true,
        min: [1, 'Số lượng phải lớn hơn 0']
      },
      tonKho: { type: Number, required: true }
    }],
    lichSuTimKiem: [String],
    diemTichLuy: {
      type: Number,
      default: 0,
      min: [0, 'Điểm tích lũy không được âm']
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre('save', async function(next) {
  if (!this.isModified('matKhau')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.matKhau = await bcrypt.hash(this.matKhau, salt);
});

// So sánh mật khẩu
UserSchema.methods.soSanhMatKhau = async function(matKhauNhap: string): Promise<boolean> {
  return await bcrypt.compare(matKhauNhap, this.matKhau);
};

// Tạo reset password token
UserSchema.methods.taoResetPasswordToken = function(): string {
  // Tạo token ngẫu nhiên
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Hash token và lưu vào database
  this.resetPasswordToken = bcrypt.hashSync(resetToken, 10);

  // Set thời gian hết hạn (30 phút)
  this.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);

  return resetToken;
};

export default mongoose.model<IUser>('User', UserSchema);
