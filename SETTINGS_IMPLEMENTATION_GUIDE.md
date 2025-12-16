# Hướng Dẫn Áp Dụng Settings Hệ Thống

## Tổng Quan
Hệ thống settings đã được triển khai đầy đủ với:
- ✅ Backend API (`/api/settings`)
- ✅ Settings Context cho customer-web và mobile-app
- ✅ API methods để lấy settings

## Cách Sử Dụng Settings

### 1. Customer Web - Sử Dụng Settings

#### a) Import useSettings Hook
```typescript
import { useSettings } from '@/contexts/SettingsContext';

const MyComponent = () => {
  const { settings, loading } = useSettings();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{settings?.storeName}</h1>
      <p>{settings?.storeDescription}</p>
    </div>
  );
};
```

#### b) Áp Dụng Settings Vào Header (Logo, Store Name)
**File: `apps/customer-web/components/layout/Header.tsx`**

```typescript
import { useSettings } from '@/contexts/SettingsContext';

const Header = () => {
  const { settings } = useSettings();

  return (
    <header>
      {/* Logo */}
      {settings?.storeLogo && (
        <Image
          src={settings.storeLogo}
          alt={settings.storeName}
          width={120}
          height={40}
        />
      )}

      {/* Store Name */}
      <h1>{settings?.storeName || 'Sport Store'}</h1>

      {/* Contact Info */}
      <div>
        <p>📞 {settings?.storePhone}</p>
        <p>✉️ {settings?.storeEmail}</p>
      </div>
    </header>
  );
};
```

#### c) Áp Dụng Settings Vào Footer (Social Links, Contact)
**File: `apps/customer-web/components/layout/Footer.tsx`**

```typescript
import { useSettings } from '@/contexts/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer>
      {/* Store Info */}
      <div>
        <h3>{settings?.storeName}</h3>
        <p>{settings?.storeDescription}</p>
        <p>📍 {settings?.storeAddress}</p>
        <p>📞 {settings?.storePhone}</p>
        <p>✉️ {settings?.storeEmail}</p>
      </div>

      {/* Social Links */}
      <div>
        <h4>Theo Dõi Chúng Tôi</h4>
        {settings?.socialLinks.facebook && (
          <a href={settings.socialLinks.facebook} target="_blank">
            Facebook
          </a>
        )}
        {settings?.socialLinks.instagram && (
          <a href={settings.socialLinks.instagram} target="_blank">
            Instagram
          </a>
        )}
        {settings?.socialLinks.youtube && (
          <a href={settings.socialLinks.youtube} target="_blank">
            YouTube
          </a>
        )}
        {settings?.socialLinks.tiktok && (
          <a href={settings.socialLinks.tiktok} target="_blank">
            TikTok
          </a>
        )}
      </div>
    </footer>
  );
};
```

#### d) Áp Dụng SEO Settings
**File: `apps/customer-web/app/layout.tsx`**

```typescript
'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.seo.metaTitle) {
      document.title = settings.seo.metaTitle;
    }

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings?.seo.metaDescription) {
      metaDesc.setAttribute('content', settings.seo.metaDescription);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && settings?.seo.metaKeywords) {
      metaKeywords.setAttribute('content', settings.seo.metaKeywords);
    }
  }, [settings]);

  return (
    // ... existing layout code
  );
}
```

#### e) Áp Dụng Payment Methods Settings
**File: `apps/customer-web/app/thanh-toan/page.tsx` hoặc checkout page**

```typescript
import { useSettings } from '@/contexts/SettingsContext';

const CheckoutPage = () => {
  const { settings } = useSettings();
  const [paymentMethod, setPaymentMethod] = useState('cod');

  return (
    <div>
      <h3>Phương Thức Thanh Toán</h3>

      {settings?.paymentMethods.cod && (
        <label>
          <input
            type="radio"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Thanh toán khi nhận hàng (COD)
        </label>
      )}

      {settings?.paymentMethods.vnpay && (
        <label>
          <input
            type="radio"
            value="vnpay"
            checked={paymentMethod === 'vnpay'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          VNPay
        </label>
      )}

      {settings?.paymentMethods.momo && (
        <label>
          <input
            type="radio"
            value="momo"
            checked={paymentMethod === 'momo'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          MoMo
        </label>
      )}

      {settings?.paymentMethods.bankTransfer && (
        <label>
          <input
            type="radio"
            value="bankTransfer"
            checked={paymentMethod === 'bankTransfer'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Chuyển khoản ngân hàng
        </label>
      )}
    </div>
  );
};
```

#### f) Áp Dụng Shipping Fee Settings
**File: `apps/customer-web/components/Cart.tsx` hoặc cart page**

```typescript
import { useSettings } from '@/contexts/SettingsContext';

const CartPage = () => {
  const { settings } = useSettings();
  const { cart } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate shipping fee based on settings
  const shippingFee = subtotal >= (settings?.freeShippingThreshold || 500000)
    ? 0
    : (settings?.shippingFee || 30000);

  const total = subtotal + shippingFee;

  return (
    <div>
      <h2>Giỏ Hàng</h2>

      {/* Cart items */}

      <div>
        <p>Tạm tính: {subtotal.toLocaleString('vi-VN')}₫</p>
        <p>
          Phí vận chuyển: {shippingFee.toLocaleString('vi-VN')}₫
          {shippingFee === 0 && ' (Miễn phí)'}
        </p>
        <p>Tổng cộng: {total.toLocaleString('vi-VN')}₫</p>

        {subtotal < (settings?.freeShippingThreshold || 500000) && (
          <p className="text-info">
            Mua thêm {((settings?.freeShippingThreshold || 500000) - subtotal).toLocaleString('vi-VN')}₫
            để được miễn phí vận chuyển
          </p>
        )}
      </div>
    </div>
  );
};
```

#### g) Chế Độ Bảo Trì (Maintenance Mode)
**File: `apps/customer-web/app/layout.tsx`**

```typescript
'use client';

import { useSettings } from '@/contexts/SettingsContext';
import MaintenancePage from '@/components/MaintenancePage';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSettings();

  if (loading) {
    return <LoadingScreen />;
  }

  // Show maintenance page if enabled
  if (settings?.maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    // ... normal layout
  );
}
```

**Tạo file: `apps/customer-web/components/MaintenancePage.tsx`**
```typescript
const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">🔧 Đang Bảo Trì</h1>
        <p className="text-lg text-gray-600 mb-4">
          Website đang được bảo trì để cải thiện trải nghiệm người dùng.
        </p>
        <p className="text-gray-500">
          Vui lòng quay lại sau. Xin cảm ơn!
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
```

### 2. Mobile App - Sử Dụng Settings

#### a) Import useSettings Hook
```typescript
import { useSettings } from '../contexts/SettingsContext';

const MyScreen = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>{settings?.storeName}</Text>
    </View>
  );
};
```

#### b) Áp Dụng Settings Vào Checkout Screen
**File: `apps/mobile-app/src/screens/Checkout/CheckoutScreen.tsx`**

```typescript
import { useSettings } from '../../contexts/SettingsContext';

const CheckoutScreen = () => {
  const { settings } = useSettings();
  const [paymentMethod, setPaymentMethod] = useState('cod');

  return (
    <ScrollView>
      <Text style={styles.sectionTitle}>Phương Thức Thanh Toán</Text>

      {settings?.paymentMethods.cod && (
        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => setPaymentMethod('cod')}
        >
          <Text>💵 Thanh toán khi nhận hàng (COD)</Text>
          {paymentMethod === 'cod' && <Ionicons name="checkmark-circle" />}
        </TouchableOpacity>
      )}

      {settings?.paymentMethods.vnpay && (
        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => setPaymentMethod('vnpay')}
        >
          <Text>💳 VNPay</Text>
          {paymentMethod === 'vnpay' && <Ionicons name="checkmark-circle" />}
        </TouchableOpacity>
      )}

      {settings?.paymentMethods.momo && (
        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => setPaymentMethod('momo')}
        >
          <Text>📱 MoMo</Text>
          {paymentMethod === 'momo' && <Ionicons name="checkmark-circle" />}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};
```

#### c) Áp Dụng Shipping Fee trong Cart
**File: `apps/mobile-app/src/screens/Cart/CartScreen.tsx`**

```typescript
import { useSettings } from '../../contexts/SettingsContext';

const CartScreen = () => {
  const { settings } = useSettings();
  const { cart } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shippingFee = subtotal >= (settings?.freeShippingThreshold || 500000)
    ? 0
    : (settings?.shippingFee || 30000);

  const total = subtotal + shippingFee;

  return (
    <View>
      {/* Cart items */}

      <View style={styles.summary}>
        <Text>Tạm tính: ₫{subtotal.toLocaleString('vi-VN')}</Text>
        <Text>
          Phí vận chuyển: ₫{shippingFee.toLocaleString('vi-VN')}
          {shippingFee === 0 && ' (Miễn phí)'}
        </Text>
        <Text style={styles.total}>
          Tổng cộng: ₫{total.toLocaleString('vi-VN')}
        </Text>

        {subtotal < (settings?.freeShippingThreshold || 500000) && (
          <Text style={styles.freeShippingInfo}>
            Mua thêm ₫{((settings?.freeShippingThreshold || 500000) - subtotal).toLocaleString('vi-VN')}
            để được miễn phí vận chuyển
          </Text>
        )}
      </View>
    </View>
  );
};
```

#### d) Hiển Thị Thông Tin Cửa Hàng
**File: `apps/mobile-app/src/screens/Contact/ContactScreen.tsx` (tạo mới nếu chưa có)**

```typescript
import { useSettings } from '../../contexts/SettingsContext';

const ContactScreen = () => {
  const { settings } = useSettings();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông Tin Liên Hệ</Text>

        <View style={styles.contactItem}>
          <Ionicons name="storefront" size={24} color={COLORS.primary} />
          <Text style={styles.contactText}>{settings?.storeName}</Text>
        </View>

        <View style={styles.contactItem}>
          <Ionicons name="location" size={24} color={COLORS.primary} />
          <Text style={styles.contactText}>{settings?.storeAddress}</Text>
        </View>

        <View style={styles.contactItem}>
          <Ionicons name="call" size={24} color={COLORS.primary} />
          <Text style={styles.contactText}>{settings?.storePhone}</Text>
        </View>

        <View style={styles.contactItem}>
          <Ionicons name="mail" size={24} color={COLORS.primary} />
          <Text style={styles.contactText}>{settings?.storeEmail}</Text>
        </View>
      </View>

      {/* Social Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theo Dõi Chúng Tôi</Text>

        {settings?.socialLinks.facebook && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL(settings.socialLinks.facebook)}
          >
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            <Text>Facebook</Text>
          </TouchableOpacity>
        )}

        {settings?.socialLinks.instagram && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL(settings.socialLinks.instagram)}
          >
            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            <Text>Instagram</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
```

## 3. Cách Test Settings

### Test trên Admin Panel:
1. Đăng nhập admin panel
2. Vào **Cài Đặt > Cài đặt chung**
3. Thay đổi:
   - Tên cửa hàng
   - Logo
   - Phí vận chuyển
   - Miễn phí ship từ (VND)
4. Bật/tắt các phương thức thanh toán
5. Cập nhật thông tin SEO
6. Nhập social links
7. Click "Lưu cài đặt"

### Kiểm Tra Customer Web:
1. Refresh trang customer-web
2. Kiểm tra Header xem logo và tên cửa hàng đã thay đổi
3. Kiểm tra Footer xem thông tin liên hệ và social links
4. Vào giỏ hàng kiểm tra phí ship và threshold miễn phí ship
5. Vào trang checkout kiểm tra payment methods chỉ hiển thị các phương thức đã bật
6. Kiểm tra SEO bằng cách view page source

### Kiểm Tra Mobile App:
1. Reload app (shake device > Reload)
2. Vào giỏ hàng kiểm tra shipping fee
3. Vào checkout kiểm tra payment methods
4. Vào màn hình Contact/Profile kiểm tra thông tin cửa hàng

## 4. Maintenance Mode

Khi bật Maintenance Mode trong admin:
- Customer web sẽ hiển thị trang "Đang bảo trì"
- Mobile app có thể hiển thị modal thông báo bảo trì
- Admin panel vẫn hoạt động bình thường

## Lưu Ý

1. **Settings được cache trong Context**: Settings chỉ load 1 lần khi app khởi động
2. **Refresh settings**: Có thể gọi `refreshSettings()` để load lại settings mới nhất
3. **Default values**: Nếu API fail, sẽ dùng default settings
4. **Type safety**: Tất cả settings đều có TypeScript types đầy đủ

## Các Settings Đã Triển Khai

✅ Backend:
- Model: Settings.ts
- Controller: settings.controller.ts
- Routes: settings.routes.ts
- API: GET `/api/settings`, PUT `/api/settings`

✅ Customer Web:
- Context: SettingsContext.tsx
- API method: api.getSettings()
- Provider: Wrapped in layout.tsx

✅ Mobile App:
- Context: SettingsContext.tsx
- API method: api.getSettings()
- Provider: Wrapped in App.tsx

## Next Steps (Tùy Chọn Mở Rộng)

1. **Cache settings trong localStorage/AsyncStorage** để giảm API calls
2. **Real-time settings update** qua WebSocket hoặc polling
3. **Multi-language settings** để support nhiều ngôn ngữ
4. **Advanced SEO settings** như Open Graph, Twitter Cards
5. **Email templates settings** để customize email notifications
