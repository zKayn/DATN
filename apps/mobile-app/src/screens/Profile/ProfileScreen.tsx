import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color={COLORS.white} />
        </View>
        <Text style={styles.name}>{user?.hoTen || 'Người dùng'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="receipt-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuText}>Đơn hàng của tôi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="heart-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuText}>Sản phẩm yêu thích</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuText}>Cài đặt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
          <Text style={[styles.menuText, { color: COLORS.danger }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 2,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.white },
  email: { fontSize: SIZES.body, color: COLORS.white, opacity: 0.9, marginTop: 4 },
  menu: { padding: SIZES.padding },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  menuText: { fontSize: SIZES.body, marginLeft: 16, color: COLORS.dark },
  logoutButton: { marginTop: 20, borderBottomWidth: 0 },
});

export default ProfileScreen;
