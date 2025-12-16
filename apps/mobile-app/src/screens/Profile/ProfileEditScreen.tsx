import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const ProfileEditScreen = ({ navigation }: any) => {
  const { user, updateProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    hoTen: user?.hoTen || '',
    soDienThoai: user?.soDienThoai || '',
    gioiTinh: user?.gioiTinh || 'nam',
    ngaySinh: user?.ngaySinh ? new Date(user.ngaySinh).toISOString().split('T')[0] : '',
    avatar: user?.avatar || user?.anhDaiDien || '',
  });

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh để thay đổi ảnh đại diện');
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleUploadAvatar = async (imageUri: string) => {
    setUploadingAvatar(true);
    try {
      // Create FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      // Upload to server
      const response = await api.uploadAvatar(formData);

      if (response.success && response.data?.avatar) {
        setFormData(prev => ({ ...prev, avatar: response.data.avatar }));
        Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể upload ảnh đại diện');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!formData.hoTen.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        gioiTinh: formData.gioiTinh as 'nam' | 'nu' | 'khac',
        ngaySinh: formData.ngaySinh || undefined,
        avatar: formData.avatar,
        anhDaiDien: formData.avatar,
      });

      await refreshProfile();
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {formData.avatar ? (
            <Image source={{ uri: formData.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {formData.hoTen?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={handlePickImage}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="camera" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.changeAvatarText}>Nhấn vào biểu tượng camera để thay đổi ảnh đại diện</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ tên *</Text>
          <TextInput
            style={styles.input}
            value={formData.hoTen}
            onChangeText={(text) => setFormData({ ...formData, hoTen: text })}
            placeholder="Nhập họ tên"
            placeholderTextColor={COLORS.gray[400]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user?.email}
            editable={false}
            placeholderTextColor={COLORS.gray[400]}
          />
          <Text style={styles.helperText}>Email không thể thay đổi</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={formData.soDienThoai}
            onChangeText={(text) => setFormData({ ...formData, soDienThoai: text })}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.gray[400]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setFormData({ ...formData, gioiTinh: 'nam' })}
            >
              <View style={styles.radioOuter}>
                {formData.gioiTinh === 'nam' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Nam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setFormData({ ...formData, gioiTinh: 'nu' })}
            >
              <View style={styles.radioOuter}>
                {formData.gioiTinh === 'nu' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Nữ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setFormData({ ...formData, gioiTinh: 'khac' })}
            >
              <View style={styles.radioOuter}>
                {formData.gioiTinh === 'khac' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Khác</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày sinh</Text>
          <TextInput
            style={styles.input}
            value={formData.ngaySinh}
            onChangeText={(text) => setFormData({ ...formData, ngaySinh: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.gray[400]}
          />
          <Text style={styles.helperText}>Định dạng: YYYY-MM-DD (ví dụ: 1990-01-15)</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray[200],
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changeAvatarText: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  form: {
    padding: SIZES.padding,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
    padding: 12,
    fontSize: SIZES.body,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  inputDisabled: {
    backgroundColor: COLORS.gray[100],
    color: COLORS.gray[500],
  },
  helperText: {
    fontSize: SIZES.small,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SIZES.padding,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  cancelButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ProfileEditScreen;
