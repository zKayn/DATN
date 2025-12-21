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
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 180;
const CARD_WIDTH = (width - SIZES.padding * 3) / 2;

const banners = [
  {
    id: 1,
    title: '🎄 Giáng Sinh Vui Vẻ',
    subtitle: 'Giảm giá đến 50%',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=400&fit=crop',
    gradient: [COLORS.primary, COLORS.primaryDark],
  },
  {
    id: 2,
    title: '🧧 Tết Đến - Lộc Về',
    subtitle: 'Nhận lì xì may mắn',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=400&fit=crop',
    gradient: [COLORS.accent, COLORS.accentDark],
  },
  {
    id: 3,
    title: '✨ Ưu Đãi Mùa Lễ Hội',
    subtitle: 'Trang bị hoàn hảo',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop',
    gradient: [COLORS.secondary, COLORS.secondaryDark],
  },
];

const categories = [
  { id: 1, name: 'Giày', icon: 'footsteps-outline', color: COLORS.primary, bg: `${COLORS.primary}20` },
  { id: 2, name: 'Áo', icon: 'shirt-outline', color: COLORS.accent, bg: `${COLORS.accent}20` },
  { id: 3, name: 'Phụ kiện', icon: 'watch-outline', color: COLORS.secondary, bg: `${COLORS.secondary}20` },
  { id: 4, name: 'Gym', icon: 'barbell-outline', color: COLORS.primaryLight, bg: `${COLORS.primaryLight}20` },
];

const quickActions = [
  { id: 1, title: 'Flash Sale', icon: 'flash', color: COLORS.primary, gradient: [COLORS.primary, COLORS.primaryDark] as const },
  { id: 2, title: 'Mới nhất', icon: 'sparkles', color: COLORS.secondary, gradient: [COLORS.secondary, COLORS.secondaryDark] as const },
  { id: 3, title: 'Bán chạy', icon: 'trophy', color: COLORS.accent, gradient: [COLORS.accent, COLORS.accentDark] as const },
  { id: 4, title: 'Ưu đãi', icon: 'gift', color: COLORS.accentLight, gradient: [COLORS.accentLight, COLORS.accent] as const },
];

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { cartCount } = useCart();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const bannerScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentBanner + 1) % banners.length;
      setCurrentBanner(nextIndex);
      bannerScrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [currentBanner]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [featured, newArr] = await Promise.all([
        api.getFeaturedProducts(),
        api.getNewProducts(),
      ]);

      if (featured.success && featured.data) {
        const data = Array.isArray(featured.data) ? featured.data : featured.data.products || [];
        setFeaturedProducts(data.slice(0, 6));
      }

      if (newArr.success && newArr.data) {
        const data = Array.isArray(newArr.data) ? newArr.data : newArr.data.products || [];
        setNewProducts(data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.accent, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greetingText}>Xin chào 👋</Text>
          <Text style={styles.headerTitle}>LP Shop</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={26} color={COLORS.white} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Curved Bottom */}
      <View style={styles.curveContainer}>
        <View style={styles.curve} />
      </View>
    </LinearGradient>
  );

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
            activeOpacity={0.9}
            style={styles.bannerItem}
            onPress={() => navigation.navigate('Products' as never)}
          >
            <Image source={{ uri: banner.image }} style={styles.bannerImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.bannerGradient}
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              <View style={styles.shopNowButton}>
                <Text style={styles.shopNowText}>Mua ngay</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentBanner && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Danh mục</Text>
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: category.bg }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Products', { category: category.name })}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon as any} size={24} color={COLORS.white} />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleQuickAction = (actionId: number) => {
    switch (actionId) {
      case 1: // Flash Sale
        navigation.navigate('Products', { filter: 'sale' });
        break;
      case 2: // Mới nhất
        navigation.navigate('Products', { filter: 'new' });
        break;
      case 3: // Bán chạy
        navigation.navigate('Products', { filter: 'bestseller' });
        break;
      case 4: // Ưu đãi
        navigation.navigate('Products', { filter: 'promotion' });
        break;
    }
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionCard, index === 0 && { marginLeft: SIZES.padding }]}
            activeOpacity={0.8}
            onPress={() => handleQuickAction(action.id)}
          >
            <LinearGradient
              colors={action.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <Ionicons name={action.icon as any} size={28} color={COLORS.white} />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductSection = (products: any[], title: string, emoji: string) => (
    <View style={styles.productSection}>
      <View style={styles.productHeader}>
        <View style={styles.productTitleContainer}>
          <Text style={styles.productEmoji}>{emoji}</Text>
          <Text style={styles.productTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Products' as never)}>
          <Text style={styles.seeAllText}>Xem tất cả →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.productList}>
          {products.map((product, index) => (
            <View
              key={product._id}
              style={[styles.productCardWrapper, index === 0 && { marginLeft: SIZES.padding }]}
            >
              <ProductCard
                id={product._id}
                ten={product.ten}
                gia={product.gia}
                giaKhuyenMai={product.giaKhuyenMai}
                hinhAnh={product.hinhAnh?.[0] || ''}
                danhGiaTrungBinh={product.danhGiaTrungBinh}
                daBan={product.daBan}
                soLuongTonKho={product.soLuongTonKho}
                onPress={() => navigation.navigate('ProductDetail', { id: product._id })}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {renderHeader()}
        {renderBannerCarousel()}
        {renderCategories()}
        {renderQuickActions()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            {featuredProducts.length > 0 && renderProductSection(featuredProducts, 'Sản phẩm nổi bật', '🔥')}
            {newProducts.length > 0 && renderProductSection(newProducts, 'Hàng mới về', '✨')}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },

  // Header
  header: {
    paddingBottom: 40,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
  },
  greetingText: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.danger,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  curveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    overflow: 'hidden',
  },
  curve: {
    height: 60,
    backgroundColor: COLORS.gray[50],
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  // Banner
  bannerSection: {
    marginTop: -20,
    marginBottom: 20,
  },
  bannerItem: {
    width,
    height: BANNER_HEIGHT,
    paddingHorizontal: SIZES.padding,
  },
  bannerImage: {
    width: width - SIZES.padding * 2,
    height: BANNER_HEIGHT,
    borderRadius: 20,
  },
  bannerGradient: {
    position: 'absolute',
    left: SIZES.padding,
    right: SIZES.padding,
    bottom: 0,
    height: BANNER_HEIGHT,
    borderRadius: 20,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: SIZES.padding * 2,
    right: SIZES.padding * 2,
  },
  bannerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.white,
    marginBottom: 12,
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shopNowText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: SIZES.small,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[300],
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },

  // Categories
  categoriesSection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - SIZES.padding * 2 - 36) / 4,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: SIZES.tiny,
    color: COLORS.dark,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionCard: {
    marginRight: 12,
    marginLeft: 0,
  },
  quickActionGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },

  // Products
  productSection: {
    marginBottom: 24,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
  },
  productTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productEmoji: {
    fontSize: 24,
  },
  productTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  seeAllText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  productList: {
    flexDirection: 'row',
    paddingRight: SIZES.padding,
  },
  productCardWrapper: {
    marginRight: 12,
    width: CARD_WIDTH,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body,
    color: COLORS.gray[500],
  },
});

export default HomeScreen;
