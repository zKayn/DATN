import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendWelcomeEmail(email: string) {
    try {
      const mailOptions = {
        from: `"Sport Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Chào mừng bạn đến với Sport Store! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .benefits { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
              .benefit-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .benefit-item:last-child { border-bottom: none; }
              .footer { text-align: center; color: #6B7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Chào mừng bạn!</h1>
                <p>Cảm ơn bạn đã đăng ký nhận tin từ Sport Store</p>
              </div>
              <div class="content">
                <p>Xin chào,</p>
                <p>Chúng tôi rất vui khi bạn tham gia cộng đồng Sport Store! Từ giờ bạn sẽ nhận được:</p>

                <div class="benefits">
                  <div class="benefit-item">
                    <strong>🎁 Ưu đãi độc quyền</strong><br>
                    Voucher giảm giá lên đến 20% cho lần mua hàng đầu tiên
                  </div>
                  <div class="benefit-item">
                    <strong>📢 Thông tin sản phẩm mới</strong><br>
                    Cập nhật những sản phẩm thể thao hot nhất
                  </div>
                  <div class="benefit-item">
                    <strong>💪 Mẹo tập luyện</strong><br>
                    Hướng dẫn từ chuyên gia về tập luyện và dinh dưỡng
                  </div>
                  <div class="benefit-item">
                    <strong>⚡ Flash Sale</strong><br>
                    Thông báo sớm nhất về các chương trình khuyến mãi
                  </div>
                </div>

                <center>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="button">
                    Khám phá ngay
                  </a>
                </center>

                <p style="margin-top: 30px;">Hãy theo dõi email để không bỏ lỡ bất kỳ ưu đãi nào nhé!</p>

                <p>Trân trọng,<br><strong>Đội ngũ Sport Store</strong></p>
              </div>
              <div class="footer">
                <p>Bạn nhận được email này vì đã đăng ký nhận tin từ Sport Store</p>
                <p>Nếu không muốn nhận email, bạn có thể <a href="${process.env.CLIENT_URL}/unsubscribe">hủy đăng ký</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendPromotionalEmail(email: string, subject: string, content: string) {
    try {
      const mailOptions = {
        from: `"Sport Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: content,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending promotional email:', error);
      throw error;
    }
  }

  async sendVoucherEmail(email: string, voucher: {
    ma: string;
    loai: string;
    giaTriGiam: number;
    giamToiDa?: number;
    donToiThieu: number;
    ngayKetThuc: Date;
    moTa?: string;
  }) {
    try {
      // Format giá trị giảm
      const discountText = voucher.loai === 'phan-tram'
        ? `${voucher.giaTriGiam}%${voucher.giamToiDa ? ` (tối đa ${voucher.giamToiDa.toLocaleString('vi-VN')}₫)` : ''}`
        : `${voucher.giaTriGiam.toLocaleString('vi-VN')}₫`;

      // Format ngày kết thúc
      const expiryDate = new Date(voucher.ngayKetThuc).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const mailOptions = {
        from: `"Sport Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🎁 Mã giảm giá ${voucher.ma} dành riêng cho bạn!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .voucher-code { background: white; color: #EF4444; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 10px; margin: 20px 0; letter-spacing: 3px; border: 3px dashed #F59E0B; }
              .content { background: #f9fafb; padding: 30px 20px; }
              .highlight-box { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #F59E0B; }
              .detail-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
              .detail-item:last-child { border-bottom: none; }
              .detail-label { font-weight: bold; color: #6B7280; min-width: 140px; }
              .detail-value { color: #111827; }
              .button { display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; font-size: 16px; }
              .footer { background: #1F2937; color: #9CA3AF; padding: 30px 20px; text-align: center; border-radius: 0 0 10px 10px; }
              .footer a { color: #F59E0B; text-decoration: none; }
              .emoji { font-size: 24px; }
              .terms { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #92400E; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🎉</div>
                <h1 style="margin: 15px 0;">Quà Tặng Đặc Biệt!</h1>
                <p style="font-size: 18px; margin: 10px 0;">Mã giảm giá độc quyền dành riêng cho bạn</p>
              </div>

              <div class="content">
                <p style="font-size: 16px;">Xin chào,</p>
                <p>Cảm ơn bạn đã đồng hành cùng <strong>Sport Store</strong>! Chúng tôi xin gửi tặng bạn mã giảm giá đặc biệt:</p>

                <center>
                  <div class="voucher-code">
                    ${voucher.ma}
                  </div>
                </center>

                <div class="highlight-box">
                  <h3 style="margin-top: 0; color: #EF4444;">📋 Chi tiết ưu đãi</h3>
                  <div class="detail-item">
                    <span class="detail-label">💰 Giảm giá:</span>
                    <span class="detail-value"><strong style="color: #EF4444; font-size: 18px;">${discountText}</strong></span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">🛒 Đơn tối thiểu:</span>
                    <span class="detail-value">${voucher.donToiThieu.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">⏰ Hết hạn:</span>
                    <span class="detail-value">${expiryDate}</span>
                  </div>
                  ${voucher.moTa ? `
                  <div class="detail-item">
                    <span class="detail-label">📝 Mô tả:</span>
                    <span class="detail-value">${voucher.moTa}</span>
                  </div>
                  ` : ''}
                </div>

                <div class="terms">
                  <strong>⚠️ Lưu ý:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Mã giảm giá chỉ áp dụng một lần cho mỗi tài khoản</li>
                    <li>Không áp dụng đồng thời với các chương trình khuyến mãi khác</li>
                    <li>Vui lòng kiểm tra ngày hết hạn trước khi sử dụng</li>
                  </ul>
                </div>

                <center>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/san-pham" class="button">
                    🛍️ Mua sắm ngay
                  </a>
                </center>

                <p style="margin-top: 30px; font-size: 16px;">Đừng bỏ lỡ cơ hội tuyệt vời này nhé! Hãy sử dụng mã ngay để nhận ưu đãi.</p>

                <p style="margin-top: 25px;">Chúc bạn mua sắm vui vẻ! 🎊</p>
                <p><strong>Đội ngũ Sport Store</strong></p>
              </div>

              <div class="footer">
                <p style="margin: 0 0 10px 0;">📧 Bạn nhận được email này vì đã đăng ký nhận tin từ Sport Store</p>
                <p style="margin: 0;">Không muốn nhận email? <a href="${process.env.CLIENT_URL}/unsubscribe">Hủy đăng ký tại đây</a></p>
                <p style="margin: 15px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} Sport Store. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Voucher email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending voucher email:', error);
      throw error;
    }
  }
}

export default new EmailService();
