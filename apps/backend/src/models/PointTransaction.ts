import mongoose, { Schema, Document } from 'mongoose';

export interface IPointTransaction extends Document {
  nguoiDung: mongoose.Types.ObjectId;
  loai: 'cong' | 'tru';
  soLuong: number;
  moTa: string;
  donHang?: mongoose.Types.ObjectId;
  soDuSau: number;
  createdAt: Date;
  updatedAt: Date;
}

const PointTransactionSchema = new Schema<IPointTransaction>(
  {
    nguoiDung: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người dùng là bắt buộc'],
      index: true
    },
    loai: {
      type: String,
      enum: ['cong', 'tru'],
      required: [true, 'Loại giao dịch là bắt buộc']
    },
    soLuong: {
      type: Number,
      required: [true, 'Số lượng điểm là bắt buộc'],
      min: [0, 'Số lượng điểm phải lớn hơn 0']
    },
    moTa: {
      type: String,
      required: [true, 'Mô tả là bắt buộc'],
      trim: true
    },
    donHang: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    soDuSau: {
      type: Number,
      required: [true, 'Số dư sau giao dịch là bắt buộc'],
      min: [0, 'Số dư không được âm']
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
PointTransactionSchema.index({ nguoiDung: 1, createdAt: -1 });
PointTransactionSchema.index({ donHang: 1 });

export default mongoose.model<IPointTransaction>('PointTransaction', PointTransactionSchema);
