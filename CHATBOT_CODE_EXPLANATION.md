# 🤖 Chatbot AI - Giải Thích Chi Tiết Code

> Tài liệu phân tích chi tiết từng dòng code của hệ thống Chatbot AI trong LP SHOP

---

## 📁 Cấu Trúc Files

```
apps/backend/src/
├── routes/
│   ├── chat.routes.ts          → Định nghĩa API endpoints cho chat
│   └── ai.routes.ts            → Định nghĩa API endpoints cho AI features
├── controllers/
│   ├── chat.controller.ts      → Logic xử lý chat (intent detection)
│   └── ai.controller.ts        → Logic xử lý chatbot với Gemini AI
└── services/
    └── gemini.service.ts       → Service tích hợp Gemini AI API
```

---

## 1️⃣ FILE: `chat.routes.ts`

**Vị trí:** `apps/backend/src/routes/chat.routes.ts`

**Mục đích:** Định nghĩa API endpoints cho chatbot

### 📝 Code & Giải Thích

```typescript
// DÒNG 1: Import Express framework
import express from 'express';

// DÒNG 2: Import controller function xử lý chat
import { chatWithAI } from '../controllers/chat.controller';

// DÒNG 4: Tạo router object để định nghĩa routes
const router = express.Router();

// DÒNG 6-7: Comment giải thích route này là public (không cần đăng nhập)
// Định nghĩa POST endpoint tại /api/chat/ai
// Khi client gửi POST request đến /api/chat/ai, Express sẽ gọi function chatWithAI
router.post('/ai', chatWithAI);

// DÒNG 9: Export router để sử dụng trong server.ts
export default router;
```

### 🔄 Luồng Hoạt Động

```
Client                    Express Router               Controller
  │                              │                          │
  ├─POST /api/chat/ai───────────▶│                          │
  │  Body: {message: "..."}      │                          │
  │                              ├─router.post('/ai')───────▶│
  │                              │                          │
  │                              │                    chatWithAI()
  │                              │                     processes
  │                              │                          │
  │◀─────────────────────────────┴──────────────────────────┤
  │  Response: {success, data}                              │
```

---

## 2️⃣ FILE: `chat.controller.ts`

**Vị trí:** `apps/backend/src/controllers/chat.controller.ts`

**Mục đích:** Xử lý logic chat, phân tích ý định (intent detection), tìm kiếm sản phẩm

### 📝 Code & Giải Thích Chi Tiết

#### **A. Import Dependencies**

```typescript
// DÒNG 1-4: Import các types và models cần thiết
import { Request, Response, NextFunction } from 'express';
// Request: Type cho req object (chứa data từ client)
// Response: Type cho res object (để gửi data về client)
// NextFunction: Type cho next() - chuyển sang middleware tiếp theo

import Product from '../models/Product';
// Model để query products từ MongoDB

import Category from '../models/Category';
// Model để query categories từ MongoDB

import { generateAIResponse } from '../services/gemini.service';
// Function để gọi Gemini AI API
```

#### **B. Interface Definition**

```typescript
// DÒNG 6-11: Định nghĩa structure của ChatContext object
interface ChatContext {
  intent: 'product_search' | 'policy' | 'support' | 'greeting' | 'unknown';
  // intent: Loại ý định của user (5 loại)
  // Union type đảm bảo chỉ có thể là 1 trong 5 giá trị này

  keywords: string[];
  // Danh sách từ khóa trích xuất từ câu hỏi của user

  category?: string;
  // Optional: Slug của category (nếu user hỏi về danh mục cụ thể)

  priceRange?: { min?: number; max?: number };
  // Optional: Khoảng giá (nếu user đề cập đến giá)
}
```

#### **C. Intent Detection Function**

```typescript
// DÒNG 13-69: Function phân tích ý định từ câu hỏi
function analyzeIntent(message: string): ChatContext {
  // Input: message từ user
  // Output: ChatContext object chứa intent và metadata

  // DÒNG 15: Chuyển message về lowercase để so sánh không phân biệt hoa/thường
  const lowerMessage = message.toLowerCase();

  // ========== PHÁT HIỆN INTENT: GREETING ==========
  // DÒNG 17-20: Kiểm tra xem có phải là lời chào không
  if (/(xin chào|chào|hello|hi)/i.test(lowerMessage)) {
    // Regex pattern: Tìm các từ "xin chào", "chào", "hello", "hi"
    // Flag /i: case-insensitive (không phân biệt hoa thường)
    // .test(): Trả về true nếu tìm thấy pattern

    return { intent: 'greeting', keywords: [] };
    // Return sớm với intent = greeting, không cần keywords
  }

  // ========== PHÁT HIỆN INTENT: POLICY ==========
  // DÒNG 22-25: Kiểm tra câu hỏi về chính sách
  if (/(chính sách|đổi trả|bảo hành|hoàn tiền|giao hàng|vận chuyển|thanh toán)/i.test(lowerMessage)) {
    // Tìm các từ liên quan đến policy:
    // - chính sách, đổi trả, bảo hành, hoàn tiền
    // - giao hàng, vận chuyển, thanh toán

    return { intent: 'policy', keywords: extractKeywords(lowerMessage) };
    // Return với intent = policy
    // Gọi extractKeywords() để lấy các từ khóa quan trọng
  }

  // ========== PHÁT HIỆN INTENT: SUPPORT ==========
  // DÒNG 27-30: Kiểm tra yêu cầu hỗ trợ
  if (/(liên hệ|hotline|hỗ trợ|tư vấn|help)/i.test(lowerMessage)) {
    return { intent: 'support', keywords: [] };
  }

  // ========== PHÁT HIỆN INTENT: PRODUCT SEARCH (Default) ==========
  // DÒNG 32-36: Nếu không match các intent trên, coi như tìm sản phẩm
  const context: ChatContext = {
    intent: 'product_search',
    keywords: extractKeywords(lowerMessage)
    // Trích xuất keywords từ message để search products
  };

  // ========== DETECT CATEGORY ==========
  // DÒNG 38-57: Phát hiện danh mục sản phẩm user đang tìm

  if (/(giày|giầy|shoes)/i.test(lowerMessage)) {
    // Nếu message có từ "giày", "giầy", "shoes"

    if (/(chạy bộ|running)/i.test(lowerMessage)) {
      // Nếu có thêm "chạy bộ" hoặc "running"
      context.category = 'giay-chay-bo';
    } else if (/(bóng đá|football|soccer)/i.test(lowerMessage)) {
      context.category = 'giay-bong-da';
    } else if (/(thể thao|sport)/i.test(lowerMessage)) {
      context.category = 'giay-the-thao';
    } else {
      // Default: nếu chỉ nói "giày" không rõ loại
      context.category = 'giay-the-thao';
    }
  }
  else if (/(quần áo|áo|quần|đồ)/i.test(lowerMessage)) {
    context.category = 'quan-ao';
  }
  else if (/(phụ kiện|túi|ba lô|balo|mũ|găng tay)/i.test(lowerMessage)) {
    context.category = 'phu-kien';
  }
  else if (/(dụng cụ tập|tạ|dây|máy tập)/i.test(lowerMessage)) {
    context.category = 'dung-cu-tap';
  }
  else if (/(đồng hồ|watch)/i.test(lowerMessage)) {
    context.category = 'dong-ho';
  }

  // ========== DETECT PRICE RANGE ==========
  // DÒNG 59-66: Phát hiện khoảng giá từ message

  if (/(rẻ|giá rẻ|tiết kiệm|budget)/i.test(lowerMessage)) {
    // User tìm sản phẩm giá rẻ
    context.priceRange = { max: 1000000 };  // Tối đa 1 triệu
  }
  else if (/(cao cấp|premium|chất lượng cao)/i.test(lowerMessage)) {
    // User tìm sản phẩm cao cấp
    context.priceRange = { min: 2000000 };  // Từ 2 triệu trở lên
  }
  else if (/(tầm trung|trung bình)/i.test(lowerMessage)) {
    // User tìm sản phẩm tầm trung
    context.priceRange = { min: 1000000, max: 2000000 };  // 1-2 triệu
  }

  // DÒNG 68: Return context đã phân tích
  return context;
}
```

**Logic Flow của analyzeIntent:**

```
Input: "Tìm giày chạy bộ giá rẻ"
        │
        ▼
1. toLowerCase() → "tìm giày chạy bộ giá rẻ"
        │
        ▼
2. Check Greeting? → NO (không có "xin chào", "hi"...)
        │
        ▼
3. Check Policy? → NO (không có "chính sách", "đổi trả"...)
        │
        ▼
4. Check Support? → NO (không có "liên hệ", "hotline"...)
        │
        ▼
5. Default: product_search
        │
        ▼
6. Extract keywords → ["tìm", "giày", "chạy", "bộ", "giá", "rẻ"]
        │
        ▼
7. Detect Category
   - Found "giày" → YES
   - Found "chạy bộ" → YES
   - Set category = "giay-chay-bo"
        │
        ▼
8. Detect Price Range
   - Found "giá rẻ" → YES
   - Set priceRange = { max: 1000000 }
        │
        ▼
Output: {
  intent: "product_search",
  keywords: ["tìm", "giày", "chạy", "bộ", "giá", "rẻ"],
  category: "giay-chay-bo",
  priceRange: { max: 1000000 }
}
```

#### **D. Extract Keywords Function**

```typescript
// DÒNG 71-78: Function trích xuất từ khóa quan trọng
function extractKeywords(message: string): string[] {

  // DÒNG 72: Danh sách stop words (từ không quan trọng)
  const stopWords = ['tôi', 'mình', 'của', 'cho', 'và', 'có', 'là', 'thì', 'được', 'không', 'với', 'này'];
  // Các từ này không mang ý nghĩa tìm kiếm (giống "the", "a", "an" trong tiếng Anh)

  // DÒNG 73-76: Xử lý message để lấy keywords
  const words = message.toLowerCase()
    // 1. Chuyển về lowercase

    .replace(/[^\w\s\u00C0-\u1EF9]/g, '')
    // 2. Loại bỏ ký tự đặc biệt, giữ lại chữ cái và tiếng Việt có dấu
    // \w: word characters (a-z, A-Z, 0-9, _)
    // \s: whitespace
    // \u00C0-\u1EF9: Unicode range cho tiếng Việt có dấu

    .split(/\s+/)
    // 3. Tách thành array theo khoảng trắng
    // "giày chạy bộ" → ["giày", "chạy", "bộ"]

    .filter(word => word.length > 2 && !stopWords.includes(word));
    // 4. Lọc:
    //    - Chỉ giữ từ có độ dài > 2 ký tự (loại bỏ "có", "là"...)
    //    - Loại bỏ stop words

  // DÒNG 77: Return array unique (không trùng lặp)
  return [...new Set(words)];
  // new Set(words): Loại bỏ duplicate
  // [...]: Convert Set về Array
}
```

**Ví dụ:**

```javascript
Input: "Tôi muốn tìm giày chạy bộ Nike giá rẻ cho mình"

Step 1: toLowerCase()
→ "tôi muốn tìm giày chạy bộ nike giá rẻ cho mình"

Step 2: Remove special chars
→ "tôi muốn tìm giày chạy bộ nike giá rẻ cho mình"

Step 3: Split by whitespace
→ ["tôi", "muốn", "tìm", "giày", "chạy", "bộ", "nike", "giá", "rẻ", "cho", "mình"]

Step 4: Filter (length > 2 && not stopWord)
→ ["muốn", "tìm", "giày", "chạy", "bộ", "nike", "giá", "rẻ"]
   ❌tôi (stopword)
   ✅muốn (length=4, not stopword)
   ✅tìm (length=3, not stopword)
   ...
   ❌cho (stopword)
   ❌mình (stopword)

Output: ["muốn", "tìm", "giày", "chạy", "bộ", "nike", "giá", "rẻ"]
```

#### **E. Generate Response Function**

```typescript
// DÒNG 81-116: Function generate response dựa trên intent
async function generateResponse(context: ChatContext): Promise<{ message: string; products?: any[] }> {
  // Input: ChatContext đã phân tích
  // Output: Object có message (string) và optional products (array)
  // async: Function này có thể await (gọi database)

  // DÒNG 82: Switch case dựa trên intent
  switch (context.intent) {

    // ========== CASE: GREETING ==========
    case 'greeting':
      // DÒNG 84-90: Return lời chào + giới thiệu dịch vụ
      return {
        message: 'Xin chào! Tôi là trợ lý ảo của Sport Store. Tôi có thể giúp bạn:\n\n' +
          '🏃 Tìm kiếm sản phẩm thể thao phù hợp\n' +
          '💰 Tư vấn về giá cả và khuyến mãi\n' +
          '📦 Thông tin về giao hàng và đổi trả\n\n' +
          'Bạn đang tìm kiếm sản phẩm gì?'
      };
      // Không có products vì chỉ là greeting

    // ========== CASE: POLICY ==========
    case 'policy':
      // DÒNG 92-93: Gọi function xử lý policy questions
      return generatePolicyResponse(context.keywords);
      // Truyền keywords để biết user hỏi về policy nào
      // (đổi trả, bảo hành, giao hàng, thanh toán...)

    // ========== CASE: SUPPORT ==========
    case 'support':
      // DÒNG 95-102: Return thông tin liên hệ
      return {
        message: '📞 Thông tin liên hệ:\n\n' +
          '• Hotline: 1900-xxxx (8:00 - 22:00)\n' +
          '• Email: support@sportstore.vn\n' +
          '• Địa chỉ: 123 Nguyễn Văn Linh, Q.7, TP.HCM\n\n' +
          'Hoặc bạn có thể đặt câu hỏi trực tiếp, tôi sẽ cố gắng giúp đỡ!'
      };

    // ========== CASE: PRODUCT SEARCH ==========
    case 'product_search':
      // DÒNG 104-105: Gọi async function tìm kiếm products
      return await searchProducts(context);
      // await: Đợi query database hoàn thành
      // Truyền context (có category, priceRange, keywords)

    // ========== DEFAULT CASE ==========
    default:
      // DÒNG 107-114: Nếu không detect được intent rõ ràng
      return {
        message: 'Xin lỗi, tôi không hiểu rõ yêu cầu của bạn. Bạn có thể:\n\n' +
          '• Hỏi về sản phẩm cụ thể (VD: "Giày chạy bộ cho người mới")\n' +
          '• Hỏi về chính sách đổi trả, bảo hành\n' +
          '• Hỏi về khuyến mãi và giá cả\n\n' +
          'Hoặc liên hệ hotline: 1900-xxxx để được hỗ trợ trực tiếp.'
      };
  }
}
```

#### **F. Generate Policy Response**

```typescript
// DÒNG 118-174: Function xử lý câu hỏi về policy
function generatePolicyResponse(keywords: string[]): { message: string } {

  // DÒNG 119: Join keywords thành string để check
  const message = keywords.join(' ').toLowerCase();
  // ["đổi", "trả", "sản", "phẩm"] → "đổi trả sản phẩm"

  // ========== CHECK: ĐỔI TRẢ ==========
  // DÒNG 121-130: Nếu hỏi về đổi trả hoặc hoàn tiền
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

  // ========== CHECK: BẢO HÀNH ==========
  // DÒNG 132-141
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

  // ========== CHECK: GIAO HÀNG ==========
  // DÒNG 143-153
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

  // ========== CHECK: THANH TOÁN ==========
  // DÒNG 155-164
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

  // ========== DEFAULT: TỔNG QUAN ==========
  // DÒNG 166-173: Nếu không rõ hỏi về policy nào
  return {
    message: '📋 Chính sách của Sport Store:\n\n' +
      '• Đổi trả trong 30 ngày\n' +
      '• Bảo hành chính hãng 6-12 tháng\n' +
      '• Miễn phí giao hàng từ 500k\n' +
      '• Thanh toán linh hoạt, an toàn\n\n' +
      'Bạn muốn biết chi tiết về chính sách nào?'
  };
}
```

#### **G. Search Products Function**

```typescript
// DÒNG 176-270: Function tìm kiếm products từ database
async function searchProducts(context: ChatContext): Promise<{ message: string; products?: any[] }> {
  try {

    // ========== BUILD MONGODB QUERY ==========
    // DÒNG 178-179: Khởi tạo query object
    const query: any = {};
    // any type vì structure động (có thể thêm fields tuỳ context)

    // ========== FILTER BY CATEGORY ==========
    // DÒNG 181-187: Nếu có category trong context
    if (context.category) {
      // Query Category collection để lấy ObjectId
      const category = await Category.findOne({ slug: context.category });
      // VD: slug = "giay-chay-bo" → tìm category document

      if (category) {
        query.danhMuc = category._id;
        // Thêm filter: products phải thuộc category này
        // MongoDB sẽ filter theo danhMuc field (ObjectId reference)
      }
    }

    // ========== FILTER BY PRICE RANGE ==========
    // DÒNG 189-194: Nếu có priceRange trong context
    if (context.priceRange) {
      query.gia = {};
      // Khởi tạo price filter object

      if (context.priceRange.min) {
        query.gia.$gte = context.priceRange.min;
        // $gte: Greater Than or Equal
        // VD: gia >= 1000000
      }

      if (context.priceRange.max) {
        query.gia.$lte = context.priceRange.max;
        // $lte: Less Than or Equal
        // VD: gia <= 2000000
      }
    }

    // ========== FILTER BY KEYWORDS ==========
    // DÒNG 196-204: Nếu có keywords
    if (context.keywords.length > 0) {

      // Tạo regex pattern từ keywords
      const keywordRegex = context.keywords.map(k => `(?=.*${k})`).join('');
      // Positive lookahead: (?=.*keyword)
      // Đảm bảo string chứa TẤT CẢ keywords (AND logic)
      // VD: ["nike", "chạy"] → "(?=.*nike)(?=.*chạy)"

      query.$or = [
        // $or: Match ít nhất 1 trong các conditions

        { ten: { $regex: keywordRegex, $options: 'i' } },
        // Search trong product name
        // $options: 'i' → case-insensitive

        { moTaNgan: { $regex: keywordRegex, $options: 'i' } },
        // Search trong short description

        { thuongHieu: { $regex: context.keywords.join('|'), $options: 'i' } }
        // Search trong brand name
        // join('|') → OR regex: "nike|adidas"
      ];
    }

    // ========== EXECUTE QUERY ==========
    // DÒNG 206-210: Query database
    const products = await Product.find(query)
      // Tìm products match query

      .select('ten gia hinhAnh slug danhGiaTrungBinh')
      // Chỉ lấy các fields cần thiết (performance optimization)

      .limit(5)
      // Giới hạn 5 products (không trả quá nhiều)

      .sort({ danhGiaTrungBinh: -1, daBan: -1 });
      // Sort: Ưu tiên rating cao nhất (-1 = descending)
      //       Sau đó sort theo số lượng đã bán

    // ========== HANDLE NO RESULTS ==========
    // DÒNG 212-221: Nếu không tìm thấy sản phẩm nào
    if (products.length === 0) {
      return {
        message: 'Rất tiếc, tôi không tìm thấy sản phẩm phù hợp với yêu cầu của bạn. ' +
          'Bạn có thể:\n\n' +
          '• Thử tìm kiếm với từ khóa khác\n' +
          '• Mở rộng phạm vi giá\n' +
          '• Xem các danh mục sản phẩm khác\n\n' +
          'Hoặc liên hệ hotline 1900-xxxx để được tư vấn trực tiếp!'
      };
      // Không có products field
    }

    // ========== BUILD SUCCESS MESSAGE ==========
    // DÒNG 223: Bắt đầu build response message
    let message = `Tôi tìm thấy ${products.length} sản phẩm phù hợp với yêu cầu của bạn:\n\n`;

    // DÒNG 225-236: Thêm thông tin category vào message
    if (context.category) {
      const categoryNames: Record<string, string> = {
        // Mapping slug → tên hiển thị
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

    // DÒNG 238-246: Thêm thông tin price range
    if (context.priceRange) {
      if (context.priceRange.max && !context.priceRange.min) {
        // Chỉ có max (giá rẻ)
        message += `💰 Giá: Dưới ${(context.priceRange.max / 1000).toFixed(0)}K\n`;
        // Chia 1000 để chuyển từ VNĐ sang K (nghìn)
        // VD: 1000000 → "1000K"
      }
      else if (context.priceRange.min && !context.priceRange.max) {
        // Chỉ có min (cao cấp)
        message += `💰 Giá: Từ ${(context.priceRange.min / 1000).toFixed(0)}K\n`;
      }
      else if (context.priceRange.min && context.priceRange.max) {
        // Có cả min và max (tầm trung)
        message += `💰 Giá: ${(context.priceRange.min / 1000).toFixed(0)}K - ${(context.priceRange.max / 1000).toFixed(0)}K\n`;
      }
    }

    // DÒNG 248-252: Thêm call-to-action và gợi ý
    message += '\nClick vào sản phẩm bên dưới để xem chi tiết!\n\n' +
      'Bạn có thể hỏi thêm về:\n' +
      '• So sánh các sản phẩm\n' +
      '• Khuyến mãi hiện có\n' +
      '• Tư vấn size và màu sắc';

    // DÒNG 254-263: Return response với products
    return {
      message,
      products: products.map(p => ({
        // Map products sang format phù hợp cho frontend
        _id: p._id,
        ten: p.ten,
        gia: p.gia,
        hinhAnhChinh: p.hinhAnh[0] || '',  // Lấy ảnh đầu tiên
        slug: p.slug
      }))
    };

  } catch (error) {
    // DÒNG 264-269: Handle errors
    console.error('Error searching products:', error);
    return {
      message: 'Xin lỗi, đã có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại sau hoặc liên hệ hotline: 1900-xxxx'
    };
  }
}
```

**MongoDB Query Example:**

```javascript
// User: "Tìm giày chạy bộ Nike giá dưới 1 triệu"

// After analyzeIntent:
context = {
  intent: "product_search",
  keywords: ["tìm", "giày", "chạy", "bộ", "nike"],
  category: "giay-chay-bo",
  priceRange: { max: 1000000 }
}

// MongoDB Query Generated:
{
  danhMuc: ObjectId("..."),  // From category lookup
  gia: { $lte: 1000000 },
  $or: [
    { ten: { $regex: "(?=.*tìm)(?=.*giày)(?=.*chạy)(?=.*bộ)(?=.*nike)", $options: "i" } },
    { moTaNgan: { $regex: "(?=.*tìm)(?=.*giày)(?=.*chạy)(?=.*bộ)(?=.*nike)", $options: "i" } },
    { thuongHieu: { $regex: "tìm|giày|chạy|bộ|nike", $options: "i" } }
  ]
}
```

#### **H. Main Controller Function**

```typescript
// DÒNG 272-293: Export main controller function
export const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
  // async: Function này có await operations
  // req: Request object từ Express (chứa body, headers...)
  // res: Response object để gửi data về client
  // next: NextFunction để chuyển error đến error handler

  try {
    // DÒNG 274: Destructure message từ request body
    const { message } = req.body;
    // Client gửi: { message: "Tìm giày Nike" }
    // → message = "Tìm giày Nike"

    // ========== VALIDATION ==========
    // DÒNG 276-281: Validate input
    if (!message || typeof message !== 'string') {
      // Kiểm tra:
      // 1. message tồn tại (not null, not undefined)
      // 2. message là string (not number, not object...)

      return res.status(400).json({
        // 400: Bad Request status code
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      });
      // Return sớm, không xử lý tiếp
    }

    // ========== CALL GEMINI AI ==========
    // DÒNG 283-284: Call Gemini AI service
    const response = await generateAIResponse(message);
    // generateAIResponse: Function từ gemini.service.ts
    // await: Đợi AI generate response (có thể mất vài giây)
    // response: { message: "...", products: [...] }

    // ========== SEND RESPONSE ==========
    // DÒNG 286-289: Send successful response
    res.json({
      success: true,
      data: response
      // Frontend sẽ nhận:
      // {
      //   success: true,
      //   data: {
      //     message: "Tôi tìm thấy...",
      //     products: [...]
      //   }
      // }
    });

  } catch (error) {
    // DÒNG 290-292: Handle any errors
    next(error);
    // Chuyển error đến error handling middleware
    // Error middleware sẽ format và send error response
  }
};
```

---

## 3️⃣ FILE: `gemini.service.ts`

**Vị trí:** `apps/backend/src/services/gemini.service.ts`

**Mục đích:** Tích hợp Google Gemini AI API để generate intelligent responses

### 📝 Code & Giải Thích Chi Tiết

#### **A. Import & Client Initialization**

```typescript
// DÒNG 1-3: Import dependencies
import { GoogleGenerativeAI } from '@google/generative-ai';
// SDK của Google để gọi Gemini AI API

import Product from '../models/Product';
import Category from '../models/Category';

// DÒNG 5-6: Lazy initialization pattern
let geminiClient: GoogleGenerativeAI | null = null;
// Biến global để cache client instance
// null ban đầu, sẽ được khởi tạo khi cần (lazy)

// DÒNG 8-18: Function để get or create client
function getGeminiClient(): GoogleGenerativeAI {

  // DÒNG 9: Check nếu client chưa được khởi tạo
  if (!geminiClient) {

    // DÒNG 10: Lấy API key từ environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    // .env file: GEMINI_API_KEY=AIzaSy...

    // DÒNG 11: Log status (debugging)
    console.log('🔑 Gemini API Key status:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'NOT FOUND');
    // Chỉ log 10 ký tự đầu để security

    // DÒNG 12-14: Validate API key exists
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
      // Throw error nếu không có API key
      // Sẽ được catch ở outer try-catch
    }

    // DÒNG 15: Khởi tạo Gemini client
    geminiClient = new GoogleGenerativeAI(apiKey);
    // Tạo instance với API key
  }

  // DÒNG 17: Return client (existing hoặc newly created)
  return geminiClient;
}
```

**Lợi ích của Lazy Initialization:**
- Chỉ khởi tạo khi cần (save memory)
- Reuse client instance (không tạo mới mỗi lần)
- Check API key lúc runtime (không phải lúc import)

#### **B. Interface & Type Definitions**

```typescript
// DÒNG 20-30: Define ProductContext interface
interface ProductContext {
  categories: string[];
  // Danh sách tên categories
  // VD: ["Giày thể thao", "Quần áo", "Phụ kiện"]

  products: Array<{
    // Array of product objects
    id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    description: string;
  }>;
}
```

#### **C. Get Product Context Function**

```typescript
// DÒNG 32-60: Function lấy context về products từ database
async function getProductContext(): Promise<ProductContext> {
  // Return type: Promise<ProductContext>
  // async function luôn return Promise

  try {
    // ========== QUERY CATEGORIES ==========
    // DÒNG 35-36: Lấy tất cả categories
    const categories = await Category.find()
      // find() without filter = lấy tất cả
      .select('ten slug');
      // Chỉ lấy 2 fields: ten và slug (optimization)

    // ========== QUERY PRODUCTS ==========
    // DÒNG 38-43: Lấy sample products
    const products = await Product.find()
      .select('ten gia thuongHieu moTa danhMuc')
      // Chỉ lấy các fields cần thiết

      .populate('danhMuc', 'ten')
      // Populate: Replace danhMuc ObjectId với actual category object
      // Chỉ lấy field 'ten' từ category
      // Before: { danhMuc: ObjectId("...") }
      // After:  { danhMuc: { _id: "...", ten: "Giày thể thao" } }

      .limit(50)
      // Giới hạn 50 products (context size limitation)
      // Gemini có giới hạn tokens, không thể gửi tất cả products

      .lean();
      // lean(): Return plain JavaScript objects (not Mongoose documents)
      // Faster and lighter

    // ========== FORMAT RESPONSE ==========
    // DÒNG 45-55: Format data thành ProductContext structure
    return {
      categories: categories.map(c => c.ten),
      // Extract chỉ tên categories
      // [{ ten: "Giày", slug: "giay" }, ...] → ["Giày", ...]

      products: products.map(p => ({
        // Transform từ MongoDB document sang simple object
        id: p._id.toString(),
        // Convert ObjectId sang string
        name: p.ten,
        price: p.gia,
        category: (p.danhMuc as any)?.ten || 'Khác',
        // Optional chaining: nếu danhMuc null → "Khác"
        brand: p.thuongHieu,
        description: p.moTa || ''
      }))
    };

  } catch (error) {
    // DÒNG 56-59: Handle errors gracefully
    console.error('Error getting product context:', error);
    return { categories: [], products: [] };
    // Return empty context thay vì crash
  }
}
```

#### **D. Search Products for AI**

```typescript
// DÒNG 62-99: Function search products cho AI context
async function searchProductsForAI(query: string, limit: number = 5) {
  // query: User's message
  // limit: Max number of products (default 5)

  try {
    // ========== EXTRACT KEYWORDS ==========
    // DÒNG 65-66: Simple keyword extraction
    const keywords = query.toLowerCase()
      .split(/\s+/)  // Split by whitespace
      .filter(w => w.length > 2);  // Only words > 2 chars

    // ========== BUILD SEARCH QUERY ==========
    // DÒNG 68-75: Build MongoDB search query
    const searchQuery: any = {
      $or: [
        // Search in multiple fields (OR logic)

        { ten: { $regex: keywords.join('|'), $options: 'i' } },
        // Search product name
        // join('|'): Create regex OR pattern
        // VD: ["nike", "giày"] → "nike|giày"
        // Matches if name contains "nike" OR "giày"

        { moTa: { $regex: keywords.join('|'), $options: 'i' } },
        // Search in description

        { thuongHieu: { $regex: keywords.join('|'), $options: 'i' } }
        // Search in brand
      ]
    };

    // ========== EXECUTE QUERY ==========
    // DÒNG 77-82: Query database
    const products = await Product.find(searchQuery)
      .select('ten gia hinhAnh slug danhGiaTrungBinh thuongHieu moTa')
      .populate('danhMuc', 'ten')
      .limit(limit)  // Use parameter limit
      .sort({ danhGiaTrungBinh: -1, daBan: -1 })
      // Sort by rating then sales
      .lean();

    // ========== FORMAT RESULTS ==========
    // DÒNG 84-94: Transform results for AI
    return products.map(p => ({
      _id: p._id.toString(),
      ten: p.ten,
      gia: p.gia,
      hinhAnhChinh: (p.hinhAnh && p.hinhAnh[0]) || '',
      // Lấy ảnh đầu tiên, fallback empty string
      slug: p.slug,
      thuongHieu: p.thuongHieu,
      danhGia: p.danhGiaTrungBinh,
      danhMuc: (p.danhMuc as any)?.ten || 'Khác',
      moTa: p.moTa || ''
    }));

  } catch (error) {
    // DÒNG 95-98: Handle errors
    console.error('Error searching products:', error);
    return [];  // Return empty array
  }
}
```

#### **E. Create System Prompt**

```typescript
// DÒNG 101-138: Function tạo system prompt cho AI
function createSystemPrompt(context: ProductContext): string {
  // Input: Product context
  // Output: System prompt string

  // DÒNG 103: Join categories thành comma-separated list
  const categoryList = context.categories.join(', ');
  // ["Giày", "Quần áo", "Phụ kiện"] → "Giày, Quần áo, Phụ kiện"

  // DÒNG 105-137: Return multi-line system prompt
  return `Bạn là trợ lý ảo thông minh của LP SHOP - cửa hàng thể thao trực tuyến hàng đầu Việt Nam.

THÔNG TIN CỬA HÀNG:
- Tên: LP SHOP
- Chuyên: Đồ thể thao, giày thể thao, quần áo tập gym, dụng cụ thể thao chất lượng cao
- Danh mục sản phẩm: ${categoryList}
// Inject categories từ database

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
```

**Prompt Engineering:**
- System prompt định nghĩa persona và behavior của AI
- Cung cấp context về shop (policies, contact...)
- Set rules để AI không hallucinate (bịa đặt info)
- Guide AI response style (friendly, concise, Vietnamese)

#### **F. Generate AI Response (Main Function)**

```typescript
// DÒNG 140-209: Main function generate AI response
export async function generateAIResponse(userMessage: string): Promise<{
  message: string;
  products?: any[];
}> {
  // Export: Function này được import và sử dụng ở controller
  // async: Có await operations (API call, database query)
  // Input: User's message string
  // Output: Promise<{ message, products? }>

  try {
    // ========== CHECK API KEY ==========
    // DÒNG 146-151: Validate API key exists
    if (!process.env.GEMINI_API_KEY) {
      return {
        message: 'Xin lỗi, hệ thống AI tạm thời không khả dụng. Vui lòng liên hệ hotline: 1900-xxxx để được hỗ trợ trực tiếp.'
      };
      // Fallback response nếu không có API key
      // Không crash app, vẫn trả response hữu ích
    }

    // ========== GET PRODUCT CONTEXT ==========
    // DÒNG 153-154: Fetch product context từ database
    const context = await getProductContext();
    // context: { categories: [...], products: [...] }

    // ========== SEARCH RELEVANT PRODUCTS ==========
    // DÒNG 156-157: Tìm products liên quan đến user message
    const relevantProducts = await searchProductsForAI(userMessage);
    // VD: userMessage = "giày nike"
    // → relevantProducts = [Nike shoes from database]

    // ========== BUILD PRODUCT INFO STRING ==========
    // DÒNG 159-172: Format product info cho AI
    let productInfo = '';

    if (relevantProducts.length > 0) {
      // Nếu tìm thấy products liên quan

      productInfo = '\n\nSẢN PHẨM LIÊN QUAN (để tham khảo và gợi ý cho khách):\n';

      relevantProducts.forEach((p, i) => {
        // Loop qua từng product
        productInfo += `${i + 1}. ${p.ten}
   - Thương hiệu: ${p.thuongHieu}
   - Giá: ${(p.gia).toLocaleString('vi-VN')}đ
   // toLocaleString: Format number với dấu phẩy
   // 1500000 → "1,500,000"

   - Danh mục: ${p.danhMuc}
   - Đánh giá: ${p.danhGia}/5
   - Mô tả: ${p.moTa.substring(0, 100)}...\n`;
   // substring(0, 100): Chỉ lấy 100 ký tự đầu
   // Giới hạn context size
      });

      productInfo += '\nHãy giới thiệu những sản phẩm này một cách tự nhiên và hấp dẫn.';
      // Hướng dẫn AI cách present products
    }

    // ========== CREATE FULL PROMPT ==========
    // DÒNG 174-179: Combine system prompt + product info + user message
    const fullPrompt = `${createSystemPrompt(context)}${productInfo}

KHÁCH HÀNG HỎI: ${userMessage}

HÃY TRẢ LỜI THEO VAI TRÒ CỦA BẠN:`;
    // Template literal để build full prompt
    // Gồm 3 phần:
    // 1. System prompt (role, policies, rules)
    // 2. Product info (relevant products)
    // 3. User question

    // ========== CALL GEMINI API ==========
    // DÒNG 181-188: Call Gemini AI
    const genAI = getGeminiClient();
    // Get or create client instance

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // Select model: gemini-1.5-flash
    // Flash model: Fast & efficient (vs Pro model)

    const result = await model.generateContent(fullPrompt);
    // Send prompt to Gemini API
    // await: Đợi API response (network request)
    // result: GenerateContentResult object

    const response = await result.response;
    // Extract response object

    const aiMessage = response.text() ||
      'Xin lỗi, tôi không thể xử lý câu hỏi của bạn lúc này. Vui lòng thử lại hoặc liên hệ hotline: 1900-xxxx';
    // Extract text from response
    // Fallback message nếu không có text

    // ========== RETURN RESPONSE ==========
    // DÒNG 190-194: Return final response
    return {
      message: aiMessage,
      products: relevantProducts.length > 0 ? relevantProducts : undefined
      // Chỉ include products nếu có
      // undefined sẽ không xuất hiện trong JSON (omitted)
    };

  } catch (error: any) {
    // DÒNG 196-208: Handle errors
    console.error('Gemini API Error:', error);
    // Log error for debugging

    // Fallback response
    return {
      message: 'Xin lỗi, tôi đang gặp chút vấn đề kỹ thuật. 😅\n\n' +
        'Bạn có thể:\n' +
        '• Thử lại sau vài giây\n' +
        '• Liên hệ hotline: 1900-xxxx\n' +
        '• Email: support@sportstore.vn\n\n' +
        'Chúng tôi luôn sẵn sàng hỗ trợ bạn!'
    };
    // User-friendly error message
    // Không expose technical error details
  }
}
```

**Gemini API Flow:**

```
1. Build Prompt
   ├─ System Prompt (role, policies)
   ├─ Product Context (relevant products)
   └─ User Message
        │
        ▼
2. Call Gemini API
   genAI.generateContent(prompt)
        │
        ▼
3. Gemini AI Processing
   - Understand context
   - Generate response
   - Follow instructions
        │
        ▼
4. Return Response
   {
     message: "AI-generated text",
     products: [...]
   }
```

---

## 4️⃣ FILE: `ai.controller.ts`

**Vị trí:** `apps/backend/src/controllers/ai.controller.ts`

**Mục đích:** Alternative chatbot implementation với conversation history

### 📝 Key Differences vs chat.controller.ts

| Feature | chat.controller.ts | ai.controller.ts |
|---------|-------------------|------------------|
| **Intent Detection** | Rule-based (regex) | AI-powered |
| **Context** | Stateless | Stateful (history) |
| **Product Search** | Manual MongoDB query | AI suggests products |
| **Response Format** | JSON with suggestedProducts | Structured JSON |

### 📝 Code & Giải Thích

#### **A. Lazy Client Initialization**

```typescript
// DÒNG 5-11: Lazy initialization function
const getGenAI = () => {
  // Check if API key exists
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Create and return client
  }
  return null;
  // Return null if no API key (không crash)
};
```

#### **B. Chatbot Controller**

```typescript
// DÒNG 44-218: Main chatbot controller
export const chatbot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ========== EXTRACT INPUT ==========
    // DÒNG 50: Destructure request body
    const { message, conversationHistory } = req.body;
    // message: Current user message
    // conversationHistory: Array of previous messages
    // [
    //   { role: 'user', content: '...' },
    //   { role: 'assistant', content: '...' }
    // ]

    // ========== VALIDATION ==========
    // DÒNG 52-57: Validate message
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      });
    }

    // ========== GET PRODUCT CONTEXT ==========
    // DÒNG 59-64: Query products cho AI context
    const products = await Product.find({ trangThai: 'active' })
      .populate('danhMuc', 'ten')
      .limit(20)  // Limit 20 để giảm context size
      .sort({ daBan: -1 })  // Sort by best sellers
      .select('ten moTa gia giaKhuyenMai danhMuc thuongHieu kichThuoc mauSac daBan danhGiaTrungBinh hinhAnh slug');

    // ========== BUILD PRODUCT CONTEXT ==========
    // DÒNG 66-78: Format products cho AI
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

    // ========== INITIALIZE VARIABLES ==========
    // DÒNG 80-86: Init response variables
    let reply = '';
    let suggestedProducts: any[] = [];

    const genAI = getGenAI();
    console.log('genAI initialized:', !!genAI);
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);

    // ========== CALL GEMINI IF AVAILABLE ==========
    // DÒNG 88-192: Main AI logic
    if (genAI) {
      console.log('Calling Gemini API...');

      // ========== CREATE SYSTEM MESSAGE ==========
      // DÒNG 90-127: Build comprehensive system prompt
      const systemMessage = `Bạn là trợ lý ảo thông minh của cửa hàng đồ thể thao LP SHOP.

THÔNG TIN SẢN PHẨM HIỆN CÓ:
${JSON.stringify(productContext, null, 2)}
// Inject ALL products data vào prompt
// null, 2: Pretty print JSON với indent 2 spaces

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

      // ========== BUILD CONVERSATION HISTORY ==========
      // DÒNG 129-142: Append conversation history
      let conversationText = systemMessage + '\n\n';

      if (conversationHistory && Array.isArray(conversationHistory)) {
        // Nếu có history, loop qua và append
        conversationHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            conversationText += `Người dùng: ${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            conversationText += `Trợ lý: ${msg.content}\n\n`;
          }
        });
      }

      conversationText += `Người dùng: ${message}\n\nTrợ lý:`;
      // Thêm current message và prompt AI trả lời

      // ========== CALL GEMINI API ==========
      // DÒNG 144-150: Send request to Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      // Note: Sử dụng gemini-2.5-flash (newer model)

      const result = await model.generateContent(conversationText);
      const response = await result.response;
      const aiResponse = response.text() || reply;

      console.log('Gemini response:', aiResponse);

      // ========== PARSE JSON RESPONSE ==========
      // DÒNG 152-191: Parse và extract data từ AI response
      let cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')  // Remove ```json
        .replace(/```\n?/g, '')      // Remove ```
        .replace(/\*\*/g, '')        // Remove **
        .trim();

      // Try parse JSON
      try {
        const parsed = JSON.parse(cleanedResponse);

        if (parsed.message && parsed.suggestedProducts) {
          // Valid format: có cả message và suggestedProducts
          reply = parsed.message;

          // Find actual products từ database
          suggestedProducts = products.filter(p =>
            parsed.suggestedProducts.some((name: string) =>
              p.ten.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(p.ten.toLowerCase())
            )
          ).slice(0, 3);  // Limit 3 products
        }
        else if (parsed.message) {
          // Chỉ có message, không có products
          reply = parsed.message;
        }
        else {
          // Invalid format, dùng text gốc
          reply = cleanedResponse;
        }
      } catch {
        // Not valid JSON, use as plain text
        reply = cleanedResponse;

        // Try find product mentions trong response
        const mentionedProducts = products.filter(p =>
          cleanedResponse.toLowerCase().includes(p.ten.toLowerCase())
        ).slice(0, 3);

        if (mentionedProducts.length > 0) {
          suggestedProducts = mentionedProducts;
        }
      }
    }

    // ========== SEND RESPONSE ==========
    // DÒNG 194-207: Format và send response
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
    // DÒNG 208-217: Handle errors gracefully
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
```

---

## 🔄 Complete Request Flow

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE                             │
│  User types: "Tìm giày chạy bộ Nike giá rẻ"               │
│           │                                                 │
│           ▼                                                 │
│  fetch('http://localhost:5000/api/chat/ai', {              │
│    method: 'POST',                                         │
│    body: JSON.stringify({ message: "..." })               │
│  })                                                        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HTTP POST Request
                     ▼
┌────────────────────────────────────────────────────────────┐
│                 BACKEND: server.ts                          │
│  Express Gateway receives request                           │
│           │                                                 │
│           ▼                                                 │
│  Middlewares:                                              │
│  - helmet()       ✓ Add security headers                   │
│  - cors()         ✓ Check origin allowed                   │
│  - morgan()       ✓ Log request                            │
│  - express.json() ✓ Parse JSON body                        │
│           │                                                 │
│           ▼                                                 │
│  Route matching:                                           │
│  /api/chat → chatRoutes                                    │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│              BACKEND: chat.routes.ts                        │
│  router.post('/ai', chatWithAI)                            │
│           │                                                 │
│           ▼                                                 │
│  Call chatWithAI controller                                │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│           BACKEND: chat.controller.ts                       │
│                                                            │
│  1. Extract message from req.body                          │
│     message = "Tìm giày chạy bộ Nike giá rẻ"              │
│           │                                                 │
│           ▼                                                 │
│  2. Validate message (not empty, is string)                │
│           │                                                 │
│           ▼                                                 │
│  3. Call generateAIResponse(message)                       │
│     → Goes to gemini.service.ts                            │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│          BACKEND: gemini.service.ts                         │
│                                                            │
│  1. Get product context from MongoDB                       │
│     - Query categories: ["Giày thể thao", ...]            │
│     - Query products: [{ ten: "...", gia: ... }, ...]     │
│           │                                                 │
│           ▼                                                 │
│  2. Search relevant products                               │
│     searchProductsForAI(message)                           │
│     → MongoDB query with keywords                          │
│     → Returns: [Nike products matching query]              │
│           │                                                 │
│           ▼                                                 │
│  3. Build full prompt                                      │
│     - System prompt (role, policies)                       │
│     - Product context (relevant products)                  │
│     - User message                                         │
│           │                                                 │
│           ▼                                                 │
│  4. Call Gemini AI API                                     │
│     genAI.generateContent(fullPrompt)                      │
│           │                                                 │
│           ▼                                                 │
│  → Network request to Google Gemini servers                │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│              GOOGLE GEMINI AI                               │
│                                                            │
│  Processing:                                               │
│  - Understand context                                      │
│  - Analyze user intent                                     │
│  - Match products                                          │
│  - Generate natural language response                      │
│           │                                                 │
│           ▼                                                 │
│  Returns: "Tôi tìm thấy 3 sản phẩm giày chạy bộ Nike..."  │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│          BACKEND: gemini.service.ts                         │
│                                                            │
│  5. Extract AI response                                    │
│     aiMessage = response.text()                            │
│           │                                                 │
│           ▼                                                 │
│  6. Return {                                               │
│       message: aiMessage,                                  │
│       products: relevantProducts                           │
│     }                                                      │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│          BACKEND: chat.controller.ts                        │
│                                                            │
│  7. Receive response from service                          │
│     response = { message: "...", products: [...] }         │
│           │                                                 │
│           ▼                                                 │
│  8. Send JSON response                                     │
│     res.json({                                             │
│       success: true,                                       │
│       data: response                                       │
│     })                                                     │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HTTP Response
                     ▼
┌────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                              │
│                                                            │
│  Receive JSON:                                             │
│  {                                                         │
│    success: true,                                          │
│    data: {                                                 │
│      message: "Tôi tìm thấy 3 sản phẩm...",               │
│      products: [                                           │
│        { ten: "Nike Air Zoom", gia: 850000, ... },        │
│        { ten: "Nike Revolution", gia: 900000, ... },      │
│        ...                                                 │
│      ]                                                     │
│    }                                                       │
│  }                                                         │
│           │                                                 │
│           ▼                                                 │
│  Display in UI:                                            │
│  - Show AI message                                         │
│  - Render product cards                                    │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 Summary Table

| Component | File | Lines of Code | Key Functions |
|-----------|------|---------------|---------------|
| **Routes** | chat.routes.ts | 10 | Route definition |
| **Routes** | ai.routes.ts | 18 | Alternative routes |
| **Controller** | chat.controller.ts | 294 | Intent detection, product search |
| **Controller** | ai.controller.ts | 270 | Gemini chatbot with history |
| **Service** | gemini.service.ts | 210 | Gemini AI integration |
| **TOTAL** | 5 files | ~800 | Full chatbot system |

---

## 🎯 Key Takeaways

### 1. **Two Approaches**
- **chat.controller.ts**: Rule-based intent detection + Gemini for response
- **ai.controller.ts**: Full AI-powered with conversation history

### 2. **Architecture Pattern**
```
Routes → Controller → Service → External API
                    ↓
                Database (MongoDB)
```

### 3. **Error Handling**
- Graceful fallbacks at every level
- Never expose technical errors to users
- Always provide alternative actions

### 4. **Performance Optimization**
- Lazy client initialization
- Limited context size (50 products max)
- Database query optimization (.select(), .limit())

### 5. **Security**
- API key in environment variables
- Input validation
- No sensitive data in logs

---

## 📖 Tài Liệu Liên Quan

- [CHATBOT_FLOW.md](./CHATBOT_FLOW.md) - Sơ đồ luồng xử lý
- [TECH_STACK.md](./TECH_STACK.md) - Lý thuyết công nghệ
- [Gemini AI Docs](https://ai.google.dev/docs)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-09
**Author:** LP SHOP Development Team
