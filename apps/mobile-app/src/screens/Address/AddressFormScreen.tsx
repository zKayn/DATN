import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

const AddressFormScreen = ({ navigation, route }: any) => {
  const { isAuthenticated } = useAuth();
  const addressId = route.params?.addressId;
  const isEditMode = !!addressId;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    diaChi: '',
    phuongXa: '',
    quanHuyen: '',
    tinhThanh: '',
    macDinh: false,
  });

  useEffect(() => {
    if (isEditMode) {
      loadAddress();
    }
  }, [addressId]);

  const loadAddress = async () => {
    setLoading(true);
    try {
      const response = await api.getAddressById(addressId);
      if (response.success && response.data) {
        // Map backend field names to mobile field names
        setFormData({
          hoTen: response.data.hoTen || '',
          soDienThoai: response.data.soDienThoai || '',
          diaChi: response.data.diaChiChiTiet || '',
          phuongXa: response.data.xa || '',
          quanHuyen: response.data.huyen || '',
          tinhThanh: response.data.tinh || '',
          macDinh: response.data.macDinh || false,
        });
      }
    } catch (error) {
      console.error('Error loading address:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin địa chỉ');
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.hoTen.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }
    if (!formData.soDienThoai.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.soDienThoai)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return false;
    }
    if (!formData.diaChi.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return false;
    }
    if (!formData.phuongXa.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập phường/xã');
      return false;
    }
    if (!formData.quanHuyen.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập quận/huyện');
      return false;
    }
    if (!formData.tinhThanh.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tỉnh/thành phố');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await api.updateAddress(addressId, formData);
      } else {
        response = await api.createAddress(formData);
      }

      if (response.success) {
        Alert.alert(
          'Thành công',
          isEditMode ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu địa chỉ');
    }
    setSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={80} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Họ tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Họ và tên <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                value={formData.hoTen}
                onChangeText={(value) => handleInputChange('hoTen', value)}
                placeholder="Nhập họ và tên"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          {/* Số điện thoại */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Số điện thoại <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                value={formData.soDienThoai}
                onChangeText={(value) => handleInputChange('soDienThoai', value)}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Địa chỉ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Địa chỉ cụ thể <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="home-outline" size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                value={formData.diaChi}
                onChangeText={(value) => handleInputChange('diaChi', value)}
                placeholder="Số nhà, tên đường..."
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          {/* Phường/Xã */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phường/Xã <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                value={formData.phuongXa}
                onChangeText={(value) => handleInputChange('phuongXa', value)}
                placeholder="Nhập phường/xã"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          {/* Quận/Huyện */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Quận/Huyện <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                value={formData.quanHuyen}
                onChangeText={(value) => handleInputChange('quanHuyen', value)}
                placeholder="Nhập quận/huyện"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          {/* Tỉnh/Thành phố */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tỉnh/Thành phố <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                value={formData.tinhThanh}
                onChangeText={(value) => handleInputChange('tinhThanh', value)}
                placeholder="Nhập tỉnh/thành phố"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          {/* Đặt làm mặc định */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleInputChange('macDinh', !formData.macDinh)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, formData.macDinh && styles.checkboxChecked]}>
              {formData.macDinh && (
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.gray[100],
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  required: {
    color: COLORS.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  footer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  submitButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default AddressFormScreen;
