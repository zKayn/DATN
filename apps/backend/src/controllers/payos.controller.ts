import { Request, Response } from 'express';
import { PayOS } from '@payos/node';
import Order from '../models/Order';
import Product from '../models/Product';
import Voucher from '../models/Voucher';
import { createNotificationForUser } from './notification.controller';
import { addPointsForOrder } from '../services/point.service';

// Initialize PayOS with credentials from environment variables
const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || '',
  apiKey: process.env.PAYOS_API_KEY || '',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || ''
});

/**
 * Create PayOS payment link
 */
export const createPaymentLink = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để thanh toán'
      });
    }

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if order belongs to user
    if (order.nguoiDung.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thanh toán đơn hàng này'
      });
    }

    // Check if order already paid
    if (order.trangThaiThanhToan === 'da-thanh-toan') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được thanh toán'
      });
    }

    // Prepare payment data
    const paymentData = {
      orderCode: Number(Date.now()), // Unique order code (timestamp)
      amount: Math.round(order.tongThanhToan), // Amount in VND
      description: order.maDonHang, // Max 25 characters - just use order code
      returnUrl: `${process.env.PAYOS_RETURN_URL}?orderId=${orderId}`,
      cancelUrl: `${process.env.PAYOS_CANCEL_URL}?orderId=${orderId}`,
    };

    // Create payment link
    const paymentLinkRes = await payOS.paymentRequests.create(paymentData);

    // Update order with PayOS order code
    order.payosOrderCode = paymentData.orderCode;
    await order.save();

    return res.status(200).json({
      success: true,
      data: {
        checkoutUrl: paymentLinkRes.checkoutUrl,
        qrCode: paymentLinkRes.qrCode,
        orderCode: paymentData.orderCode
      }
    });

  } catch (error: any) {
    console.error('PayOS create payment link error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo liên kết thanh toán PayOS'
    });
  }
};

/**
 * Handle PayOS webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;

    console.log('PayOS Webhook received:', webhookData);

    // Verify webhook signature and get verified data
    const verifiedData = await payOS.webhooks.verify(webhookData);

    const { orderCode, code, desc } = verifiedData;

    // Find order by PayOS order code
    const order = await Order.findOne({ payosOrderCode: orderCode });

    if (!order) {
      console.error('Order not found for PayOS orderCode:', orderCode);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Payment successful
    if (code === '00') {
      // Update order status
      order.trangThaiThanhToan = 'da-thanh-toan';
      order.trangThaiDonHang = 'dang-xu-ly';
      order.phuongThucThanhToan = 'payos';
      await order.save();

      // Deduct stock
      for (const item of order.sanPham) {
        await Product.findByIdAndUpdate(item.sanPham, {
          $inc: { soLuongTonKho: -item.soLuong, daBan: item.soLuong }
        });
      }

      // Update voucher usage
      if (order.maGiamGia && order.maGiamGia.voucher) {
        await Voucher.findByIdAndUpdate(order.maGiamGia.voucher, {
          $inc: { daSuDung: 1 },
          $push: { nguoiDungApDung: order.nguoiDung }
        });
      }

      // Create notification
      try {
        await createNotificationForUser({
          nguoiNhan: order.nguoiDung.toString(),
          tieuDe: 'Thanh toán thành công',
          noiDung: `Đơn hàng ${order.maDonHang} đã được thanh toán thành công qua PayOS.`,
          loai: 'don-hang-xac-nhan',
          donHang: order._id.toString()
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }

      // Award loyalty points
      try {
        const pointsResult = await addPointsForOrder(
          order.nguoiDung,
          order._id,
          order.tongThanhToan
        );

        if (pointsResult.success && pointsResult.points > 0) {
          console.log(`Awarded ${pointsResult.points} points to user ${order.nguoiDung} for order ${order.maDonHang}`);
        }
      } catch (error) {
        console.error('Error awarding points:', error);
      }

      console.log(`PayOS payment successful for order ${order.maDonHang}`);

    } else {
      // Payment failed or cancelled
      order.trangThaiThanhToan = 'that-bai';
      await order.save();

      console.log(`PayOS payment failed for order ${order.maDonHang}: ${desc}`);

      // Create notification
      try {
        await createNotificationForUser({
          nguoiNhan: order.nguoiDung.toString(),
          tieuDe: 'Thanh toán thất bại',
          noiDung: `Thanh toán đơn hàng ${order.maDonHang} qua PayOS đã thất bại. Vui lòng thử lại.`,
          loai: 'don-hang-xac-nhan',
          donHang: order._id.toString()
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error: any) {
    console.error('PayOS webhook error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xử lý webhook PayOS'
    });
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if order belongs to user
    if (order.nguoiDung.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    // If order payment is pending and has PayOS order code, check with PayOS API
    if (order.trangThaiThanhToan === 'chua-thanh-toan' && order.payosOrderCode) {
      try {
        console.log(`Checking PayOS payment status for order ${order.maDonHang}, orderCode: ${order.payosOrderCode}`);

        const paymentInfo = await payOS.paymentRequests.get(order.payosOrderCode as number);

        console.log('PayOS payment info:', paymentInfo);

        // If payment is successful, update order
        if (paymentInfo.status === 'PAID') {
          order.trangThaiThanhToan = 'da-thanh-toan';
          order.trangThaiDonHang = 'dang-xu-ly';
          await order.save();

          // Deduct stock
          for (const item of order.sanPham) {
            await Product.findByIdAndUpdate(item.sanPham, {
              $inc: { soLuongTonKho: -item.soLuong, daBan: item.soLuong }
            });
          }

          // Update voucher usage
          if (order.maGiamGia && order.maGiamGia.voucher) {
            await Voucher.findByIdAndUpdate(order.maGiamGia.voucher, {
              $inc: { daSuDung: 1 },
              $push: { nguoiDungApDung: order.nguoiDung }
            });
          }

          // Create notification
          try {
            await createNotificationForUser({
              nguoiNhan: order.nguoiDung.toString(),
              tieuDe: 'Thanh toán thành công',
              noiDung: `Đơn hàng ${order.maDonHang} đã được thanh toán thành công qua PayOS.`,
              loai: 'don-hang-xac-nhan',
              donHang: order._id.toString()
            });
          } catch (error) {
            console.error('Error creating notification:', error);
          }

          // Award loyalty points
          try {
            const pointsResult = await addPointsForOrder(
              order.nguoiDung,
              order._id,
              order.tongThanhToan
            );

            if (pointsResult.success && pointsResult.points > 0) {
              console.log(`Awarded ${pointsResult.points} points to user ${order.nguoiDung} for order ${order.maDonHang}`);
            }
          } catch (error) {
            console.error('Error awarding points:', error);
          }

          console.log(`Updated order ${order.maDonHang} status to paid based on PayOS API check`);
        } else if (paymentInfo.status === 'CANCELLED') {
          order.trangThaiThanhToan = 'da-huy';
          await order.save();
        }
      } catch (error: any) {
        // If error getting PayOS info, just continue with current status
        console.error('Error checking PayOS payment status:', error.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderCode: order.maDonHang,
        paymentStatus: order.trangThaiThanhToan,
        orderStatus: order.trangThaiDonHang,
        total: order.tongThanhToan
      }
    });

  } catch (error: any) {
    console.error('Get PayOS payment status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy trạng thái thanh toán'
    });
  }
};

/**
 * Cancel payment
 */
export const cancelPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if order belongs to user
    if (order.nguoiDung.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy đơn hàng này'
      });
    }

    if (!order.payosOrderCode) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không có mã thanh toán PayOS'
      });
    }

    // Cancel payment link on PayOS
    await payOS.paymentRequests.cancel(order.payosOrderCode as number);

    // Update order status
    order.trangThaiThanhToan = 'da-huy';
    order.trangThaiDonHang = 'da-huy';
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Đã hủy thanh toán thành công'
    });

  } catch (error: any) {
    console.error('Cancel PayOS payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi hủy thanh toán PayOS'
    });
  }
};
