import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, API_URL } from '../constants/config';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubscribed(true);
        Alert.alert(
          'Thành công',
          data.message || 'Đăng ký thành công! Vui lòng kiểm tra email của bạn.'
        );
        setEmail('');
      } else {
        Alert.alert('Lỗi', data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="mail-outline" size={40} color={COLORS.white} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Đăng Ký Nhận Ưu Đãi Đặc Biệt</Text>
      <Text style={styles.subtitle}>
        Nhận ngay thông tin sản phẩm mới, voucher giảm giá và mẹo tập luyện hữu ích. Đăng ký ngay
        để không bỏ lỡ các ưu đãi hấp dẫn!
      </Text>

      {/* Subscribe Form or Success Message */}
      {!subscribed ? (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email của bạn..."
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.submitButtonText}>Đang xử lý...</Text>
              </>
            ) : (
              <>
                <Ionicons name="send" size={20} color={COLORS.primary} />
                <Text style={styles.submitButtonText}>Đăng Ký</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={32} color="#4ade80" />
          <Text style={styles.successText}>
            Bạn đã đăng ký thành công! Kiểm tra email của bạn.
          </Text>
        </View>
      )}

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <View style={styles.benefitCard}>
          <View style={styles.benefitIconContainer}>
            <Ionicons name="pricetag" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.benefitTitle}>Giảm Giá Đặc Biệt</Text>
          <Text style={styles.benefitDescription}>Voucher giảm giá đến 50% cho thành viên</Text>
        </View>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIconContainer}>
            <Ionicons name="flash" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.benefitTitle}>Cập Nhật Nhanh</Text>
          <Text style={styles.benefitDescription}>Thông tin sản phẩm mới và khuyến mãi hot</Text>
        </View>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIconContainer}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.benefitTitle}>Ưu Tiên Đặc Biệt</Text>
          <Text style={styles.benefitDescription}>Ưu tiên mua sắm và hỗ trợ tận tâm</Text>
        </View>
      </View>

      {/* Privacy Note */}
      <Text style={styles.privacyText}>
        Chúng tôi tôn trọng quyền riêng tư của bạn. Thông tin của bạn sẽ được bảo mật tuyệt đối.
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 40,
    marginTop: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  submitButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.borderRadius,
    padding: 20,
    marginBottom: 30,
    gap: 12,
  },
  successText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '500',
  },
  benefitsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  benefitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SIZES.borderRadius,
    padding: 20,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 20,
  },
  privacyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

export default Newsletter;
