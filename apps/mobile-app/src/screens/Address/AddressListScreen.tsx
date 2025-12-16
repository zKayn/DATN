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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

interface Address {
  _id: string;
  hoTen: string;
  soDienThoai: string;
  diaChiChiTiet: string;
  xa: string;
  huyen: string;
  tinh: string;
  macDinh: boolean;
}

const AddressListScreen = ({ navigation, route }: any) => {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isSelectMode = route.params?.selectMode || false;
  const onSelectAddress = route.params?.onSelect;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getAddresses();
      if (response.success && response.data) {
        const addressList = Array.isArray(response.data)
          ? response.data
          : response.data.addresses || [];
        setAddresses(addressList);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách địa chỉ');
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  }, []);

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await api.setDefaultAddress(addressId);
      if (response.success) {
        await loadAddresses();
        Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt địa chỉ mặc định');
    }
  };

  const handleDelete = async (addressId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa địa chỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteAddress(addressId);
              if (response.success) {
                await loadAddresses();
                Alert.alert('Thành công', 'Đã xóa địa chỉ');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa địa chỉ');
            }
          },
        },
      ]
    );
  };

  const handleSelect = (address: Address) => {
    if (isSelectMode && onSelectAddress) {
      onSelectAddress(address);
      navigation.goBack();
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity
      style={[styles.addressCard, item.macDinh && styles.defaultAddressCard]}
      onPress={() => isSelectMode ? handleSelect(item) : null}
      activeOpacity={isSelectMode ? 0.7 : 1}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressTitleRow}>
          <Text style={styles.addressName}>{item.hoTen}</Text>
          {item.macDinh && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Mặc định</Text>
            </View>
          )}
        </View>
        <Text style={styles.addressPhone}>{item.soDienThoai}</Text>
      </View>

      <View style={styles.addressBody}>
        <Ionicons name="location-outline" size={20} color={COLORS.gray[600]} />
        <Text style={styles.addressText}>
          {item.diaChiChiTiet}, {item.xa}, {item.huyen}, {item.tinh}
        </Text>
      </View>

      {!isSelectMode && (
        <View style={styles.addressActions}>
          {!item.macDinh && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item._id)}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Đặt mặc định</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddressForm', { addressId: item._id })}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSelectMode && (
        <View style={styles.selectIndicator}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="lock-closed-outline" size={80} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.emptyText}>
          Đăng nhập để quản lý địa chỉ giao hàng
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
        <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={addresses.length === 0 ? styles.emptyListContent : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>Chưa có địa chỉ</Text>
            <Text style={styles.emptyText}>
              Thêm địa chỉ giao hàng để đặt hàng dễ dàng hơn
            </Text>
          </View>
        }
      />

      {!isSelectMode && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddressForm', {})}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      )}
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
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultAddressCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  addressHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addressName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
    color: COLORS.white,
  },
  addressPhone: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  addressBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.dark,
    lineHeight: 22,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deleteButton: {},
  deleteButtonText: {
    color: COLORS.danger,
  },
  selectIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    margin: SIZES.padding,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default AddressListScreen;
