import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/config';
import api from '../../services/api';

const PointsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);

  useEffect(() => {
    loadPointsData();
  }, []);

  const loadPointsData = async () => {
    try {
      setLoading(true);

      // Load points balance and history in parallel
      const [pointsResponse, historyResponse] = await Promise.all([
        api.getMyPoints(),
        api.getPointHistory(20),
      ]);

      if (pointsResponse.success && pointsResponse.data) {
        setUserPoints(pointsResponse.data.diemTichLuy || 0);
      }

      if (historyResponse.success && historyResponse.data) {
        setPointsHistory(historyResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPointsData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Points Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Tổng điểm hiện có</Text>
          <Text style={styles.balanceValue}>
            {userPoints.toLocaleString()} điểm
          </Text>
          <Text style={styles.balanceConversion}>
            ≈ {(userPoints * 1000).toLocaleString('vi-VN')}₫
          </Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Tỷ lệ: 1 điểm = ₫1,000 • 10,000 VND = 1 điểm
            </Text>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>

          {pointsHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.gray[300]} />
              <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
              <Text style={styles.emptyText}>
                Lịch sử điểm tích lũy sẽ hiển thị ở đây
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {pointsHistory.map((item, index) => {
                const isAdd = item.loai === 'cong';
                return (
                  <View
                    key={item._id || index}
                    style={[
                      styles.historyItem,
                      index === pointsHistory.length - 1 && styles.historyItemLast,
                    ]}
                  >
                    <View style={styles.historyIcon}>
                      <Ionicons
                        name={isAdd ? 'add-circle' : 'remove-circle'}
                        size={24}
                        color={isAdd ? COLORS.success : COLORS.error}
                      />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle}>{item.moTa}</Text>
                      <Text style={styles.historyDate}>
                        {formatDate(item.createdAt)}
                      </Text>
                      <Text style={styles.historyBalance}>
                        Số dư sau: {item.soDuSau.toLocaleString()} điểm
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.historyPoints,
                        isAdd ? styles.pointsAdd : styles.pointsSubtract,
                      ]}
                    >
                      {isAdd ? '+' : '-'}
                      {item.soLuong}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    margin: SIZES.padding,
    padding: SIZES.padding * 1.5,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  balanceConversion: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  infoText: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.9,
  },
  historySection: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    marginTop: 0,
    padding: SIZES.padding,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  historyList: {
    gap: 0,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    gap: 12,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  historyBalance: {
    fontSize: SIZES.small,
    color: COLORS.gray[500],
  },
  historyPoints: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
  },
  pointsAdd: {
    color: COLORS.success,
  },
  pointsSubtract: {
    color: COLORS.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});

export default PointsScreen;
