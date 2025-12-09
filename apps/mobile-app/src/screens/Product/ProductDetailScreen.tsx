import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/config';

const ProductDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết sản phẩm</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.padding },
  title: { fontSize: SIZES.h2, fontWeight: 'bold' },
});

export default ProductDetailScreen;
