import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import querystring from 'querystring';

// @desc    Tạo payment URL VNPay
// @route   POST /api/payment/vnpay/create
// @access  Private
export const createVNPayPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, amount, orderInfo } = req.body;

    const vnpUrl = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:]/g, '').split('.')[0];
    const orderId_vnp = `${orderId}_${Date.now()}`;

    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId_vnp,
      vnp_OrderInfo: orderInfo || 'Thanh toán đơn hàng',
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // VNPay yêu cầu số tiền * 100
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: req.ip,
      vnp_CreateDate: createDate
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params);
    const hmac = crypto.createHmac('sha512', secretKey as string);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params);

    res.json({
      success: true,
      data: {
        paymentUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    VNPay return URL
// @route   GET /api/payment/vnpay/return
// @access  Public
export const vnpayReturn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let vnp_Params: any = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNPAY_HASH_SECRET;
    const signData = querystring.stringify(vnp_Params as any);
    const hmac = crypto.createHmac('sha512', secretKey as string);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const responseCode = vnp_Params['vnp_ResponseCode'];

      if (responseCode === '00') {
        // TODO: Cập nhật trạng thái đơn hàng thành công
        res.redirect(`${process.env.CLIENT_URL}/payment/success?orderId=${vnp_Params['vnp_TxnRef']}`);
      } else {
        res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
      }
    } else {
      res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo payment MoMo
// @route   POST /api/payment/momo/create
// @access  Private
export const createMoMoPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement MoMo payment
    res.json({
      success: true,
      message: 'Tính năng đang được phát triển'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    MoMo callback
// @route   POST /api/payment/momo/callback
// @access  Public
export const momoCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Handle MoMo callback
    res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
function sortObject(obj: any) {
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}
