import mongoose from 'mongoose';

export interface IPayment extends mongoose.Document {
  donHang: mongoose.Types.ObjectId;
  nguoiDung: mongoose.Types.ObjectId;

  // Stripe IDs
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  stripeRefundId?: string;
  stripeCustomerId?: string;

  // Payment details
  soTien: number;
  tienTe: string;
  phuongThucThanhToan: 'stripe-card' | 'stripe-wallet';

  // Status
  trangThai: 'cho-thanh-toan' | 'dang-xu-ly' | 'thanh-cong' | 'that-bai' | 'da-hoan';

  // Metadata
  metadata?: {
    brand?: string;
    last4?: string;
    country?: string;
    [key: string]: any;
  };

  // Error handling
  loiMessage?: string;
  loiCode?: string;

  // Audit trail
  stripeEvents: Array<{
    type: string;
    timestamp: Date;
    data: any;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  thanhToanLuc?: Date;
}

const PaymentSchema = new mongoose.Schema<IPayment>(
  {
    donHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Stripe IDs
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    stripeChargeId: {
      type: String
    },
    stripeRefundId: {
      type: String
    },
    stripeCustomerId: {
      type: String
    },

    // Payment details
    soTien: {
      type: Number,
      required: true
    },
    tienTe: {
      type: String,
      default: 'vnd',
      uppercase: true
    },
    phuongThucThanhToan: {
      type: String,
      enum: ['stripe-card', 'stripe-wallet'],
      default: 'stripe-card'
    },

    // Status
    trangThai: {
      type: String,
      enum: ['cho-thanh-toan', 'dang-xu-ly', 'thanh-cong', 'that-bai', 'da-hoan'],
      default: 'cho-thanh-toan'
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },

    // Error handling
    loiMessage: {
      type: String
    },
    loiCode: {
      type: String
    },

    // Audit trail
    stripeEvents: [{
      type: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      data: {
        type: mongoose.Schema.Types.Mixed
      }
    }],

    // Timestamps
    thanhToanLuc: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
PaymentSchema.index({ donHang: 1 });
PaymentSchema.index({ nguoiDung: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ trangThai: 1 });
PaymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
