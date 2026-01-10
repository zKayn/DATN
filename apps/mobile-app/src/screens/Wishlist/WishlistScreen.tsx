import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../constants/config';

const WishlistScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { wishlist, loading, removeFromWishlist, loadWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  const handleRemove = (productId: string, productName: string) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa "${productName}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setRemovingIds([...removingIds, productId]);
            try {
              await removeFromWishlist(productId);
            } catch (error) {
              // Silent error
            } finally {
              setRemovingIds(removingIds.filter((id) => id !== productId));
            }
          },
        },
      ]
    );
  };

  const handleAddToCart = async (item: any) => {
    try {
      // Check if product has variants
      const hasColors = item.mauSac && item.mauSac.length > 0;
      const hasSizes = item.kichThuoc && item.kichThuoc.length > 0;

      if (hasColors || hasSizes) {
        // Navigate to product detail to select variants
        navigation.navigate('ProductDetail', { id: item._id });
      } else {
        // Add directly to cart with default values
        await addToCart({
          productId: item._id,
          name: item.ten || item.tenSanPham || item.name || 'Sản phẩm',
          slug: item.slug || item._id || '',
          price: item.gia || item.giaBan || item.price || 0,
          salePrice: item.giaKhuyenMai || item.salePrice || null,
          image: item.hinhAnh?.[0] || item.image || '',
          quantity: 1,
          color: '',
          size: '',
          stock: item.tonKho || item.soLuongTonKho || item.stock || 0,
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleAddAllToCart = () => {
    if (wishlist.length === 0) return;

    Alert.alert(
      'Xác nhận',
      `Thêm tất cả ${wishlist.length} sản phẩm vào giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm',
          onPress: async () => {
            let addedCount = 0;
            let skippedCount = 0;

            for (const item of wishlist) {
              const hasVariants =
                (item.mauSac && item.mauSac.length > 0) ||
                (item.kichThuoc && item.kichThuoc.length > 0);

              if (!hasVariants) {
                try {
                  await addToCart({
                    productId: item._id,
                    name: item.ten || item.tenSanPham || item.name || 'Sản phẩm',
                    slug: item.slug || item._id || '',
                    price: item.gia || item.giaBan || item.price || 0,
                    salePrice: item.giaKhuyenMai || item.salePrice || null,
                    image: item.hinhAnh?.[0] || item.image || '',
                    quantity: 1,
                    color: '',
                    size: '',
                    stock: item.tonKho || item.soLuongTonKho || item.stock || 0,
                  });
                  addedCount++;
                } catch (error) {
                  // Silent error
                }
              } else {
                skippedCount++;
              }
            }

            if (addedCount > 0) {
              Alert.alert(
                'Thành công',
                `Đã thêm ${addedCount} sản phẩm vào giỏ hàng${
                  skippedCount > 0
                    ? `\n${skippedCount} sản phẩm cần chọn màu/size, vui lòng thêm từng sản phẩm`
                    : ''
                }`
              );
            } else {
              Alert.alert(
                'Thông báo',
                'Tất cả sản phẩm cần chọn màu/size. Vui lòng thêm từng sản phẩm để chọn biến thể.'
              );
            }
          },
        },
      ]
    );
  };

  const renderWishlistItem = ({ item }: any) => {
    // Nếu item chỉ có _id (từ local storage), skip render
    if (!item.ten && !item.tenSanPham && !item.name) {
      return null;
    }

    const isRemoving = removingIds.includes(item._id);
    const productName = item.ten || item.tenSanPham || item.name || 'Sản phẩm';
    const productSlug = item.slug || item._id || '';
    const productPrice = item.gia || item.giaBan || item.price || 0;
    const productSalePrice = item.giaKhuyenMai || item.salePrice;
    const productImage = item.hinhAnh?.[0] || item.image || '';
    const productRating = item.danhGia || item.danhGiaTrungBinh || item.rating || 0;
    const productReviews = item.soLuongDanhGia || item.reviewCount || 0;
    const productStock = item.tonKho || item.soLuongTonKho || item.stock || 0;
    const productBrand = item.thuongHieu || item.brand;

    const discountPercent = productSalePrice && productPrice
      ? Math.round(((productPrice - productSalePrice) / productPrice) * 100)
      : 0;
    const isOutOfStock = productStock === 0;

    return (
      <TouchableOpacity
        style={[styles.itemCard, isRemoving && styles.itemCardRemoving]}
        onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
        disabled={isRemoving}
      >
        <View style={styles.imageContainer}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={40} color={COLORS.gray[400]} />
            </View>
          )}
          {!isOutOfStock && discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>HẾT HÀNG</Text>
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {productName}
          </Text>
          {productBrand && (
            <Text style={styles.itemBrand}>{productBrand}</Text>
          )}

          <View style={styles.priceRow}>
            {productSalePrice ? (
              <>
                <Text style={styles.salePrice}>
                  ₫{productSalePrice.toLocaleString('vi-VN')}
                </Text>
                <Text style={styles.originalPrice}>
                  ₫{productPrice.toLocaleString('vi-VN')}
                </Text>
              </>
            ) : (
              <Text style={styles.price}>
                ₫{productPrice.toLocaleString('vi-VN')}
              </Text>
            )}
          </View>

          {productRating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.ratingText}>
                {productRating.toFixed(1)}
              </Text>
              {productReviews > 0 && (
                <Text style={styles.reviewCount}>
                  ({productReviews})
                </Text>
              )}
            </View>
          )}

          {!isOutOfStock && productStock < 10 && (
            <Text style={styles.lowStock}>
              Chỉ còn {productStock} sản phẩm
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(item._id, productName)}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Ionicons name="close-circle" size={24} color={COLORS.danger} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isOutOfStock && styles.addToCartButtonDisabled,
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={isOutOfStock || isRemoving}
          >
            <Ionicons
              name="cart-outline"
              size={18}
              color={isOutOfStock ? COLORS.gray[500] : COLORS.white}
            />
            <Text
              style={[
                styles.addToCartText,
                isOutOfStock && styles.addToCartTextDisabled,
              ]}
            >
              {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed-outline" size={80} color={COLORS.gray[300]} />
        </View>
        <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.emptyText}>
          Đăng nhập để xem danh sách sản phẩm yêu thích của bạn
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách yêu thích...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + SIZES.safeAreaTop }]}>
        <Text style={styles.headerBarTitle}>Sản phẩm yêu thích</Text>
        {wishlist.length > 0 && (
          <Text style={styles.headerBarCount}>({wishlist.length})</Text>
        )}
      </View>

      {/* Action Bar */}
      {wishlist.length > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.actionBarText}>
            {wishlist.length} sản phẩm
          </Text>
          <TouchableOpacity
            style={styles.addAllButton}
            onPress={handleAddAllToCart}
          >
            <Ionicons name="cart" size={18} color={COLORS.white} />
            <Text style={styles.addAllText}>Thêm tất cả vào giỏ</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={wishlist}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={wishlist.length === 0 ? styles.emptyListContent : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart-outline" size={80} color={COLORS.gray[300]} />
            </View>
            <Text style={styles.emptyTitle}>Danh sách trống</Text>
            <Text style={styles.emptyText}>
              Bạn chưa có sản phẩm yêu thích nào.{'\n'}
              Hãy khám phá và thêm sản phẩm vào danh sách!
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Products' as never)}
            >
              <Text style={styles.shopButtonText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerBarTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  headerBarCount: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.gray[500],
    marginLeft: 6,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  actionBarText: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.primary,
  },
  addAllText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.white,
  },
  listContent: {
    padding: SIZES.padding,
  },
  emptyListContent: {
    flex: 1,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemCardRemoving: {
    opacity: 0.5,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadius,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: SIZES.tiny,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.borderRadius,
  },
  outOfStockText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  salePrice: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  originalPrice: {
    fontSize: SIZES.small,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.dark,
  },
  reviewCount: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  lowStock: {
    fontSize: SIZES.small,
    color: COLORS.warning,
    fontWeight: '500',
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  removeButton: {
    padding: 4,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  addToCartText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.white,
  },
  addToCartTextDisabled: {
    color: COLORS.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    marginTop: 80,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loginButton: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  shopButton: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default WishlistScreen;
