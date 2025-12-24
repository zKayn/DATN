import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/config';
import ProductCard from '../../components/ProductCard';
import AnimatedTouchable from '../../components/AnimatedTouchable';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = width * 0.5; // Shopee-style compact banner
const CARD_WIDTH = (width - 48) / 2; // 2 columns with spacing

// Festive Color Palette (matching customer-web)
const SHOPEE_COLORS = {
  primary: '#DC2626', // Red - matches customer-web
  primaryDark: '#B91C1C',
  secondary: '#16A34A', // Green - matches customer-web
  red: '#DC2626',
  orange: '#F59E0B',
  yellow: '#FBBF24',
  green: '#16A34A',
  blue: '#3B82F6',
  purple: '#9333EA',
  pink: '#EC4899',
  teal: '#14B8A6',
  white: '#FFFFFF',
  lightGray: '#F3F4F6', // matches COLORS.gray[100]
  darkGray: '#6B7280', // matches COLORS.gray[500]
};

const banners = [
  {
    id: 1,
    title: 'Siêu Sale 12.12',
    subtitle: 'Giảm đến 50%',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop',
    badge: 'HOT',
    action: 'sale',
  },
  {
    id: 2,
    title: 'Hàng Mới Về',
    subtitle: 'Sản phẩm mới nhất',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=400&fit=crop',
    badge: 'NEW',
    action: 'new',
  },
  {
    id: 3,
    title: 'Bán Chạy Nhất',
    subtitle: 'Top sản phẩm',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=400&fit=crop',
    badge: 'SALE',
    action: 'bestseller',
  },
];

// Icon mapping for categories
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('giày') || name.includes('dép')) return 'footsteps-outline';
  if (name.includes('áo') || name.includes('shirt')) return 'shirt-outline';
  if (name.includes('quần') || name.includes('pants')) return 'fitness-outline';
  if (name.includes('phụ kiện') || name.includes('accessories')) return 'watch-outline';
  if (name.includes('gym') || name.includes('thể thao')) return 'barbell-outline';
  if (name.includes('túi') || name.includes('ví') || name.includes('balo')) return 'bag-handle-outline';
  if (name.includes('điện thoại') || name.includes('phone')) return 'phone-portrait-outline';
  if (name.includes('laptop') || name.includes('máy tính')) return 'laptop-outline';
  if (name.includes('đồng hồ') || name.includes('watch')) return 'watch-outline';
  return 'cube-outline';
};

// Color gradients pool
const GRADIENT_COLORS = [
  [SHOPEE_COLORS.blue, '#0066CC'],
  [SHOPEE_COLORS.pink, '#DB2777'],
  [SHOPEE_COLORS.purple, '#7C3AED'],
  [SHOPEE_COLORS.teal, '#0D9488'],
  [SHOPEE_COLORS.orange, SHOPEE_COLORS.primaryDark],
  [SHOPEE_COLORS.secondary, '#EAB308'],
  [SHOPEE_COLORS.green, '#15803D'],
  [SHOPEE_COLORS.red, '#B91C1C'],
] as const;

const quickActions = [
  { id: 1, title: 'Flash Sale', icon: 'flash', gradient: [SHOPEE_COLORS.red, '#DC2626'] as const, filter: 'sale' },
  { id: 2, title: 'Hàng mới về', icon: 'sparkles', gradient: [SHOPEE_COLORS.pink, '#DB2777'] as const, filter: 'new' },
  { id: 3, title: 'Bán chạy', icon: 'trophy', gradient: [SHOPEE_COLORS.orange, '#EAB308'] as const, filter: 'bestseller' },
  { id: 5, title: 'Tất cả sản phẩm', icon: 'apps', gradient: [SHOPEE_COLORS.blue, '#0066CC'] as const, filter: 'all' },
];

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { cartCount } = useCart();
  const { unreadCount } = useNotification();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const bannerScrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentBanner + 1) % banners.length;
      setCurrentBanner(nextIndex);
      bannerScrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [currentBanner]);

  // Countdown timer for flash sale
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [featured, newArr, categoriesData] = await Promise.all([
        api.getFeaturedProducts(),
        api.getNewProducts(),
        api.getCategories(),
      ]);

      if (featured.success && featured.data) {
        const data = Array.isArray(featured.data) ? featured.data : featured.data.products || [];
        setFeaturedProducts(data.slice(0, 10));
        setFlashSaleProducts(data.slice(0, 6));
      }

      if (newArr.success && newArr.data) {
        const data = Array.isArray(newArr.data) ? newArr.data : newArr.data.products || [];
        setNewProducts(data.slice(0, 10));
      }

      if (categoriesData.success && categoriesData.data) {
        const cats = Array.isArray(categoriesData.data)
          ? categoriesData.data
          : categoriesData.data.categories || [];

        // Map categories with icons and gradients
        const mappedCategories = cats.slice(0, 8).map((cat: any, index: number) => ({
          id: cat._id,
          name: cat.ten,
          slug: cat.slug,
          icon: getCategoryIcon(cat.ten),
          gradient: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
        }));

        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (filter: string) => {
    switch (filter) {
      case 'sale':
        // Navigate to products with sale filter (has discount)
        navigation.navigate('Products', { filter: 'sale' });
        break;
      case 'new':
        // Navigate to new products
        navigation.navigate('Products', { filter: 'new' });
        break;
      case 'bestseller':
        // Navigate to bestseller products
        navigation.navigate('Products', { filter: 'bestseller' });
        break;
      case 'featured':
        // Navigate to featured products
        navigation.navigate('Products', { filter: 'featured' });
        break;
      case 'all':
        // Navigate to all products
        navigation.navigate('Products', { filter: 'all' });
        break;
      default:
        navigation.navigate('Products', { filter: 'all' });
    }
  };

  const handleBannerClick = (action: string) => {
    handleQuickAction(action);
  };

  // HEADER - Shopee/Lazada Style
  const renderHeader = () => (
    <LinearGradient
      colors={[SHOPEE_COLORS.primary, SHOPEE_COLORS.primaryDark]}
      style={[styles.header, { paddingTop: insets.top + 8 }]}
    >
      {/* Top Bar */}
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>LP Shop</Text>
          <Ionicons name="star" size={16} color={SHOPEE_COLORS.secondary} />
        </View>
        <View style={styles.headerIcons}>
          <AnimatedTouchable onPress={() => navigation.navigate('Notifications')} scaleValue={0.9}>
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications-outline" size={24} color={SHOPEE_COLORS.white} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </AnimatedTouchable>
          <AnimatedTouchable onPress={() => navigation.navigate('Cart')} scaleValue={0.9}>
            <View style={styles.cartIcon}>
              <Ionicons name="cart-outline" size={24} color={SHOPEE_COLORS.white} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          </AnimatedTouchable>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={20} color={SHOPEE_COLORS.darkGray} />
        <Text style={styles.searchPlaceholder}>Tìm kiếm sản phẩm...</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  // FLASH SALE SECTION
  const renderFlashSale = () => (
    <View style={styles.flashSaleSection}>
      <LinearGradient
        colors={[SHOPEE_COLORS.red, SHOPEE_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.flashSaleHeader}
      >
        <View style={styles.flashSaleTitleContainer}>
          <Ionicons name="flash" size={24} color={SHOPEE_COLORS.white} />
          <Text style={styles.flashSaleTitle}>FLASH SALE</Text>
        </View>
        <View style={styles.flashSaleTimer}>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{String(timeLeft.hours).padStart(2, '0')}</Text>
          </View>
          <Text style={styles.timerSeparator}>:</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
          </View>
          <Text style={styles.timerSeparator}>:</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.seeAllFlash}
          onPress={() => handleQuickAction('sale')}
        >
          <Text style={styles.seeAllFlashText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color={SHOPEE_COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flashSaleList}
      >
        {flashSaleProducts.map((product, index) => (
          <AnimatedTouchable
            key={product._id || index}
            style={styles.flashSaleCard}
            onPress={() => navigation.navigate('ProductDetail', { id: product._id })}
            scaleValue={0.95}
          >
            <Image
              source={{ uri: product.hinhAnh?.[0] || 'https://via.placeholder.com/150' }}
              style={styles.flashSaleImage}
            />
            <View style={styles.flashSaleBadge}>
              <Text style={styles.flashSaleBadgeText}>
                -{product.giaKhuyenMai ? Math.round(((product.gia - product.giaKhuyenMai) / product.gia) * 100) : Math.floor(Math.random() * 50 + 20)}%
              </Text>
            </View>
            <View style={styles.flashSalePrice}>
              <Text style={styles.flashSalePriceText}>₫{(product.giaKhuyenMai || product.gia || 0).toLocaleString('vi-VN')}</Text>
            </View>
            <View style={styles.flashSaleProgress}>
              <View style={[styles.flashSaleProgressBar, { width: `${Math.min((product.daBan || 0) / 100 * 100, 90)}%` }]} />
            </View>
            <Text style={styles.flashSaleSold}>Đã bán {product.daBan || 0}</Text>
          </AnimatedTouchable>
        ))}
      </ScrollView>
    </View>
  );

  // BANNER CAROUSEL
  const renderBannerCarousel = () => (
    <View style={styles.bannerSection}>
      <Animated.ScrollView
        ref={bannerScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentBanner(index);
        }}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={styles.bannerItem}
            activeOpacity={0.9}
            onPress={() => handleBannerClick(banner.action)}
          >
            <Image source={{ uri: banner.image }} style={styles.bannerImage} />
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>{banner.badge}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {/* Pagination Dots */}
      <View style={styles.bannerPagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.bannerDot,
              index === currentBanner && styles.bannerDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  // CATEGORIES - Horizontal Scroll
  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {categories.map((category) => (
          <AnimatedTouchable
            key={category.id}
            style={styles.categoryItem}
            onPress={() => navigation.navigate('Products', { category: category.slug || category.name })}
            scaleValue={0.95}
          >
            <LinearGradient
              colors={category.gradient}
              style={styles.categoryIconContainer}
            >
              <Ionicons name={category.icon as any} size={28} color={SHOPEE_COLORS.white} />
            </LinearGradient>
            <Text style={styles.categoryName} numberOfLines={2}>{category.name}</Text>
          </AnimatedTouchable>
        ))}
      </ScrollView>
    </View>
  );

  // QUICK ACTIONS - Horizontal Scroll
  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <View style={styles.quickActionsList}>
        {quickActions.map((action) => (
          <AnimatedTouchable
            key={action.id}
            style={styles.quickActionItem}
            onPress={() => handleQuickAction(action.filter)}
            scaleValue={0.95}
          >
            <LinearGradient
              colors={action.gradient}
              style={styles.quickActionIcon}
            >
              <Ionicons name={action.icon as any} size={28} color={SHOPEE_COLORS.white} />
            </LinearGradient>
            <Text style={styles.quickActionText} numberOfLines={2}>{action.title}</Text>
          </AnimatedTouchable>
        ))}
      </View>
    </View>
  );

  // PRODUCT SECTION
  const renderProductSection = (products: any[], title: string, bgColor: string, filter: string = 'all') => {
    if (products.length === 0) return null;

    return (
      <View style={[styles.productSection, { backgroundColor: bgColor }]}>
        <View style={styles.productHeader}>
          <Text style={styles.productTitle}>{title}</Text>
          <TouchableOpacity onPress={() => handleQuickAction(filter)}>
            <Text style={styles.seeAllText}>Xem tất cả ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {products.slice(0, 6).map((product, index) => (
            <TouchableOpacity
              key={product._id || index}
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { id: product._id })}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: product.hinhAnh?.[0] || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
              />

              {/* Discount Badge */}
              {product.giaKhuyenMai && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    -{Math.round(((product.gia - product.giaKhuyenMai) / product.gia) * 100)}%
                  </Text>
                </View>
              )}

              {/* Mall Badge */}
              {product.noiBat && (
                <View style={styles.mallBadge}>
                  <Text style={styles.mallText}>Mall</Text>
                </View>
              )}

              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.ten}</Text>

                <View style={styles.productPriceRow}>
                  <Text style={styles.productPrice}>₫{(product.giaKhuyenMai || product.gia || 0).toLocaleString('vi-VN')}</Text>
                </View>

                <View style={styles.productFooter}>
                  <View style={styles.productRating}>
                    <Ionicons name="star" size={12} color={SHOPEE_COLORS.secondary} />
                    <Text style={styles.ratingText}>{(product.danhGiaTrungBinh || 4.5).toFixed(1)}</Text>
                  </View>
                  <Text style={styles.soldText}>Đã bán {product.daBan || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // FLOATING CHAT BUTTON
  const renderFloatingButtons = () => (
    <>
      <TouchableOpacity
        style={styles.floatingChat}
        onPress={() => navigation.navigate('Chat')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[SHOPEE_COLORS.primary, SHOPEE_COLORS.primaryDark]}
          style={styles.floatingChatGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color={SHOPEE_COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        style={{ opacity: fadeAnim }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {renderBannerCarousel()}
        {renderCategories()}
        {renderQuickActions()}
        {renderFlashSale()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={SHOPEE_COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            {renderProductSection(featuredProducts, 'GỢI Ý HÔM NAY', SHOPEE_COLORS.white, 'featured')}
            {renderProductSection(newProducts, 'HÀNG MỚI VỀ', SHOPEE_COLORS.lightGray, 'new')}
          </>
        )}

        <View style={{ height: 60 }} />
      </Animated.ScrollView>

      {/* Fixed Header */}
      {renderHeader()}

      {/* Floating Buttons */}
      {renderFloatingButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHOPEE_COLORS.lightGray,
  },

  // HEADER
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: SHOPEE_COLORS.white,
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: SHOPEE_COLORS.red,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: SHOPEE_COLORS.white,
  },
  notificationBadgeText: {
    color: SHOPEE_COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  cartIcon: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: SHOPEE_COLORS.secondary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: SHOPEE_COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SHOPEE_COLORS.white,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: SHOPEE_COLORS.darkGray,
  },

  // BANNER
  bannerSection: {
    marginTop: 120, // Account for fixed header
    marginBottom: 8,
  },
  bannerItem: {
    width,
    height: BANNER_HEIGHT,
    paddingHorizontal: 8,
  },
  bannerImage: {
    width: width - 16,
    height: BANNER_HEIGHT,
    borderRadius: 8,
  },
  bannerBadge: {
    position: 'absolute',
    top: 12,
    right: 20,
    backgroundColor: SHOPEE_COLORS.red,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bannerBadgeText: {
    color: SHOPEE_COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  bannerPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SHOPEE_COLORS.darkGray,
    opacity: 0.3,
  },
  bannerDotActive: {
    width: 20,
    backgroundColor: SHOPEE_COLORS.primary,
    opacity: 1,
  },

  // CATEGORIES
  categoriesSection: {
    backgroundColor: SHOPEE_COLORS.white,
    paddingVertical: 16,
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 12,
    gap: 12,
  },
  categoryItem: {
    width: 72,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 11,
    color: SHOPEE_COLORS.darkGray,
    textAlign: 'center',
    fontWeight: '500',
  },

  // QUICK ACTIONS
  quickActionsSection: {
    backgroundColor: SHOPEE_COLORS.white,
    paddingVertical: 16,
    marginBottom: 8,
  },
  quickActionsList: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 90,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: SHOPEE_COLORS.darkGray,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },

  // FLASH SALE
  flashSaleSection: {
    backgroundColor: SHOPEE_COLORS.white,
    marginBottom: 8,
    paddingBottom: 16,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flashSaleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashSaleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SHOPEE_COLORS.white,
    letterSpacing: 1,
  },
  flashSaleTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerBox: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  timerText: {
    color: SHOPEE_COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  timerSeparator: {
    color: SHOPEE_COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  seeAllFlash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllFlashText: {
    color: SHOPEE_COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  flashSaleList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  flashSaleCard: {
    width: 120,
    backgroundColor: SHOPEE_COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  flashSaleImage: {
    width: '100%',
    height: 120,
    backgroundColor: SHOPEE_COLORS.lightGray,
  },
  flashSaleBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: SHOPEE_COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  flashSaleBadgeText: {
    color: SHOPEE_COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  flashSalePrice: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  flashSalePriceText: {
    color: SHOPEE_COLORS.red,
    fontSize: 16,
    fontWeight: '700',
  },
  flashSaleProgress: {
    height: 12,
    backgroundColor: SHOPEE_COLORS.red + '20', // 20% opacity red
    marginHorizontal: 8,
    marginTop: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  flashSaleProgressBar: {
    height: '100%',
    backgroundColor: SHOPEE_COLORS.red,
  },
  flashSaleSold: {
    fontSize: 10,
    color: SHOPEE_COLORS.darkGray,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  // PRODUCTS
  productSection: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SHOPEE_COLORS.darkGray,
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: SHOPEE_COLORS.primary,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: SHOPEE_COLORS.white,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: SHOPEE_COLORS.lightGray,
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: SHOPEE_COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: SHOPEE_COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  mallBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: SHOPEE_COLORS.red,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  mallText: {
    color: SHOPEE_COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 13,
    color: SHOPEE_COLORS.darkGray,
    marginBottom: 6,
    lineHeight: 18,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: SHOPEE_COLORS.red,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    color: SHOPEE_COLORS.darkGray,
  },
  soldText: {
    fontSize: 11,
    color: SHOPEE_COLORS.darkGray,
  },

  // FLOATING BUTTONS
  floatingChat: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    zIndex: 100,
  },
  floatingChatGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // LOADING
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: SHOPEE_COLORS.darkGray,
  },
});

export default HomeScreen;
