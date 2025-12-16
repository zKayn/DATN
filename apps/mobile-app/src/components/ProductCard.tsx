import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/config';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  id: string;
  ten: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string;
  danhGiaTrungBinh?: number;
  daBan?: number;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - SIZES.padding * 3) / 2;

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  ten,
  gia,
  giaKhuyenMai,
  hinhAnh,
  danhGiaTrungBinh = 0,
  daBan = 0,
  onPress,
}) => {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const discount = giaKhuyenMai ? Math.round(((gia - giaKhuyenMai) / gia) * 100) : 0;
  const inWishlist = isInWishlist(id);

  const handleWishlistToggle = async (e: any) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    try {
      if (inWishlist) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: hinhAnh || 'https://via.placeholder.com/400' }}
          style={styles.image}
          resizeMode="cover"
        />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={inWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={inWishlist ? COLORS.danger : COLORS.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {ten}
        </Text>

        {/* Rating */}
        {danhGiaTrungBinh > 0 && (
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.ratingText}>{danhGiaTrungBinh.toFixed(1)}</Text>
            <Text style={styles.soldText}>• Đã bán {daBan}</Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          {giaKhuyenMai ? (
            <>
              <Text style={styles.salePrice}>{giaKhuyenMai.toLocaleString('vi-VN')}₫</Text>
              <Text style={styles.originalPrice}>{gia.toLocaleString('vi-VN')}₫</Text>
            </>
          ) : (
            <Text style={styles.price}>{gia.toLocaleString('vi-VN')}₫</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    overflow: 'hidden',
    marginBottom: SIZES.margin,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth,
    backgroundColor: COLORS.gray[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
    height: 36,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: SIZES.tiny,
    color: COLORS.dark,
    marginLeft: 4,
    fontWeight: '600',
  },
  soldText: {
    fontSize: SIZES.tiny,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  salePrice: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginRight: 6,
  },
  originalPrice: {
    fontSize: SIZES.small,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
});

export default ProductCard;
