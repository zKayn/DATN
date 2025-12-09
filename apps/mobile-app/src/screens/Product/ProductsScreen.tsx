import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/config';

const ProductsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách sản phẩm</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.padding, paddingTop: 50 },
  title: { fontSize: SIZES.h2, fontWeight: 'bold' },
});

export default ProductsScreen;
