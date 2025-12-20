import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  subscribedAt: Date;
  isActive: boolean;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster email lookups
NewsletterSchema.index({ email: 1 });

export default mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
