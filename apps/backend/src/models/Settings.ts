import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeLogo: string;
  storeDescription: string;
  currency: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  emailNotifications: boolean;
  orderNotifications: boolean;
  reviewNotifications: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  paymentMethods: {
    cod: boolean;
    stripe: boolean;
    bankTransfer: boolean;
    payos: boolean;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, required: true, default: 'Sport Store' },
    storeEmail: { type: String, required: true, default: 'contact@sportstore.vn' },
    storePhone: { type: String, required: true, default: '0123456789' },
    storeAddress: { type: String, required: true, default: 'Hà Nội, Việt Nam' },
    storeLogo: { type: String, default: '' },
    storeDescription: { type: String, default: 'Cửa hàng thể thao hàng đầu Việt Nam' },
    currency: { type: String, default: 'VND' },
    taxRate: { type: Number, default: 10 },
    shippingFee: { type: Number, default: 30000 },
    freeShippingThreshold: { type: Number, default: 500000 },
    emailNotifications: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    reviewNotifications: { type: Boolean, default: true },
    lowStockAlert: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 },
    maintenanceMode: { type: Boolean, default: false },
    paymentMethods: {
      cod: { type: Boolean, default: true },
      stripe: { type: Boolean, default: true },
      bankTransfer: { type: Boolean, default: false },
      payos: { type: Boolean, default: true }
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      tiktok: { type: String, default: '' }
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      metaKeywords: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
