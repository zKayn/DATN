import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../constants/config';
import api from '../../services/api';

const SettingsScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  // Settings states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handlePromotionsToggle = async (value: boolean) => {
    setPromotions(value);

    if (!user?.email) {
      Alert.alert('Lỗi', 'Không tìm thấy email của bạn');
      setPromotions(!value);
      return;
    }

    try {
      if (value) {
        // Subscribe to newsletter
        const response = await api.subscribeNewsletter(user.email);
        if (response.success) {
          Alert.alert('Thành công', 'Đã đăng ký nhận khuyến mãi & ưu đãi');
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể đăng ký');
          setPromotions(!value);
        }
      } else {
        // Unsubscribe from newsletter
        const response = await api.unsubscribeNewsletter(user.email);
        if (response.success) {
          Alert.alert('Thành công', 'Đã hủy đăng ký nhận khuyến mãi & ưu đãi');
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể hủy đăng ký');
          setPromotions(!value);
        }
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật tùy chọn. Vui lòng thử lại!');
      setPromotions(!value);
    }
  };

  const SettingItem = ({
    icon,
    iconColor,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
  }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (
        showArrow && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        )
      )}
    </TouchableOpacity>
  );

  const SettingSwitch = ({
    icon,
    iconColor,
    title,
    subtitle,
    value,
    onValueChange,
  }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
        thumbColor={value ? COLORS.white : COLORS.gray[100]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>

          <SettingItem
            icon="person-outline"
            iconColor={COLORS.primary}
            title="Thông tin cá nhân"
            subtitle={user?.email}
            onPress={() => navigation.navigate('ProfileEdit')}
          />

          <SettingItem
            icon="lock-closed-outline"
            iconColor={COLORS.warning}
            title="Đổi mật khẩu"
            subtitle="Cập nhật mật khẩu của bạn"
            onPress={handleChangePassword}
          />

          <SettingItem
            icon="location-outline"
            iconColor={COLORS.success}
            title="Địa chỉ giao hàng"
            subtitle="Quản lý địa chỉ nhận hàng"
            onPress={() => navigation.navigate('AddressList')}
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THÔNG BÁO</Text>

          <SettingSwitch
            icon="notifications-outline"
            iconColor={COLORS.primary}
            title="Thông báo đẩy"
            subtitle="Nhận thông báo trên thiết bị"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />

          <SettingSwitch
            icon="mail-outline"
            iconColor={COLORS.info}
            title="Thông báo email"
            subtitle="Nhận email thông báo"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />

          <SettingSwitch
            icon="receipt-outline"
            iconColor={COLORS.success}
            title="Cập nhật đơn hàng"
            subtitle="Thông báo về trạng thái đơn hàng"
            value={orderUpdates}
            onValueChange={setOrderUpdates}
          />

          <SettingSwitch
            icon="pricetag-outline"
            iconColor={COLORS.warning}
            title="Khuyến mãi & ưu đãi"
            subtitle="Nhận thông tin về chương trình khuyến mãi qua email"
            value={promotions}
            onValueChange={handlePromotionsToggle}
          />
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ỨNG DỤNG</Text>

          <SettingItem
            icon="language-outline"
            iconColor={COLORS.primary}
            title="Ngôn ngữ"
            subtitle="Tiếng Việt"
            onPress={() => {
              Alert.alert('Thông báo', 'Tính năng đang phát triển');
            }}
          />

          <SettingItem
            icon="moon-outline"
            iconColor={COLORS.dark}
            title="Chế độ tối"
            subtitle="Giao diện tối dịu mắt"
            rightComponent={
              <Switch
                value={false}
                onValueChange={() => {
                  Alert.alert('Thông báo', 'Tính năng đang phát triển');
                }}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HỖ TRỢ</Text>

          <SettingItem
            icon="help-circle-outline"
            iconColor={COLORS.info}
            title="Trung tâm trợ giúp"
            subtitle="Câu hỏi thường gặp & hướng dẫn"
            onPress={() => {
              Alert.alert('Thông báo', 'Tính năng đang phát triển');
            }}
          />

          <SettingItem
            icon="call-outline"
            iconColor={COLORS.success}
            title="Liên hệ hỗ trợ"
            subtitle="Gọi điện hoặc chat với chúng tôi"
            onPress={() => {
              Alert.alert('Liên hệ', 'Hotline: 1900-xxxx\nEmail: support@example.com');
            }}
          />

          <SettingItem
            icon="document-text-outline"
            iconColor={COLORS.gray[600]}
            title="Điều khoản & chính sách"
            subtitle="Điều khoản sử dụng và chính sách bảo mật"
            onPress={() => {
              Alert.alert('Thông báo', 'Tính năng đang phát triển');
            }}
          />

          <SettingItem
            icon="information-circle-outline"
            iconColor={COLORS.primary}
            title="Về ứng dụng"
            subtitle="Phiên bản 1.0.0"
            onPress={() => {
              Alert.alert(
                'Sport Shop',
                'Phiên bản: 1.0.0\nBản quyền © 2024\n\nỨng dụng mua sắm đồ thể thao trực tuyến'
              );
            }}
          />
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: COLORS.gray[600],
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 2,
    borderRadius: SIZES.borderRadius,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  logoutText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.danger,
  },
});

export default SettingsScreen;
