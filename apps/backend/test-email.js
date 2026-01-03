// Script để test email service
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🔧 Testing Email Service...\n');

  console.log('Configuration:');
  console.log('- EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('- EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('- EMAIL_USER:', process.env.EMAIL_USER);
  console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set (hidden)' : '✗ Not set');
  console.log('');

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"LP Shop Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Gửi đến chính email này để test
      subject: '✅ Email Service Test - LP Shop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email Service Working!</h1>
            </div>
            <div class="content">
              <p>Chúc mừng! Email service của LP Shop đã hoạt động thành công.</p>
              <p><strong>Thời gian test:</strong> ${new Date().toLocaleString('vi-VN')}</p>
              <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
              <p>Bây giờ bạn có thể sử dụng tính năng quên mật khẩu và các email khác.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n🎉 Email service is working! Check your inbox:', process.env.EMAIL_USER);

  } catch (error) {
    console.error('\n❌ Email service error:');
    console.error(error.message);
    console.error('\nPossible solutions:');
    console.error('1. Tạo App Password mới tại: https://myaccount.google.com/apppasswords');
    console.error('2. Đảm bảo đã bật 2-Step Verification cho Gmail');
    console.error('3. Kiểm tra EMAIL_USER và EMAIL_PASSWORD trong file .env');
    console.error('4. Thử tắt antivirus/firewall tạm thời');
    process.exit(1);
  }
}

testEmail();
