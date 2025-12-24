import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product';
import Category from '../models/Category';

// Initialize Gemini AI client lazily
let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 Gemini API Key status:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'NOT FOUND');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

interface ProductContext {
  categories: string[];
  products: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    description: string;
  }>;
}

// Get product context from database
async function getProductContext(): Promise<ProductContext> {
  try {
    // Get categories
    const categories = await Category.find().select('ten slug');

    // Get sample products (limit for context size)
    const products = await Product.find()
      .select('ten gia thuongHieu moTa danhMuc')
      .populate('danhMuc', 'ten')
      .limit(50)
      .lean();

    return {
      categories: categories.map(c => c.ten),
      products: products.map(p => ({
        id: p._id.toString(),
        name: p.ten,
        price: p.gia,
        category: (p.danhMuc as any)?.ten || 'Khác',
        brand: p.thuongHieu,
        description: p.moTa || ''
      }))
    };
  } catch (error) {
    console.error('Error getting product context:', error);
    return { categories: [], products: [] };
  }
}

// Search products based on query
async function searchProductsForAI(query: string, limit: number = 5) {
  try {
    // Extract keywords
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // Build search query
    const searchQuery: any = {
      $or: [
        { ten: { $regex: keywords.join('|'), $options: 'i' } },
        { moTa: { $regex: keywords.join('|'), $options: 'i' } },
        { thuongHieu: { $regex: keywords.join('|'), $options: 'i' } }
      ]
    };

    const products = await Product.find(searchQuery)
      .select('ten gia hinhAnh slug danhGiaTrungBinh thuongHieu moTa')
      .populate('danhMuc', 'ten')
      .limit(limit)
      .sort({ danhGiaTrungBinh: -1, daBan: -1 })
      .lean();

    return products.map(p => ({
      _id: p._id.toString(),
      ten: p.ten,
      gia: p.gia,
      hinhAnhChinh: (p.hinhAnh && p.hinhAnh[0]) || '',
      slug: p.slug,
      thuongHieu: p.thuongHieu,
      danhGia: p.danhGiaTrungBinh,
      danhMuc: (p.danhMuc as any)?.ten || 'Khác',
      moTa: p.moTa || ''
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Create system prompt with product context
function createSystemPrompt(context: ProductContext): string {
  const categoryList = context.categories.join(', ');

  return `Bạn là trợ lý ảo thông minh của LP SHOP - cửa hàng thể thao trực tuyến hàng đầu Việt Nam.

THÔNG TIN CỬA HÀNG:
- Tên: LP SHOP
- Chuyên: Đồ thể thao, giày thể thao, quần áo tập gym, dụng cụ thể thao chất lượng cao
- Danh mục sản phẩm: ${categoryList}

CHÍNH SÁCH:
- Đổi trả: 30 ngày, miễn phí đổi hàng lần đầu
- Bảo hành: 6-12 tháng tùy sản phẩm
- Giao hàng: MIỄN PHÍ đơn từ 500.000đ, giao 1-5 ngày
- Thanh toán: COD, chuyển khoản, ví điện tử (Momo, ZaloPay, VNPay)
- Hotline: 1900-xxxx (8:00-22:00)
- Email: support@sportstore.vn

VAI TRÒ CỦA BẠN:
1. Tư vấn sản phẩm thể thao phù hợp với nhu cầu khách hàng
2. Trả lời câu hỏi về chính sách, giao hàng, thanh toán
3. Giúp khách hàng tìm sản phẩm phù hợp với giá cả
4. Cung cấp thông tin chi tiết và chính xác
5. Luôn thân thiện, nhiệt tình và chuyên nghiệp

HƯỚNG DẪN:
- Trả lời ngắn gọn, rõ ràng bằng tiếng Việt
- Khi khách hỏi về sản phẩm, hãy đề xuất các sản phẩm cụ thể phù hợp
- Sử dụng emoji một cách tinh tế để thân thiện hơn
- Nếu không chắc chắn, hãy đề nghị khách liên hệ hotline
- Luôn kết thúc bằng câu hỏi để tiếp tục hỗ trợ

LƯU Ý:
- KHÔNG bịa đặt thông tin về sản phẩm không có trong database
- KHÔNG đưa ra giá chính xác nếu không được cung cấp
- KHÔNG hứa hẹn điều gì không chắc chắn`;
}

// Generate AI response with product context using Gemini
export async function generateAIResponse(userMessage: string): Promise<{
  message: string;
  products?: any[];
}> {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return {
        message: 'Xin lỗi, hệ thống AI tạm thời không khả dụng. Vui lòng liên hệ hotline: 1900-xxxx để được hỗ trợ trực tiếp.'
      };
    }

    // Get product context
    const context = await getProductContext();

    // Search for relevant products
    const relevantProducts = await searchProductsForAI(userMessage);

    // Build context for AI
    let productInfo = '';
    if (relevantProducts.length > 0) {
      productInfo = '\n\nSẢN PHẨM LIÊN QUAN (để tham khảo và gợi ý cho khách):\n';
      relevantProducts.forEach((p, i) => {
        productInfo += `${i + 1}. ${p.ten}
   - Thương hiệu: ${p.thuongHieu}
   - Giá: ${(p.gia).toLocaleString('vi-VN')}đ
   - Danh mục: ${p.danhMuc}
   - Đánh giá: ${p.danhGia}/5
   - Mô tả: ${p.moTa.substring(0, 100)}...\n`;
      });
      productInfo += '\nHãy giới thiệu những sản phẩm này một cách tự nhiên và hấp dẫn.';
    }

    // Create full prompt
    const fullPrompt = `${createSystemPrompt(context)}${productInfo}

KHÁCH HÀNG HỎI: ${userMessage}

HÃY TRẢ LỜI THEO VAI TRÒ CỦA BẠN:`;

    // Call Gemini API
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiMessage = response.text() ||
      'Xin lỗi, tôi không thể xử lý câu hỏi của bạn lúc này. Vui lòng thử lại hoặc liên hệ hotline: 1900-xxxx';

    // Return response with products if found
    return {
      message: aiMessage,
      products: relevantProducts.length > 0 ? relevantProducts : undefined
    };

  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Fallback response
    return {
      message: 'Xin lỗi, tôi đang gặp chút vấn đề kỹ thuật. 😅\n\n' +
        'Bạn có thể:\n' +
        '• Thử lại sau vài giây\n' +
        '• Liên hệ hotline: 1900-xxxx\n' +
        '• Email: support@sportstore.vn\n\n' +
        'Chúng tôi luôn sẵn sàng hỗ trợ bạn!'
    };
  }
}
