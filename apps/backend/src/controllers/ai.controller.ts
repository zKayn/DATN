import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product';

// Lazy initialization để đảm bảo .env đã được load
const getGenAI = () => {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return null;
};

// @desc    Gợi ý sản phẩm dựa trên AI
// @route   GET /api/ai/recommendations
// @access  Private
export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement AI recommendation logic
    // 1. Lấy lịch sử mua hàng, xem sản phẩm của user
    // 2. Phân tích preferences
    // 3. Recommend sản phẩm tương tự

    const products = await Product.find({ trangThai: 'active' })
      .limit(8)
      .sort({ daBan: -1 });

    res.json({
      success: true,
      message: 'Gợi ý sản phẩm cho bạn',
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chatbot AI hỗ trợ khách hàng
// @route   POST /api/ai/chatbot
// @access  Public
export const chatbot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      });
    }

    // Get product context for AI
    const products = await Product.find({ trangThai: 'active' })
      .populate('danhMuc', 'ten')
      .limit(20)
      .sort({ daBan: -1 })
      .select('ten moTa gia giaKhuyenMai danhMuc thuongHieu kichThuoc mauSac daBan danhGiaTrungBinh hinhAnh slug');

    // Build product context
    const productContext = products.map(p => ({
      ten: p.ten,
      moTa: p.moTa,
      gia: p.gia,
      giaKhuyenMai: p.giaKhuyenMai,
      danhMuc: (p.danhMuc as any)?.ten,
      thuongHieu: p.thuongHieu,
      kichThuoc: p.kichThuoc,
      mauSac: p.mauSac,
      daBan: p.daBan,
      danhGia: p.danhGiaTrungBinh
    }));

    // Sử dụng Gemini AI để trả lời (nếu có API key)
    let reply = '';
    let suggestedProducts: any[] = [];

    const genAI = getGenAI();
    console.log('genAI initialized:', !!genAI);
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);

    if (genAI) {
      console.log('Calling Gemini API...');
      const systemMessage = `Bạn là trợ lý ảo thông minh của cửa hàng đồ thể thao SportHub.

THÔNG TIN SẢN PHẨM HIỆN CÓ:
${JSON.stringify(productContext, null, 2)}

NHIỆM VỤ CỦA BẠN:
1. Tư vấn sản phẩm dựa trên danh sách sản phẩm thực tế
2. Trả lời câu hỏi về:
   - Sản phẩm cụ thể (giá, mô tả, size, màu sắc)
   - So sánh sản phẩm
   - Gợi ý sản phẩm phù hợp với nhu cầu
   - Chính sách đổi trả: 7 ngày, miễn phí đổi size
   - Bảo hành: 6 tháng cho giày, 3 tháng cho quần áo
   - Vận chuyển: Miễn phí đơn từ 500k, giao hàng 2-3 ngày
   - Thanh toán: COD, VNPay, MoMo, chuyển khoản

QUY TẮC QUAN TRỌNG:
- Chỉ giới thiệu sản phẩm có trong danh sách
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Nếu khách hỏi về sản phẩm cụ thể, cung cấp thông tin chi tiết
- Nếu khách cần gợi ý, đề xuất 2-3 sản phẩm phù hợp nhất
- Format giá: XXX.XXX₫

FORMAT TRẢ LỜI:
- BẮT BUỘC phải trả lời ĐÚNG format JSON sau, KHÔNG được thêm text nào khác bên ngoài:
{
  "message": "câu trả lời của bạn",
  "suggestedProducts": ["tên sản phẩm 1", "tên sản phẩm 2"]
}
- KHÔNG được viết text trước hoặc sau JSON
- KHÔNG được dùng markdown code block
- CHỈ trả về JSON object thuần túy`;

      // Build conversation history for Gemini
      let conversationText = systemMessage + '\n\n';

      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            conversationText += `Người dùng: ${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            conversationText += `Trợ lý: ${msg.content}\n\n`;
          }
        });
      }

      conversationText += `Người dùng: ${message}\n\nTrợ lý:`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(conversationText);
      const response = await result.response;
      const aiResponse = response.text() || reply;

      console.log('Gemini response:', aiResponse);

      // Clean up the response - remove markdown formatting
      let cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/\*\*/g, '')
        .trim();

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(cleanedResponse);
        if (parsed.message && parsed.suggestedProducts) {
          // Chỉ lấy message, không hiển thị cả JSON
          reply = parsed.message;
          // Find actual products
          suggestedProducts = products.filter(p =>
            parsed.suggestedProducts.some((name: string) =>
              p.ten.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(p.ten.toLowerCase())
            )
          ).slice(0, 3);
        } else if (parsed.message) {
          // Nếu chỉ có message
          reply = parsed.message;
        } else {
          // Không parse được đúng format, dùng text gốc
          reply = cleanedResponse;
        }
      } catch {
        // Not JSON, use as plain text
        reply = cleanedResponse;

        // Try to find product mentions in the response
        const mentionedProducts = products.filter(p =>
          cleanedResponse.toLowerCase().includes(p.ten.toLowerCase())
        ).slice(0, 3);

        if (mentionedProducts.length > 0) {
          suggestedProducts = mentionedProducts;
        }
      }
    }

    res.json({
      success: true,
      data: {
        message: reply,
        suggestedProducts: suggestedProducts.map(p => ({
          _id: p._id,
          ten: p.ten,
          gia: p.gia,
          giaKhuyenMai: p.giaKhuyenMai,
          hinhAnh: (p as any).hinhAnh,
          slug: (p as any).slug
        }))
      }
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.json({
      success: true,
      data: {
        message: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng liên hệ hotline 1900xxxx để được hỗ trợ.',
        suggestedProducts: []
      }
    });
  }
};

// @desc    Tìm kiếm sản phẩm bằng hình ảnh
// @route   POST /api/ai/search-image
// @access  Public
export const searchByImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement image search using TensorFlow.js or similar

    res.json({
      success: true,
      message: 'Tính năng đang được phát triển',
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Phân tích xu hướng mua hàng
// @route   GET /api/ai/trends
// @access  Private/Admin
export const getTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement trend analysis
    // Phân tích:
    // - Sản phẩm bán chạy theo thời gian
    // - Danh mục phổ biến
    // - Dự đoán nhu cầu

    const trends = await Product.find({ trangThai: 'active' })
      .sort({ daBan: -1 })
      .limit(10)
      .select('ten daBan danhMuc');

    res.json({
      success: true,
      message: 'Xu hướng mua hàng',
      data: trends
    });
  } catch (error) {
    next(error);
  }
};
