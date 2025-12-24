import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

const MyReviewsScreen = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadReviews();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await api.getUserReviews();
      if (response.success && response.data) {
        const reviewList = Array.isArray(response.data)
          ? response.data
          : response.data.reviews || [];
        setReviews(reviewList);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đánh giá');
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  }, []);

  const handleDeleteReview = (reviewId: string, productName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa đánh giá cho "${productName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteReview(reviewId),
        },
      ]
    );
  };

  const deleteReview = async (reviewId: string) => {
    setDeletingIds([...deletingIds, reviewId]);
    try {
      const response = await api.deleteReview(reviewId);
      if (response.success) {
        setReviews(reviews.filter((r) => r._id !== reviewId));
        Alert.alert('Thành công', 'Đã xóa đánh giá');
      }
    } catch (error: any) {
      console.error('Error deleting review:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa đánh giá');
    }
    setDeletingIds(deletingIds.filter((id) => id !== reviewId));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: string; bg: string } } = {
      'cho-duyet': {
        label: 'Chờ duyệt',
        color: COLORS.warning,
        bg: COLORS.warning + '20',
      },
      'da-duyet': {
        label: 'Đã duyệt',
        color: COLORS.success,
        bg: COLORS.success + '20',
      },
      'tu-choi': {
        label: 'Từ chối',
        color: COLORS.danger,
        bg: COLORS.danger + '20',
      },
    };
    const config = statusConfig[status] || statusConfig['cho-duyet'];
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? COLORS.accent : COLORS.gray[400]}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: any) => {
    const isDeleting = deletingIds.includes(item._id);
    const product = item.sanPham;

    return (
      <View style={styles.reviewCard}>
        {/* Product Info */}
        <TouchableOpacity
          style={styles.productSection}
          onPress={() => {
            if (product?._id) {
              navigation.navigate('ProductDetail', { id: product._id });
            }
          }}
        >
          {product?.hinhAnh && product.hinhAnh[0] && (
            <Image
              source={{ uri: product.hinhAnh[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product?.ten || 'Sản phẩm'}
            </Text>
            {product?.gia && (
              <Text style={styles.productPrice}>
                {product.giaKhuyenMai ? (
                  <>
                    <Text style={styles.salePrice}>
                      ₫{product.giaKhuyenMai.toLocaleString('vi-VN')}
                    </Text>
                    <Text style={styles.originalPrice}>
                      {' '}
                      ₫{product.gia.toLocaleString('vi-VN')}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.normalPrice}>
                    ₫{product.gia.toLocaleString('vi-VN')}
                  </Text>
                )}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Review Content */}
        <View style={styles.reviewContent}>
          <View style={styles.reviewHeader}>
            {renderStars(item.danhGia)}
            {getStatusBadge(item.trangThai)}
          </View>

          <Text style={styles.reviewTitle}>{item.tieuDe}</Text>
          <Text style={styles.reviewText} numberOfLines={3}>
            {item.noiDung}
          </Text>

          <View style={styles.reviewFooter}>
            <Text style={styles.reviewDate}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
            {item.donHang?.maDonHang && (
              <Text style={styles.orderCode}>#{item.donHang.maDonHang}</Text>
            )}
          </View>

          {/* Reply từ shop */}
          {item.phanHoi && (
            <View style={styles.replyContainer}>
              <View style={styles.replyHeader}>
                <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
                <Text style={styles.replyLabel}>Phản hồi từ shop</Text>
              </View>
              <Text style={styles.replyText}>{item.phanHoi.noiDung}</Text>
              <Text style={styles.replyDate}>
                {new Date(item.phanHoi.thoiGian).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            onPress={() => handleDeleteReview(item._id, product?.ten || 'sản phẩm')}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                <Text style={styles.deleteText}>Xóa</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="lock-closed-outline" size={80} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.emptyText}>
          Đăng nhập để xem danh sách đánh giá của bạn
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={
          reviews.length === 0 ? styles.emptyListContent : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={80} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>Chưa có đánh giá</Text>
            <Text style={styles.emptyText}>
              Bạn chưa có đánh giá nào. Hãy mua sắm và đánh giá sản phẩm để giúp
              người khác!
            </Text>
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
  listContent: {
    padding: SIZES.padding,
  },
  emptyListContent: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.gray[100],
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  productPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  normalPrice: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  salePrice: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.danger,
  },
  originalPrice: {
    fontSize: SIZES.small,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  reviewContent: {
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
  },
  reviewTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  reviewText: {
    fontSize: SIZES.small,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: SIZES.tiny,
    color: COLORS.gray[500],
  },
  orderCode: {
    fontSize: SIZES.tiny,
    color: COLORS.primary,
    fontWeight: '600',
  },
  replyContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primary + '08',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  replyLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  replyText: {
    fontSize: SIZES.small,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: 4,
  },
  replyDate: {
    fontSize: SIZES.tiny,
    color: COLORS.gray[500],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    paddingTop: 0,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    fontSize: SIZES.small,
    color: COLORS.danger,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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
});

export default MyReviewsScreen;
