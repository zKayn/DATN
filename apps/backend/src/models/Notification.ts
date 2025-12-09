import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  tieuDe: string;
  noiDung: string;
  loai: 'don-hang-moi' | 'don-hang-huy' | 'danh-gia-moi' | 'khac';
  nguoiNhan: mongoose.Types.ObjectId;
  donHang?: mongoose.Types.ObjectId;
  danhGia?: mongoose.Types.ObjectId;
  daDoc: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    tieuDe: {
      type: String,
      required: true
    },
    noiDung: {
      type: String,
      required: true
    },
    loai: {
      type: String,
      enum: ['don-hang-moi', 'don-hang-huy', 'danh-gia-moi', 'khac'],
      default: 'khac'
    },
    nguoiNhan: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    donHang: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    danhGia: {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    },
    daDoc: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
NotificationSchema.index({ nguoiNhan: 1, createdAt: -1 });
NotificationSchema.index({ nguoiNhan: 1, daDoc: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
