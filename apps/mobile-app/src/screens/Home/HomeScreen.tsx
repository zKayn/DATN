import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/config';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const banners = [
  {
    id: 1,
    title: 'Bộ Sưu Tập Mùa Hè 2025',
    subtitle: 'Giảm giá đến 50%',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=400&fit=crop',
    color: COLORS.primary,
  },
  {
    id: 2,
    title: 'Giày Chạy Bộ',
    subtitle: 'Công nghệ đệm khí mới nhất',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=400&fit=crop',
    color: '#EF4444',
  },
  {
    id: 3,
    title: 'Dụng Cụ Tập Gym',
    subtitle: 'Trang bị đầy đủ',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop',
    color: '#10B981',
  },
];

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { cartCount } = useCart();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      {banners.map((banner, index) => (
        <View
          key={banner.id}
          style={[
            styles.banner,
            { opacity: index === currentBanner ? 1 : 0 },
            { backgroundColor: banner.color },
          ]}
        >
          <Image source={{ uri: banner.image }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
          </View>
        </View>
      ))}

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentBanner && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderProductGrid = (products: any[], title: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products' as never)}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productGrid}>
        {products.map((product) => (
          <ProductCard
            key={product._id}
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
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} ref={scrollViewRef} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.safeAreaTop }]}>
        <View>
          <Text style={styles.greetingText}>Xin chào 👋</Text>
          <Text style={styles.headerTitle}>Thể Thao Pro</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={28} color={COLORS.white} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner Carousel */}
      {renderBanner()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <>
          {/* Featured Products */}
          {featuredProducts.length > 0 && renderProductGrid(featuredProducts, '🔥 Sản phẩm nổi bật')}

          {/* New Arrivals */}
          {newProducts.length > 0 && renderProductGrid(newProducts, '✨ Hàng mới về')}
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[100] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  greetingText: { fontSize: SIZES.small, color: COLORS.white, opacity: 0.9 },
  headerTitle: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.white, marginTop: 4 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    padding: 4,
  },
  cartButton: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  // Banner
  bannerContainer: { width, height: 200, position: 'relative' },
  banner: { position: 'absolute', width, height: 200 },
  bannerImage: { width, height: 200 },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: SIZES.padding,
    right: SIZES.padding,
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
    opacity: 0.95,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    width,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.white,
  },

  // Section
  section: { paddingHorizontal: SIZES.padding, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.dark },
  seeAllText: { fontSize: SIZES.small, color: COLORS.primary, fontWeight: '600' },

  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body,
    color: COLORS.gray[500],
  },
});

export default HomeScreen;
