import { Request, Response } from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment';
import Order from '../models/Order';
import Product from '../models/Product';
import Voucher from '../models/Voucher';
import { createNotificationForUser } from './notification.controller';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

// Create Payment Intent
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, currency = 'vnd' } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validate order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    if (order.nguoiDung.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thanh toán đơn hàng này'
      });
    }

    // Check order not already paid
    if (order.trangThaiThanhToan === 'da-thanh-toan') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được thanh toán'
      });
    }

    // Validate amount matches order total
    if (Math.abs(order.tongThanhToan - amount) > 1) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền không khớp với tổng đơn hàng'
      });
    }

    // Create Stripe Payment Intent
    // VND is a zero-decimal currency, so use amount as-is (do NOT multiply by 100)
    // For VND: 1,000,000 VND = amount: 1000000
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        metadata: {
          orderId: orderId,
          userId: userId.toString(),
          orderCode: order.maDonHang
        },
        automatic_payment_methods: {
          enabled: true
        }
      },
      {
        idempotencyKey: `order_${orderId}_${Date.now()}`
      }
    );

    // Create Payment record
    const payment = await Payment.create({
      donHang: orderId,
      nguoiDung: userId,
      stripePaymentIntentId: paymentIntent.id,
      soTien: amount,
      tienTe: currency.toUpperCase(),
      phuongThucThanhToan: 'stripe-card',
      trangThai: 'cho-thanh-toan',
      stripeEvents: [{
        type: 'payment_intent.created',
        timestamp: new Date(),
        data: paymentIntent
      }]
    });

    // Update order with payment reference
    order.stripePaymentId = payment._id;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment._id
      }
    });

  } catch (error: any) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tạo payment intent'
    });
  }
};

// Confirm Payment
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Find payment by payment intent ID
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment record
      payment.trangThai = 'thanh-cong';
      payment.thanhToanLuc = new Date();
      if (paymentIntent.latest_charge) {
        payment.stripeChargeId = paymentIntent.latest_charge as string;
      }

      // Extract payment method details
      if (paymentIntent.payment_method) {
        const paymentMethod = await stripe.paymentMethods.retrieve(
          paymentIntent.payment_method as string
        );

        payment.metadata = {
          brand: paymentMethod.card?.brand || undefined,
          last4: paymentMethod.card?.last4 || undefined,
          country: paymentMethod.card?.country || undefined
        };
      }

      payment.stripeEvents.push({
        type: 'payment_confirmed',
        timestamp: new Date(),
        data: paymentIntent
      });

      await payment.save();

      // Update order
      const order = await Order.findById(payment.donHang);
      if (order) {
        order.trangThaiThanhToan = 'da-thanh-toan';
        order.thanhToanLuc = new Date();
        await order.save();
      }

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          paymentId: payment._id,
          orderId: payment.donHang,
          status: payment.trangThai
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment not successful. Status: ${paymentIntent.status}`
      });
    }

  } catch (error: any) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể xác nhận thanh toán'
    });
  }
};

// Webhook Handler
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('Missing stripe-signature header');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntentSucceeded);
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntentFailed);
        break;

      case 'charge.refunded':
        const chargeRefunded = event.data.object as Stripe.Charge;
        await handleChargeRefunded(chargeRefunded);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return 200 response to acknowledge receipt of the event
    res.json({ received: true });

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper: Handle Payment Intent Succeeded
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });

  if (!payment) {
    console.error('Payment not found for payment intent:', paymentIntent.id);
    return;
  }

  // Update payment status
  payment.trangThai = 'thanh-cong';
  payment.thanhToanLuc = new Date();
  if (paymentIntent.latest_charge) {
    payment.stripeChargeId = paymentIntent.latest_charge as string;
  }

  // Extract payment method details
  if (paymentIntent.payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string
      );

      payment.metadata = {
        brand: paymentMethod.card?.brand || undefined,
        last4: paymentMethod.card?.last4 || undefined,
        country: paymentMethod.card?.country || undefined
      };
    } catch (error) {
      console.error('Error retrieving payment method:', error);
    }
  }

  payment.stripeEvents.push({
    type: 'payment_intent.succeeded',
    timestamp: new Date(),
    data: paymentIntent
  });

  await payment.save();

  // Update order
  const order = await Order.findById(payment.donHang).populate('sanPham.sanPham');

  if (order) {
    // Update order payment status
    order.trangThaiThanhToan = 'da-thanh-toan';
    order.thanhToanLuc = new Date();

    // Add status history
    order.lichSuTrangThai.push({
      trangThai: 'da-thanh-toan',
      moTa: 'Thanh toán qua Stripe thành công',
      thoiGian: new Date()
    });

    await order.save();

    // Deduct stock for each product
    for (const item of order.sanPham) {
      await Product.findByIdAndUpdate(item.sanPham, {
        $inc: { soLuongTonKho: -item.soLuong }
      });
    }

    // Update voucher usage if applicable
    if (order.maGiamGia && order.maGiamGia.voucher) {
      await Voucher.findByIdAndUpdate(order.maGiamGia.voucher, {
        $inc: { daSuDung: 1 },
        $push: { nguoiDungApDung: order.nguoiDung }
      });
    }

    // Create notification for user
    try {
      await createNotificationForUser({
        nguoiNhan: order.nguoiDung.toString(),
        tieuDe: 'Thanh toán thành công',
        noiDung: `Đơn hàng ${order.maDonHang} đã được thanh toán thành công qua Stripe.`,
        loai: 'don-hang-xac-nhan',
        donHang: order._id.toString()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}

// Helper: Handle Payment Intent Failed
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });

  if (!payment) {
    console.error('Payment not found for payment intent:', paymentIntent.id);
    return;
  }

  // Update payment status
  payment.trangThai = 'that-bai';
  payment.loiMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
  payment.loiCode = paymentIntent.last_payment_error?.code || 'unknown';

  payment.stripeEvents.push({
    type: 'payment_intent.payment_failed',
    timestamp: new Date(),
    data: paymentIntent
  });

  await payment.save();

  // Notify user
  try {
    const order = await Order.findById(payment.donHang);
    if (order) {
      await createNotificationForUser({
        nguoiNhan: payment.nguoiDung.toString(),
        tieuDe: 'Thanh toán thất bại',
        noiDung: `Thanh toán cho đơn hàng ${order.maDonHang} đã thất bại. Vui lòng thử lại.`,
        loai: 'khac',
        donHang: order._id.toString()
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Helper: Handle Charge Refunded
async function handleChargeRefunded(charge: Stripe.Charge) {
  const payment = await Payment.findOne({ stripeChargeId: charge.id });

  if (!payment) {
    console.error('Payment not found for charge:', charge.id);
    return;
  }

  // Update payment status
  payment.trangThai = 'da-hoan';
  payment.stripeRefundId = charge.refunds?.data[0]?.id;

  payment.stripeEvents.push({
    type: 'charge.refunded',
    timestamp: new Date(),
    data: charge
  });

  await payment.save();

  // Update order
  const order = await Order.findById(payment.donHang);
  if (order) {
    order.trangThaiThanhToan = 'hoan-tien';

    order.lichSuTrangThai.push({
      trangThai: 'hoan-tien',
      moTa: 'Đơn hàng đã được hoàn tiền qua Stripe',
      thoiGian: new Date()
    });

    await order.save();
  }
}

// Create Refund
export const createRefund = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, reason } = req.body;

    // Find payment by order ID
    const payment = await Payment.findOne({ donHang: orderId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this order'
      });
    }

    if (payment.trangThai !== 'thanh-cong') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund a payment that is not successful'
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      reason: reason || 'requested_by_customer'
    });

    // Update payment
    payment.trangThai = 'da-hoan';
    payment.stripeRefundId = refund.id;

    payment.stripeEvents.push({
      type: 'refund.created',
      timestamp: new Date(),
      data: refund
    });

    await payment.save();

    // Update order
    const order = await Order.findById(orderId);
    if (order) {
      order.trangThaiThanhToan = 'hoan-tien';

      order.lichSuTrangThai.push({
        trangThai: 'hoan-tien',
        moTa: reason || 'Đơn hàng đã được hoàn tiền',
        thoiGian: new Date()
      });

      await order.save();

      // Restore inventory
      for (const item of order.sanPham) {
        await Product.findByIdAndUpdate(item.sanPham, {
          $inc: { soLuongTonKho: item.soLuong }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Refund created successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error: any) {
    console.error('Create refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tạo refund'
    });
  }
};

// Get Payment Status
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Find payment by order ID
    const payment = await Payment.findOne({ donHang: orderId }).populate('donHang');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.nguoiDung.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thông tin thanh toán này'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        orderId: payment.donHang,
        status: payment.trangThai,
        amount: payment.soTien,
        currency: payment.tienTe,
        paymentMethod: payment.phuongThucThanhToan,
        metadata: payment.metadata,
        paidAt: payment.thanhToanLuc,
        createdAt: payment.createdAt
      }
    });

  } catch (error: any) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể lấy thông tin thanh toán'
    });
  }
};
