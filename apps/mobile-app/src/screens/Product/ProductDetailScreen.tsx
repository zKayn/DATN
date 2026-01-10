import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  ten: string;
  slug?: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  danhGiaTrungBinh: number;
  soLuongDanhGia: number;
  daBan: number;
  thuongHieu: string;
  danhMuc: any;
  moTa: string;
  moTaChiTiet?: string;
  dacDiem: string[];
  thongSoKyThuat?: Record<string, string>;
  kichThuoc: string[];
  mauSac: { ten: string; ma: string }[];
  soLuongTonKho: number;
}

const ProductDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await api.getProductById(id);
      if (response.success && response.data) {
        const productData = response.data.product || response.data;
        setProduct(productData);

        // Set default selections
        if (productData.kichThuoc?.length > 0) {
          setSelectedSize(productData.kichThuoc[0]);
        }
        if (productData.mauSac?.length > 0) {
          setSelectedColor(productData.mauSac[0].ten);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
    }
    setLoading(false);
  };

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await api.getProductReviews(id, { limit: 5 });
      if (response.success && response.data) {
        setReviews(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
    setLoadingReviews(false);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.soLuongTonKho === 0) {
      Alert.alert('Thông báo', 'Sản phẩm đã hết hàng');
      return;
    }

    if (product.kichThuoc && product.kichThuoc.length > 0 && !selectedSize) {
      Alert.alert('Thông báo', 'Vui lòng chọn kích thước');
      return;
    }

    if (product.mauSac && product.mauSac.length > 0 && !selectedColor) {
      Alert.alert('Thông báo', 'Vui lòng chọn màu sắc');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.ten,
      slug: product.slug || product._id,
      image: product.hinhAnh[0] || 'https://via.placeholder.com/400',
      price: product.gia,
      salePrice: product.giaKhuyenMai || null,
      size: selectedSize || 'Free Size',
      color: selectedColor || 'Mặc định',
      quantity: quantity,
      stock: product.soLuongTonKho,
    });

    Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (product.soLuongTonKho === 0) {
      Alert.alert('Thông báo', 'Sản phẩm đã hết hàng');
      return;
    }

    if (product.kichThuoc && product.kichThuoc.length > 0 && !selectedSize) {
      Alert.alert('Thông báo', 'Vui lòng chọn kích thước');
      return;
    }

    if (product.mauSac && product.mauSac.length > 0 && !selectedColor) {
      Alert.alert('Thông báo', 'Vui lòng chọn màu sắc');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.ten,
      slug: product.slug || product._id,
      image: product.hinhAnh[0] || 'https://via.placeholder.com/400',
      price: product.gia,
      salePrice: product.giaKhuyenMai || null,
      size: selectedSize || 'Free Size',
      color: selectedColor || 'Mặc định',
      quantity: quantity,
      stock: product.soLuongTonKho,
    });

    navigation.navigate('Cart');
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    const isWishlisted = isInWishlist(product._id);

    if (isWishlisted) {
      removeFromWishlist(product._id);
      Alert.alert('Thành công', 'Đã xóa khỏi danh sách yêu thích');
    } else {
      addToWishlist(product._id);
      Alert.alert('Thành công', 'Đã thêm vào danh sách yêu thích');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discountPercent = product.giaKhuyenMai
    ? Math.round((1 - product.giaKhuyenMai / product.gia) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: product.hinhAnh[selectedImageIndex] || 'https://via.placeholder.com/800' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {product.hinhAnh.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
            >
              {product.hinhAnh.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailActive,
                  ]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistToggle}
          >
            <Ionicons
              name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist(product._id) ? COLORS.danger : COLORS.dark}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>{product.thuongHieu}</Text>
          <Text style={styles.name}>{product.ten}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(product.danhGiaTrungBinh) ? 'star' : 'star-outline'}
                  size={16}
                  color={COLORS.warning}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.danhGiaTrungBinh.toFixed(1)} ({product.soLuongDanhGia} đánh giá)
            </Text>
            <Text style={styles.soldText}>• Đã bán: {product.daBan || 0}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            {product.giaKhuyenMai ? (
              <>
                <Text style={styles.price}>
                  ₫{product.giaKhuyenMai.toLocaleString('vi-VN')}
                </Text>
                <Text style={styles.originalPrice}>
                  ₫{product.gia.toLocaleString('vi-VN')}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
              </>
            ) : (
              <Text style={styles.regularPrice}>
                ₫{product.gia.toLocaleString('vi-VN')}
              </Text>
            )}
          </View>

          {/* Color Selection */}
          {product.mauSac && product.mauSac.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Màu sắc: <Text style={styles.selectedValue}>{selectedColor}</Text>
              </Text>
              <View style={styles.colorContainer}>
                {product.mauSac.map((color) => (
                  <TouchableOpacity
                    key={color.ten}
                    onPress={() => setSelectedColor(color.ten)}
                    style={[
                      styles.colorButton,
                      selectedColor === color.ten && styles.colorButtonActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color.ma },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Size Selection */}
          {product.kichThuoc && product.kichThuoc.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Kích thước: <Text style={styles.selectedValue}>{selectedSize}</Text>
              </Text>
              <View style={styles.sizeContainer}>
                {product.kichThuoc.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[
                      styles.sizeButton,
                      selectedSize === size && styles.sizeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedSize === size && styles.sizeTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            {product.soLuongTonKho > 0 ? (
              <View style={styles.inStock}>
                <View style={styles.stockDot} />
                <Text style={styles.stockText}>
                  Còn hàng ({product.soLuongTonKho} sản phẩm)
                </Text>
              </View>
            ) : (
              <View style={styles.outOfStock}>
                <View style={[styles.stockDot, { backgroundColor: COLORS.danger }]} />
                <Text style={[styles.stockText, { color: COLORS.danger }]}>Hết hàng</Text>
              </View>
            )}
          </View>

          {/* Quantity */}
          {product.soLuongTonKho > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.min(product.soLuongTonKho, quantity + 1))}
                  disabled={quantity >= product.soLuongTonKho}
                >
                  <Ionicons name="add" size={20} color={COLORS.dark} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Features */}
          {product.dacDiem && product.dacDiem.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đặc điểm nổi bật</Text>
              {product.dacDiem.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.moTaChiTiet || product.moTa}</Text>
          </View>

          {/* Specifications */}
          {product.thongSoKyThuat && Object.keys(product.thongSoKyThuat).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
              {Object.entries(product.thongSoKyThuat).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>
                Đánh giá ({product.soLuongDanhGia})
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('WriteReview', {
                  productId: product._id,
                  productName: product.ten,
                  productImage: product.hinhAnh[0],
                })}
              >
                <Text style={styles.writeReviewLink}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>

            {loadingReviews ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : reviews.length > 0 ? (
              <>
                {reviews.map((review) => (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUserInfo}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.reviewAvatarText}>
                            {review.nguoiDung?.hoTen?.charAt(0).toUpperCase() || 'U'}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.reviewUserName}>
                            {review.nguoiDung?.hoTen || 'Người dùng'}
                          </Text>
                          <View style={styles.reviewStars}>
                            {[...Array(5)].map((_, i) => (
                              <Ionicons
                                key={i}
                                name={i < review.danhGia ? 'star' : 'star-outline'}
                                size={14}
                                color={COLORS.warning}
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <Text style={styles.reviewTitle}>{review.tieuDe}</Text>
                    <Text style={styles.reviewContent} numberOfLines={3}>
                      {review.noiDung}
                    </Text>
                  </View>
                ))}
                {product.soLuongDanhGia > 5 && (
                  <TouchableOpacity
                    style={styles.viewAllReviewsButton}
                    onPress={() => navigation.navigate('AllReviews', {
                      productId: product._id,
                      productName: product.ten,
                      averageRating: product.danhGiaTrungBinh,
                      totalReviews: product.soLuongDanhGia,
                    })}
                  >
                    <Text style={styles.viewAllReviewsText}>
                      Xem tất cả {product.soLuongDanhGia} đánh giá
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="chatbubble-outline" size={48} color={COLORS.gray[400]} />
                <Text style={styles.noReviewsText}>
                  Chưa có đánh giá nào cho sản phẩm này
                </Text>
                <TouchableOpacity
                  style={styles.firstReviewButton}
                  onPress={() => navigation.navigate('WriteReview', {
                    productId: product._id,
                    productName: product.ten,
                    productImage: product.hinhAnh[0],
                  })}
                >
                  <Text style={styles.firstReviewButtonText}>
                    Hãy là người đầu tiên đánh giá
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {product.soLuongTonKho > 0 ? (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart-outline" size={24} color={COLORS.white} />
            <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.outOfStockButton} disabled>
            <Text style={styles.outOfStockButtonText}>Sản phẩm đã hết hàng</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.h3,
    color: COLORS.dark,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  imageGallery: {
    backgroundColor: COLORS.gray[50],
  },
  mainImage: {
    width: width,
    height: width,
  },
  thumbnailContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    padding: SIZES.padding,
  },
  brand: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: SIZES.small,
    color: COLORS.dark,
    fontWeight: '600',
  },
  soldText: {
    fontSize: SIZES.small,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.borderRadius,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.danger, // Red for sale price
  },
  regularPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.danger, // Red for regular price
  },
  originalPrice: {
    fontSize: SIZES.body,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  discountBadge: {
    backgroundColor: COLORS.danger, // Red background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  selectedValue: {
    color: COLORS.primary,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: COLORS.primary,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
  },
  sizeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sizeText: {
    fontSize: SIZES.body,
    color: COLORS.dark,
    fontWeight: '600',
  },
  sizeTextActive: {
    color: COLORS.white,
  },
  stockContainer: {
    marginBottom: 20,
  },
  inStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  stockText: {
    fontSize: SIZES.body,
    color: COLORS.success,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.dark,
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.gray[700],
    marginLeft: 8,
  },
  description: {
    fontSize: SIZES.body,
    color: COLORS.gray[700],
    lineHeight: 24,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  specKey: {
    width: 140,
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  specValue: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.dark,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.danger,
    borderRadius: SIZES.borderRadius,
  },
  buyNowText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  outOfStockButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
  },
  outOfStockButtonText: {
    color: COLORS.gray[600],
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewLink: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  reviewUserName: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: SIZES.tiny,
    color: COLORS.gray[500],
  },
  reviewTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 8,
    marginBottom: 4,
  },
  reviewContent: {
    fontSize: SIZES.small,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  viewAllReviewsText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    marginTop: 12,
    marginBottom: 16,
  },
  firstReviewButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  firstReviewButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
