import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

const AllReviewsScreen = ({ route, navigation }: any) => {
  const { productId, productName, averageRating, totalReviews } = route.params || {};

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productId, selectedFilter]);

  const loadReviews = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.getProductReviews(productId, {
        page: isRefresh ? 1 : page,
        limit: 20,
      });

      if (response.success && response.data) {
        const reviewsList = Array.isArray(response.data) ? response.data : [];

        // Filter by rating if selected
        let filteredReviews = reviewsList;
        if (selectedFilter !== null) {
          filteredReviews = reviewsList.filter((r: any) => r.danhGia === selectedFilter);
        }

        if (isRefresh) {
          setReviews(filteredReviews);
          setPage(2);
        } else {
          setReviews(filteredReviews);
        }

        setHasMore(reviewsList.length >= 20);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreReviews = async () => {
    if (!hasMore || loading) return;

    try {
      const response = await api.getProductReviews(productId, {
        page: page,
        limit: 20,
      });

      if (response.success && response.data) {
        const reviewsList = Array.isArray(response.data) ? response.data : [];

        let filteredReviews = reviewsList;
        if (selectedFilter !== null) {
          filteredReviews = reviewsList.filter((r: any) => r.danhGia === selectedFilter);
        }

        setReviews([...reviews, ...filteredReviews]);
        setPage(page + 1);
        setHasMore(reviewsList.length >= 20);
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
    }
  };

  const handleFilterChange = (rating: number | null) => {
    setSelectedFilter(rating);
    setPage(1);
  };

  const renderRatingFilter = () => {
    const filters = [
      { label: 'Tất cả', value: null },
      { label: '5 ⭐', value: 5 },
      { label: '4 ⭐', value: 4 },
      { label: '3 ⭐', value: 3 },
      { label: '2 ⭐', value: 2 },
      { label: '1 ⭐', value: 1 },
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.label}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange(filter.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.value && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUserInfo}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>
              {item.nguoiDung?.hoTen?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.reviewUserDetails}>
            <Text style={styles.reviewUserName}>
              {item.nguoiDung?.hoTen || 'Người dùng'}
            </Text>
            <View style={styles.reviewStars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < item.danhGia ? 'star' : 'star-outline'}
                  size={14}
                  color={COLORS.warning}
                />
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      <Text style={styles.reviewTitle}>{item.tieuDe}</Text>
      <Text style={styles.reviewContent}>{item.noiDung}</Text>

      {item.phanHoi && (
        <View style={styles.replyContainer}>
          <View style={styles.replyHeader}>
            <Ionicons name="arrow-undo" size={16} color={COLORS.primary} />
            <Text style={styles.replyLabel}>Phản hồi từ người bán</Text>
          </View>
          <Text style={styles.replyContent}>{item.phanHoi.noiDung}</Text>
          <Text style={styles.replyDate}>
            {new Date(item.phanHoi.thoiGian).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.productName} numberOfLines={2}>
        {productName}
      </Text>

      <View style={styles.ratingOverview}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingScore}>{averageRating?.toFixed(1) || '0.0'}</Text>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(averageRating || 0) ? 'star' : 'star-outline'}
                size={20}
                color={COLORS.warning}
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>
            {totalReviews || 0} đánh giá
          </Text>
        </View>

        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={() => navigation.navigate('WriteReview', {
            productId,
            productName,
          })}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.white} />
          <Text style={styles.writeReviewButtonText}>Viết đánh giá</Text>
        </TouchableOpacity>
      </View>

      {renderRatingFilter()}
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={64} color={COLORS.gray[400]} />
      <Text style={styles.emptyText}>
        {selectedFilter !== null
          ? `Chưa có đánh giá ${selectedFilter} sao`
          : 'Chưa có đánh giá nào'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (loading && !refreshing) {
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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadReviews(true)}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={loadMoreReviews}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  listContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  productName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  ratingOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    marginBottom: 16,
  },
  ratingLeft: {
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: SIZES.borderRadius,
  },
  writeReviewButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.small,
    color: COLORS.gray[700],
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    fontWeight: '600',
  },
  reviewUserDetails: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
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
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: SIZES.body,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
  replyContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.borderRadius,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  replyContent: {
    fontSize: SIZES.small,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: 4,
  },
  replyDate: {
    fontSize: SIZES.tiny,
    color: COLORS.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default AllReviewsScreen;
