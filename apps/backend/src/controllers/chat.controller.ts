import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { generateAIResponse } from '../services/gemini.service';

interface ChatContext {
  intent: 'product_search' | 'policy' | 'support' | 'greeting' | 'unknown';
  keywords: string[];
  category?: string;
  priceRange?: { min?: number; max?: number };
}

// Phân tích ý định từ câu hỏi
function analyzeIntent(message: string): ChatContext {
  const lowerMessage = message.toLowerCase();

  // Greeting
  if (/(xin chào|chào|hello|hi)/i.test(lowerMessage)) {
    return { intent: 'greeting', keywords: [] };
  }

  // Policy questions
  if (/(chính sách|đổi trả|bảo hành|hoàn tiền|giao hàng|vận chuyển|thanh toán)/i.test(lowerMessage)) {
    return { intent: 'policy', keywords: extractKeywords(lowerMessage) };
  }

  // Support questions
  if (/(liên hệ|hotline|hỗ trợ|tư vấn|help)/i.test(lowerMessage)) {
    return { intent: 'support', keywords: [] };
  }

  // Product search - extract category and keywords
  const context: ChatContext = {
    intent: 'product_search',
    keywords: extractKeywords(lowerMessage)
  };

  // Detect category
  if (/(giày|giầy|shoes)/i.test(lowerMessage)) {
    if (/(chạy bộ|running)/i.test(lowerMessage)) {
      context.category = 'giay-chay-bo';
    } else if (/(bóng đá|football|soccer)/i.test(lowerMessage)) {
      context.category = 'giay-bong-da';
    } else if (/(thể thao|sport)/i.test(lowerMessage)) {
      context.category = 'giay-the-thao';
    } else {
      context.category = 'giay-the-thao';
    }
  } else if (/(quần áo|áo|quần|đồ)/i.test(lowerMessage)) {
    context.category = 'quan-ao';
  } else if (/(phụ kiện|túi|ba lô|balo|mũ|găng tay)/i.test(lowerMessage)) {
    context.category = 'phu-kien';
  } else if (/(dụng cụ tập|tạ|dây|máy tập)/i.test(lowerMessage)) {
    context.category = 'dung-cu-tap';
  } else if (/(đồng hồ|watch)/i.test(lowerMessage)) {
    context.category = 'dong-ho';
  }

  // Detect price range
  if (/(rẻ|giá rẻ|tiết kiệm|budget)/i.test(lowerMessage)) {
    context.priceRange = { max: 1000000 };
  } else if (/(cao cấp|premium|chất lượng cao)/i.test(lowerMessage)) {
    context.priceRange = { min: 2000000 };
  } else if (/(tầm trung|trung bình)/i.test(lowerMessage)) {
    context.priceRange = { min: 1000000, max: 2000000 };
  }

  return context;
}

function extractKeywords(message: string): string[] {
  const stopWords = ['tôi', 'mình', 'của', 'cho', 'và', 'có', 'là', 'thì', 'được', 'không', 'với', 'này'];
  const words = message.toLowerCase()
    .replace(/[^\w\s\u00C0-\u1EF9]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  return [...new Set(words)];
}

// Generate response based on intent
async function generateResponse(context: ChatContext): Promise<{ message: string; products?: any[] }> {
  switch (context.intent) {
    case 'greeting':
      return {
        message: 'Xin chào! Tôi là trợ lý ảo của Sport Store. Tôi có thể giúp bạn:\n\n' +
          '🏃 Tìm kiếm sản phẩm thể thao phù hợp\n' +
          '💰 Tư vấn về giá cả và khuyến mãi\n' +
          '📦 Thông tin về giao hàng và đổi trả\n\n' +
          'Bạn đang tìm kiếm sản phẩm gì?'
      };

    case 'policy':
      return generatePolicyResponse(context.keywords);

    case 'support':
      return {
        message: '📞 Thông tin liên hệ:\n\n' +
          '• Hotline: 1900-xxxx (8:00 - 22:00)\n' +
          '• Email: support@sportstore.vn\n' +
          '• Địa chỉ: 123 Nguyễn Văn Linh, Q.7, TP.HCM\n\n' +
          'Hoặc bạn có thể đặt câu hỏi trực tiếp, tôi sẽ cố gắng giúp đỡ!'
      };

    case 'product_search':
      return await searchProducts(context);

    default:
      return {
        message: 'Xin lỗi, tôi không hiểu rõ yêu cầu của bạn. Bạn có thể:\n\n' +
          '• Hỏi về sản phẩm cụ thể (VD: "Giày chạy bộ cho người mới")\n' +
          '• Hỏi về chính sách đổi trả, bảo hành\n' +
          '• Hỏi về khuyến mãi và giá cả\n\n' +
          'Hoặc liên hệ hotline: 1900-xxxx để được hỗ trợ trực tiếp.'
      };
  }
}

function generatePolicyResponse(keywords: string[]): { message: string } {
  const message = keywords.join(' ').toLowerCase();

  if (/(đổi trả|hoàn)/i.test(message)) {
    return {
      message: '🔄 Chính sách đổi trả:\n\n' +
        '• Đổi trả trong 30 ngày kể từ ngày mua\n' +
        '• Sản phẩm còn nguyên tem, chưa qua sử dụng\n' +
        '• Miễn phí đổi hàng lần đầu tiên\n' +
        '• Hoàn tiền 100% nếu lỗi từ nhà sản xuất\n\n' +
        'Bạn cần hỗ trợ đổi trả sản phẩm cụ thể?'
    };
  }

  if (/(bảo hành)/i.test(message)) {
    return {
      message: '🛡️ Chính sách bảo hành:\n\n' +
        '• Giày thể thao: 6 tháng\n' +
        '• Đồng hồ thể thao: 12 tháng\n' +
        '• Dụng cụ tập: 6-12 tháng tùy sản phẩm\n' +
        '• Bảo hành chính hãng, đổi mới 1-1 nếu lỗi NSX\n\n' +
        'Chi tiết bảo hành được ghi rõ trên phiếu mua hàng.'
    };
  }

  if (/(giao hàng|vận chuyển)/i.test(message)) {
    return {
      message: '🚚 Chính sách giao hàng:\n\n' +
        '• MIỄN PHÍ giao hàng đơn từ 500.000đ\n' +
        '• Giao hàng nội thành: 1-2 ngày\n' +
        '• Giao hàng ngoại thành: 2-5 ngày\n' +
        '• Kiểm tra hàng trước khi thanh toán\n' +
        '• Giao hàng thất bại: Hoàn tiền 100%\n\n' +
        'Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi".'
    };
  }

  if (/(thanh toán)/i.test(message)) {
    return {
      message: '💳 Phương thức thanh toán:\n\n' +
        '• Thanh toán khi nhận hàng (COD)\n' +
        '• Chuyển khoản ngân hàng\n' +
        '• Ví điện tử (Momo, ZaloPay, VNPay)\n' +
        '• Thẻ tín dụng/ghi nợ\n\n' +
        'Tất cả đều an toàn và bảo mật 100%!'
    };
  }

  return {
    message: '📋 Chính sách của Sport Store:\n\n' +
      '• Đổi trả trong 30 ngày\n' +
      '• Bảo hành chính hãng 6-12 tháng\n' +
      '• Miễn phí giao hàng từ 500k\n' +
      '• Thanh toán linh hoạt, an toàn\n\n' +
      'Bạn muốn biết chi tiết về chính sách nào?'
  };
}

async function searchProducts(context: ChatContext): Promise<{ message: string; products?: any[] }> {
  try {
    // Build query
    const query: any = {};

    // Filter by category
    if (context.category) {
      const category = await Category.findOne({ slug: context.category });
      if (category) {
        query.danhMuc = category._id;
      }
    }

    // Filter by price range
    if (context.priceRange) {
      query.gia = {};
      if (context.priceRange.min) query.gia.$gte = context.priceRange.min;
      if (context.priceRange.max) query.gia.$lte = context.priceRange.max;
    }

    // Search by keywords
    if (context.keywords.length > 0) {
      const keywordRegex = context.keywords.map(k => `(?=.*${k})`).join('');
      query.$or = [
        { ten: { $regex: keywordRegex, $options: 'i' } },
        { moTaNgan: { $regex: keywordRegex, $options: 'i' } },
        { thuongHieu: { $regex: context.keywords.join('|'), $options: 'i' } }
      ];
    }

    // Find products
    const products = await Product.find(query)
      .select('ten gia hinhAnh slug danhGiaTrungBinh')
      .limit(5)
      .sort({ danhGiaTrungBinh: -1, daBan: -1 });

    if (products.length === 0) {
      return {
        message: 'Rất tiếc, tôi không tìm thấy sản phẩm phù hợp với yêu cầu của bạn. ' +
          'Bạn có thể:\n\n' +
          '• Thử tìm kiếm với từ khóa khác\n' +
          '• Mở rộng phạm vi giá\n' +
          '• Xem các danh mục sản phẩm khác\n\n' +
          'Hoặc liên hệ hotline 1900-xxxx để được tư vấn trực tiếp!'
      };
    }

    let message = `Tôi tìm thấy ${products.length} sản phẩm phù hợp với yêu cầu của bạn:\n\n`;

    if (context.category) {
      const categoryNames: Record<string, string> = {
        'giay-chay-bo': 'giày chạy bộ',
        'giay-bong-da': 'giày bóng đá',
        'giay-the-thao': 'giày thể thao',
        'quan-ao': 'quần áo thể thao',
        'phu-kien': 'phụ kiện',
        'dung-cu-tap': 'dụng cụ tập',
        'dong-ho': 'đồng hồ thể thao'
      };
      message += `📦 Danh mục: ${categoryNames[context.category] || 'thể thao'}\n`;
    }

    if (context.priceRange) {
      if (context.priceRange.max && !context.priceRange.min) {
        message += `💰 Giá: Dưới ${(context.priceRange.max / 1000).toFixed(0)}K\n`;
      } else if (context.priceRange.min && !context.priceRange.max) {
        message += `💰 Giá: Từ ${(context.priceRange.min / 1000).toFixed(0)}K\n`;
      } else if (context.priceRange.min && context.priceRange.max) {
        message += `💰 Giá: ${(context.priceRange.min / 1000).toFixed(0)}K - ${(context.priceRange.max / 1000).toFixed(0)}K\n`;
      }
    }

    message += '\nClick vào sản phẩm bên dưới để xem chi tiết!\n\n' +
      'Bạn có thể hỏi thêm về:\n' +
      '• So sánh các sản phẩm\n' +
      '• Khuyến mãi hiện có\n' +
      '• Tư vấn size và màu sắc';

    return {
      message,
      products: products.map(p => ({
        _id: p._id,
        ten: p.ten,
        gia: p.gia,
        hinhAnhChinh: p.hinhAnh[0] || '',
        slug: p.slug
      }))
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      message: 'Xin lỗi, đã có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại sau hoặc liên hệ hotline: 1900-xxxx'
    };
  }
}

export const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      });
    }

    // Use OpenAI to generate intelligent response with product context
    const response = await generateAIResponse(message);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};
