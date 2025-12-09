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
  lichSuTimKiem: string[];
  createdAt: Date;
  updatedAt: Date;
  soSanhMatKhau(matKhauNhap: string): Promise<boolean>;
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
    lichSuTimKiem: [String]
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

export default mongoose.model<IUser>('User', UserSchema);
