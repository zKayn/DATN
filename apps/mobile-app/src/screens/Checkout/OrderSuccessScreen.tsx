import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/config';

const OrderSuccessScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt hàng thành công!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.padding, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.success },
});

export default OrderSuccessScreen;
