import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/config';

const OrderSuccessScreen = ({ route, navigation }: any) => {
  const { orderId, orderCode } = route.params || {};

  const handleViewOrders = () => {
    navigation.navigate('OrderHistory');
  };

  const handleContinueShopping = () => {
    navigation.navigate('MainTab', { screen: 'Home' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successContainer}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={60} color={COLORS.white} />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Đặt hàng thành công!</Text>
        <Text style={styles.subtitle}>
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay.
        </Text>

        {/* Order Info */}
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.label}>Mã đơn hàng:</Text>
            <Text style={styles.value}>#{orderCode}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderInfoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Chờ xác nhận</Text>
            </View>
          </View>
        </View>

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi"
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Email xác nhận</Text>
              <Text style={styles.featureDescription}>
                Chúng tôi đã gửi email xác nhận đơn hàng đến bạn
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.warning} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Thông báo cập nhật</Text>
              <Text style={styles.featureDescription}>
                Bạn sẽ nhận được thông báo khi đơn hàng được cập nhật
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="cube-outline" size={24} color={COLORS.success} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Giao hàng nhanh</Text>
              <Text style={styles.featureDescription}>
                Đơn hàng sẽ được giao trong 2-5 ngày làm việc
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewOrders}
        >
          <Ionicons name="receipt-outline" size={20} color={COLORS.white} />
          <Text style={styles.primaryButtonText}>Xem đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleContinueShopping}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Tiếp tục mua sắm</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  content: {
    flexGrow: 1,
  },
  successContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding * 2,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  orderInfoCard: {
    width: '100%',
    backgroundColor: COLORS.gray[100],
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 24,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  value: {
    fontSize: SIZES.body,
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: 12,
  },
  statusBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  statusText: {
    fontSize: SIZES.small,
    color: COLORS.warning,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    padding: 12,
    borderRadius: SIZES.borderRadius,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.info,
    marginLeft: 8,
    lineHeight: 20,
  },
  featuresList: {
    width: '100%',
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  actionButtons: {
    padding: SIZES.padding * 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    marginBottom: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default OrderSuccessScreen;
