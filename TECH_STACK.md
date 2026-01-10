# 📚 Tech Stack & Lý Thuyết Cơ Bản

> Tài liệu này giải thích các công nghệ, ngôn ngữ lập trình và framework được sử dụng trong dự án LP SHOP E-Commerce

---

## 📑 Mục Lục

1. [Ngôn Ngữ Lập Trình](#1-ngôn-ngữ-lập-trình)
2. [Frontend Technologies](#2-frontend-technologies)
3. [Backend Technologies](#3-backend-technologies)
4. [Database & Caching](#4-database--caching)
5. [Mobile Development](#5-mobile-development)
6. [Third-party Services](#6-third-party-services)
7. [Development Tools](#7-development-tools)

---

## 1. Ngôn Ngữ Lập Trình

### 1.1. JavaScript (ES6+)

**Khái niệm:**
- Ngôn ngữ lập trình động, chạy trên trình duyệt và server (Node.js)
- Event-driven, non-blocking I/O
- Prototype-based, multi-paradigm (OOP, Functional Programming)

**Đặc điểm chính:**
- **Asynchronous**: Promise, async/await cho xử lý bất đồng bộ
- **First-class functions**: Hàm có thể được gán vào biến, truyền làm tham số
- **Closures**: Hàm có thể truy cập biến từ scope bên ngoài
- **Event Loop**: Xử lý các tác vụ bất đồng bộ

**Ví dụ trong dự án:**
```javascript
// Async/await
const fetchBrands = async () => {
  try {
    const data = await getBrands()
    setBrands(data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Arrow functions & Higher-order functions
const activeBrands = brands.filter(brand => brand.trangThai === 'active')
```

### 1.2. TypeScript

**Khái niệm:**
- Superset của JavaScript, thêm hệ thống kiểu tĩnh (static typing)
- Compile-time type checking để phát hiện lỗi sớm
- Hỗ trợ OOP tốt hơn với interfaces, generics, decorators

**Lợi ích:**
- ✅ **Type Safety**: Phát hiện lỗi khi compile thay vì runtime
- ✅ **IntelliSense**: Autocomplete tốt hơn trong IDE
- ✅ **Maintainability**: Dễ refactor và maintain code lớn
- ✅ **Documentation**: Types là documentation tự động

**Ví dụ trong dự án:**
```typescript
// Interface định nghĩa cấu trúc dữ liệu
interface Brand {
  _id: string
  ten: string
  slug: string
  logo?: string  // Optional property
  thuTu: number
  trangThai: 'active' | 'inactive'  // Union types
}

// Type-safe function
async function getBrands(): Promise<Brand[]> {
  const result = await api.request('/brands')
  return result.data || []
}
```

---

## 2. Frontend Technologies

### 2.1. React

**Khái niệm:**
- JavaScript library cho xây dựng UI
- Component-based architecture
- Virtual DOM để tối ưu performance
- Unidirectional data flow (one-way binding)

**Core Concepts:**

#### 2.1.1. Components
- **Functional Components**: Sử dụng functions để định nghĩa UI
- **Props**: Dữ liệu truyền từ component cha xuống con (read-only)
- **State**: Dữ liệu nội bộ của component (mutable)

```jsx
// Functional Component với Props
function ProductCard({ name, price, image }) {
  return (
    <div className="card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>{price}</p>
    </div>
  )
}
```

#### 2.1.2. Hooks
Hooks cho phép sử dụng state và lifecycle trong functional components.

**useState**: Quản lý state
```javascript
const [brands, setBrands] = useState([])
// brands: giá trị hiện tại
// setBrands: hàm để update state
```

**useEffect**: Side effects (API calls, subscriptions)
```javascript
useEffect(() => {
  // Chạy sau khi component render
  fetchBrands()

  return () => {
    // Cleanup function (optional)
  }
}, []) // Dependency array: [] = chỉ chạy 1 lần
```

**useContext**: Share data giữa components
```javascript
const { user } = useContext(AuthContext)
```

**Custom Hooks**: Tái sử dụng logic
```javascript
function useWishlist() {
  const [items, setItems] = useState([])
  const addItem = (item) => setItems([...items, item])
  return { items, addItem }
}
```

#### 2.1.3. Virtual DOM

**Cách hoạt động:**
1. State thay đổi → React tạo Virtual DOM mới
2. So sánh Virtual DOM mới với cũ (Reconciliation)
3. Chỉ update phần thay đổi vào Real DOM (Diffing Algorithm)

**Lợi ích:**
- Performance: Giảm số lần manipulate DOM
- Batch updates: Gom nhiều thay đổi thành 1 lần update

### 2.2. Next.js 14

**Khái niệm:**
- React framework với Server-Side Rendering (SSR)
- File-based routing
- API routes
- Image optimization
- Automatic code splitting

**Key Features:**

#### 2.2.1. App Router (Next.js 13+)
```
app/
├── page.tsx           → / (Homepage)
├── san-pham/
│   └── [slug]/
│       └── page.tsx   → /san-pham/:slug (Dynamic route)
└── api/
    └── brands/
        └── route.ts   → API endpoint
```

#### 2.2.2. Rendering Strategies

**Server Components (Default):**
- Render trên server
- Không gửi JavaScript xuống client
- Tốt cho SEO và performance

```tsx
// app/page.tsx (Server Component)
export default function HomePage() {
  // Fetch data trực tiếp trên server
  return <div>...</div>
}
```

**Client Components:**
- Render trên client (browser)
- Cần khi dùng hooks, event handlers

```tsx
'use client' // Directive để khai báo Client Component

export default function BrandSlider() {
  const [brands, setBrands] = useState([])
  // ... có thể dùng hooks
}
```

#### 2.2.3. Image Optimization

```tsx
<Image
  src="/logo.png"
  alt="Logo"
  width={500}
  height={300}
  loading="lazy"  // Lazy loading
  sizes="(max-width: 768px) 100vw, 50vw"  // Responsive
/>
```

**Tự động:**
- Resize ảnh theo device
- Convert sang WebP
- Lazy loading
- Blur placeholder

### 2.3. Tailwind CSS

**Khái niệm:**
- Utility-first CSS framework
- Inline styling với pre-defined classes
- Không cần viết CSS riêng

**Philosophy:**
- **Utility Classes**: Mỗi class làm 1 việc
- **Composition**: Kết hợp nhiều classes
- **Responsive**: Mobile-first breakpoints

**Ví dụ:**
```jsx
<div className="
  flex items-center justify-center    // Flexbox
  p-4 md:p-8                          // Padding responsive
  bg-gradient-to-r from-blue-500     // Gradient
  rounded-lg shadow-xl               // Border radius & shadow
  hover:scale-105 transition-all     // Hover effect
">
  Content
</div>
```

**Breakpoints:**
- `sm:` → ≥ 640px (tablet)
- `md:` → ≥ 768px (desktop nhỏ)
- `lg:` → ≥ 1024px (desktop)
- `xl:` → ≥ 1280px (desktop lớn)

**Custom Config:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#1A75FF',
          600: '#0F5FE0'
        }
      }
    }
  }
}
```

---

## 3. Backend Technologies

### 3.1. Node.js

**Khái niệm:**
- JavaScript runtime chạy trên server
- Built trên V8 Engine (Chrome)
- Event-driven, non-blocking I/O
- Single-threaded với Event Loop

**Event Loop:**
```
┌───────────────────────────┐
│        Timers             │  setTimeout, setInterval
├───────────────────────────┤
│     Pending Callbacks     │  I/O callbacks
├───────────────────────────┤
│         Poll              │  Incoming connections, data
├───────────────────────────┤
│         Check             │  setImmediate
├───────────────────────────┤
│    Close Callbacks        │  socket.on('close')
└───────────────────────────┘
```

**Lợi ích:**
- ✅ Non-blocking I/O → Xử lý nhiều requests đồng thời
- ✅ Same language (JavaScript) cho cả frontend & backend
- ✅ NPM ecosystem lớn
- ✅ Tốt cho real-time apps (WebSocket, SSE)

### 3.2. Express.js

**Khái niệm:**
- Web framework nhẹ cho Node.js
- Routing, middleware system
- RESTful API development

**Core Concepts:**

#### 3.2.1. Middleware
Functions xử lý request trước khi đến route handler.

```javascript
// Middleware function
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next() // Chuyển sang middleware tiếp theo
}

app.use(logger) // Apply cho tất cả routes
```

**Middleware Chain:**
```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
          (auth)         (validate)      (controller)
```

#### 3.2.2. Routing

```javascript
const router = express.Router()

// GET /api/brands
router.get('/', getBrands)

// GET /api/brands/:id
router.get('/:id', getBrand)

// POST /api/brands (Protected)
router.post('/', protect, authorize('admin'), createBrand)

app.use('/api/brands', router)
```

#### 3.2.3. Error Handling

```javascript
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message
  })
})
```

---

## 4. Database & Caching

### 4.1. MongoDB

**Khái niệm:**
- NoSQL document database
- Schema-less (flexible structure)
- JSON-like documents (BSON)
- Horizontal scaling (sharding)

**Document Structure:**
```javascript
// Collection: brands
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  ten: "Nike",
  slug: "nike",
  logo: "https://...",
  thuTu: 1,
  trangThai: "active",
  createdAt: ISODate("2024-01-01T00:00:00Z")
}
```

**CRUD Operations:**
```javascript
// Create
await Brand.create({ ten: "Adidas", ... })

// Read
await Brand.find({ trangThai: 'active' })
await Brand.findById(id)

// Update
await Brand.findByIdAndUpdate(id, { thuTu: 2 })

// Delete
await Brand.findByIdAndDelete(id)
```

### 4.2. Mongoose

**Khái niệm:**
- ODM (Object Data Modeling) library cho MongoDB
- Schema validation
- Middleware (pre/post hooks)
- Query building

**Schema Definition:**
```javascript
const BrandSchema = new Schema({
  ten: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    unique: true,
    maxlength: 100
  },
  thuTu: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true  // Auto createdAt, updatedAt
})

// Middleware
BrandSchema.pre('save', function(next) {
  // Chạy trước khi save
  this.slug = slugify(this.ten)
  next()
})

export default mongoose.model('Brand', BrandSchema)
```

**Query Methods:**
```javascript
// Chainable queries
const brands = await Brand
  .find({ trangThai: 'active' })
  .sort({ thuTu: 1 })
  .limit(10)
  .select('ten logo')  // Chỉ lấy 2 fields
  .lean()  // Return plain JavaScript object
```

### 4.3. Redis

**Khái niệm:**
- In-memory data store (key-value)
- Cực nhanh (microseconds latency)
- Use cases: Caching, Session, Real-time analytics

**Data Structures:**
```javascript
// String
await redis.set('key', 'value', 'EX', 3600)  // TTL 1 hour
const value = await redis.get('key')

// Hash (Object)
await redis.hset('user:123', {
  name: 'John',
  email: 'john@example.com'
})

// List (Array)
await redis.lpush('queue', 'task1', 'task2')
```

**Caching Strategy:**
```javascript
// Cache-aside pattern
async function getBrand(id) {
  // 1. Kiểm tra cache
  const cached = await redis.get(`brand:${id}`)
  if (cached) return JSON.parse(cached)

  // 2. Nếu không có, query database
  const brand = await Brand.findById(id)

  // 3. Lưu vào cache
  await redis.set(`brand:${id}`, JSON.stringify(brand), 'EX', 3600)

  return brand
}
```

---

## 5. Mobile Development

### 5.1. React Native

**Khái niệm:**
- Framework để build native mobile apps với React
- Learn once, write anywhere (iOS & Android)
- JavaScript → Native components

**Architecture:**
```
JavaScript Thread  ←→  Bridge  ←→  Native Thread
(React logic)                      (UI rendering)
```

**Components:**
```jsx
import { View, Text, Image, TouchableOpacity } from 'react-native'

function ProductCard({ product }) {
  return (
    <TouchableOpacity>  {/* Native button */}
      <View>           {/* Native View */}
        <Image source={{ uri: product.image }} />
        <Text>{product.name}</Text>
      </View>
    </TouchableOpacity>
  )
}
```

**Platform-specific code:**
```javascript
import { Platform } from 'react-native'

const styles = StyleSheet.create({
  container: {
    padding: Platform.select({
      ios: 10,
      android: 15
    })
  }
})
```

---

## 6. Third-party Services

### 6.1. Google Gemini AI

**Khái niệm:**
- Large Language Model (LLM) của Google
- Multi-modal (text, image, video)
- Context-aware conversations

**Use Case trong dự án:**
- Chatbot hỗ trợ khách hàng
- Intent detection (tìm sản phẩm, tra cứu đơn hàng)
- Product recommendations

**Integration:**
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

const chat = model.startChat({
  history: previousMessages,
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 500
  }
})

const result = await chat.sendMessage(userMessage)
```

**Concepts:**
- **Prompt Engineering**: Cách viết prompt để có output tốt
- **Context Window**: Số tokens model có thể xử lý
- **Temperature**: Độ "sáng tạo" (0 = deterministic, 1 = creative)

### 6.2. PayOS

**Khái niệm:**
- Payment gateway Việt Nam
- QR code banking transfer
- Webhook notifications

**Payment Flow:**
```
1. Customer checkout
   ↓
2. Backend tạo payment link (PayOS API)
   ↓
3. Customer scan QR → Chuyển khoản
   ↓
4. PayOS gửi webhook → Backend
   ↓
5. Backend cập nhật order status
   ↓
6. Redirect customer về success page
```

### 6.3. Cloudinary

**Khái niệm:**
- Cloud-based image/video management
- Upload, transform, optimize, deliver

**Features:**
- Auto format conversion (WebP, AVIF)
- Responsive images
- Lazy loading
- CDN delivery

**URL Transformations:**
```
https://res.cloudinary.com/demo/image/upload/
  w_300,h_200,c_fill,q_auto,f_auto/
  product.jpg

w_300: width 300px
h_200: height 200px
c_fill: crop mode
q_auto: auto quality
f_auto: auto format (WebP)
```

---

## 7. Development Tools

### 7.1. Git & GitHub

**Git Concepts:**
- **Repository**: Kho lưu trữ code
- **Commit**: Snapshot của code tại thời điểm
- **Branch**: Nhánh phát triển độc lập
- **Merge**: Gộp code từ branch khác

**Git Flow:**
```
master (production)
  ↑
  merge ← develop (staging)
           ↑
           merge ← feature/add-brand-slider
```

**Common Commands:**
```bash
git add .                    # Stage changes
git commit -m "message"      # Commit
git push origin main         # Push to remote
git pull                     # Pull latest
git checkout -b feature/x    # New branch
git merge develop            # Merge branch
```

### 7.2. NPM (Node Package Manager)

**Khái niệm:**
- Package manager cho JavaScript
- Quản lý dependencies
- Run scripts

**package.json:**
```json
{
  "name": "lp-shop",
  "scripts": {
    "dev": "next dev",      // npm run dev
    "build": "next build",  // npm run build
    "start": "next start"   // npm start
  },
  "dependencies": {
    "next": "^14.2.3",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**Semantic Versioning:**
```
^1.2.3  → ≥1.2.3 <2.0.0  (minor updates OK)
~1.2.3  → ≥1.2.3 <1.3.0  (patch updates only)
1.2.3   → exact version
```

### 7.3. ESLint & Prettier

**ESLint:**
- Linter để tìm lỗi code
- Enforce coding standards

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
}
```

**Prettier:**
- Code formatter
- Auto format on save

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2
}
```

---

## 8. Architecture Patterns

### 8.1. MVC (Model-View-Controller)

```
Model (Database Schema)
  ↕
Controller (Business Logic)
  ↕
Routes (API Endpoints)
  ↕
View (Frontend)
```

**Ví dụ trong dự án:**
```
Model: Brand.ts (Mongoose schema)
  ↓
Controller: brand.controller.ts (CRUD logic)
  ↓
Routes: brand.routes.ts (API endpoints)
  ↓
Frontend: BrandSlider.tsx (Display)
```

### 8.2. RESTful API Design

**REST Principles:**
- **Stateless**: Mỗi request độc lập
- **Resource-based**: URL đại diện cho resources
- **HTTP Methods**: GET, POST, PUT, DELETE

**API Convention:**
```
GET    /api/brands       → Lấy danh sách
GET    /api/brands/:id   → Lấy 1 brand
POST   /api/brands       → Tạo mới
PUT    /api/brands/:id   → Cập nhật
DELETE /api/brands/:id   → Xóa
```

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### 8.3. Component-Driven Development

**Atomic Design:**
```
Atoms (Smallest)
  ↓
Molecules
  ↓
Organisms
  ↓
Templates
  ↓
Pages (Largest)
```

**Ví dụ:**
- **Atom**: Button, Input
- **Molecule**: SearchBar (Input + Button)
- **Organism**: Header (Logo + SearchBar + Cart)
- **Template**: ProductGrid layout
- **Page**: Homepage

---

## 9. Performance Optimization

### 9.1. Frontend

**Techniques:**
- ✅ **Code Splitting**: Tách code thành chunks nhỏ
- ✅ **Lazy Loading**: Load components khi cần
- ✅ **Image Optimization**: WebP, responsive sizes
- ✅ **Memoization**: `useMemo`, `React.memo`
- ✅ **Debouncing**: Giảm số lần gọi function

```javascript
// Lazy loading component
const ProductModal = lazy(() => import('./ProductModal'))

// Memoization
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

// Debouncing search
const debouncedSearch = debounce((query) => {
  searchProducts(query)
}, 300)
```

### 9.2. Backend

**Techniques:**
- ✅ **Database Indexing**: Tăng tốc queries
- ✅ **Caching**: Redis cho frequent data
- ✅ **Pagination**: Giới hạn số records trả về
- ✅ **Connection Pooling**: Tái sử dụng DB connections

```javascript
// MongoDB Indexing
BrandSchema.index({ slug: 1 })  // Single index
BrandSchema.index({ ten: 1, thuTu: 1 })  // Compound index

// Pagination
const page = parseInt(req.query.page) || 1
const limit = 20
const skip = (page - 1) * limit

const products = await Product
  .find()
  .skip(skip)
  .limit(limit)
```

---

## 10. Security Best Practices

### 10.1. Authentication & Authorization

**JWT (JSON Web Token):**
```javascript
// Tạo token
const token = jwt.sign(
  { userId: user._id, role: user.role },
  SECRET_KEY,
  { expiresIn: '7d' }
)

// Verify token
const decoded = jwt.verify(token, SECRET_KEY)
```

**Middleware Protection:**
```javascript
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const decoded = jwt.verify(token, SECRET_KEY)
  req.user = await User.findById(decoded.userId)
  next()
}
```

### 10.2. Input Validation

**Prevent SQL Injection, XSS:**
```javascript
// Validation middleware
const validateBrand = [
  body('ten')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),  // Escape HTML characters
  body('moTa')
    .optional()
    .trim()
    .escape()
]

router.post('/', validateBrand, createBrand)
```

### 10.3. CORS (Cross-Origin Resource Sharing)

```javascript
app.use(cors({
  origin: ['https://lpshop.com'],  // Allowed origins
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))
```

---

## 11. Testing

### 11.1. Unit Testing (Jest)

```javascript
// brand.controller.test.ts
describe('Brand Controller', () => {
  test('should create brand', async () => {
    const newBrand = { ten: 'Nike' }
    const result = await createBrand(newBrand)

    expect(result.success).toBe(true)
    expect(result.data.ten).toBe('Nike')
  })
})
```

### 11.2. Integration Testing

```javascript
// API endpoint test
describe('GET /api/brands', () => {
  test('should return brands list', async () => {
    const res = await request(app)
      .get('/api/brands')
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})
```

---

## 12. Deployment

### 12.1. Production Checklist

**Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=mongodb://...
REDIS_URL=redis://...
JWT_SECRET=...
```

**Build Process:**
```bash
# Frontend (Next.js)
npm run build    # Tạo optimized production build
npm start        # Chạy production server

# Backend
npm run build    # Compile TypeScript → JavaScript
npm start        # Chạy compiled code
```

**Hosting Options:**
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Backend**: Railway, Render, AWS EC2
- **Database**: MongoDB Atlas, AWS DocumentDB
- **CDN**: Cloudflare, AWS CloudFront

---

## 📖 Tài Liệu Tham Khảo

### JavaScript & TypeScript
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### React & Next.js
- [React Docs](https://react.dev/)
- [Next.js Docs](https://nextjs.org/docs)

### Backend
- [Node.js Docs](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Mongoose Docs](https://mongoosejs.com/docs/)

### Tools
- [Git Documentation](https://git-scm.com/doc)
- [NPM Docs](https://docs.npmjs.com/)

---

## 💡 Kết Luận

Dự án LP SHOP sử dụng một tech stack hiện đại, scalable và maintainable:

✅ **Full-stack JavaScript/TypeScript** - Cùng ngôn ngữ cho frontend & backend
✅ **React Ecosystem** - Component-driven, declarative UI
✅ **Next.js** - SSR, SEO-friendly, optimized performance
✅ **MongoDB** - Flexible schema, horizontal scaling
✅ **Redis** - Fast caching, real-time features
✅ **Modern DevOps** - Git, CI/CD, Cloud hosting

**Key Takeaways:**
- Hiểu rõ concepts cơ bản trước khi code
- Tuân thủ best practices và conventions
- Security first mindset
- Performance optimization
- Code maintainability & scalability
