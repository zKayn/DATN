import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS, SIZES } from '../../constants/config';

const CartScreen = ({ navigation }: any) => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { settings } = useSettings();
  const [selectedItems, setSelectedItems] = useState<string[]>(cartItems.map((item) => item.id));

  const shippingFee = settings?.shippingFee || 30000;
  const freeShippingThreshold = settings?.freeShippingThreshold || 500000;

  useEffect(() => {
    // Update selected items when cart changes
    setSelectedItems((prev) => prev.filter((id) => cartItems.some((item) => item.id === id)));
  }, [cartItems]);

  const toggleSelectItem = (id: string) => {
    setSelectedItems((selected) =>
      selected.includes(id) ? selected.filter((itemId) => itemId !== id) : [...selected, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => removeFromCart(itemId),
      },
    ]);
  };

  const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : shippingFee) : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm để thanh toán');
      return;
    }
    navigation.navigate('Checkout', {
      selectedItems: selectedCartItems,
      subtotal,
      shipping,
      total,
    });
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Giỏ Hàng Trống</Text>
        <Text style={styles.emptyText}>Bạn chưa có sản phẩm nào trong giỏ hàng</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.shopButtonText}>Tiếp Tục Mua Sắm</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCartItem = ({ item }: { item: typeof cartItems[0] }) => {
    const finalPrice = item.salePrice || item.price;
    const discountPercent = item.salePrice
      ? Math.round((1 - item.salePrice / item.price) * 100)
      : 0;

    return (
      <View style={styles.cartItem}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleSelectItem(item.id)}
        >
          <Ionicons
            name={selectedItems.includes(item.id) ? 'checkbox' : 'square-outline'}
            size={24}
            color={selectedItems.includes(item.id) ? COLORS.primary : COLORS.gray[400]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.itemImage}
          onPress={() => navigation.navigate('ProductDetail', { id: item.productId })}
        >
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>

        <View style={styles.itemInfo}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductDetail', { id: item.productId })}
          >
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>

          <View style={styles.itemVariants}>
            <Text style={styles.variantText}>
              {item.size} • {item.color}
            </Text>
          </View>

          <View style={styles.priceRow}>
            {item.salePrice ? (
              <>
                <Text style={styles.itemPrice}>₫{finalPrice.toLocaleString('vi-VN')}</Text>
                <Text style={styles.originalPrice}>₫{item.price.toLocaleString('vi-VN')}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
              </>
            ) : (
              <Text style={styles.itemRegularPrice}>₫{finalPrice.toLocaleString('vi-VN')}</Text>
            )}
          </View>

          <View style={styles.itemActions}>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Ionicons name="remove" size={16} color={COLORS.dark} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                <Ionicons name="add" size={16} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>

          <Text style={styles.stockText}>Còn {item.stock} sản phẩm</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
          <Ionicons
            name={selectedItems.length === cartItems.length ? 'checkbox' : 'square-outline'}
            size={24}
            color={
              selectedItems.length === cartItems.length ? COLORS.primary : COLORS.gray[400]
            }
          />
          <Text style={styles.selectAllText}>
            Chọn tất cả ({cartItems.length} sản phẩm)
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Tạm tính ({selectedCartItems.length} sản phẩm)
            </Text>
            <Text style={styles.summaryValue}>₫{subtotal.toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={[styles.summaryValue, shipping === 0 && styles.freeShipping]}>
              {shipping === 0 ? 'Miễn phí' : `₫${shipping.toLocaleString('vi-VN')}`}
            </Text>
          </View>

          {subtotal > 0 && subtotal < freeShippingThreshold && (
            <View style={styles.freeShippingHint}>
              <Ionicons name="information-circle" size={16} color={COLORS.primary} />
              <Text style={styles.freeShippingText}>
                Mua thêm ₫{(freeShippingThreshold - subtotal).toLocaleString('vi-VN')} để được
                miễn phí vận chuyển
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>₫{total.toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, selectedCartItems.length === 0 && styles.buttonDisabled]}
          onPress={handleCheckout}
          disabled={selectedCartItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Tiến Hành Thanh Toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginTop: 1,
  },
  checkbox: {
    paddingRight: 12,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    backgroundColor: COLORS.gray[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  itemVariants: {
    marginBottom: 6,
  },
  variantText: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.danger, // Red for sale price
    marginRight: 8,
  },
  itemRegularPrice: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.danger, // Red for regular price
  },
  originalPrice: {
    fontSize: SIZES.small,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountBadge: {
    backgroundColor: COLORS.danger, // Red background
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    minWidth: 32,
    textAlign: 'center',
  },
  stockText: {
    fontSize: SIZES.tiny,
    color: COLORS.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    marginBottom: 24,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    padding: SIZES.padding,
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: SIZES.body,
    color: COLORS.gray[700],
  },
  summaryValue: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
  },
  freeShipping: {
    color: COLORS.success,
  },
  freeShippingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 10,
    borderRadius: SIZES.borderRadius,
    marginTop: 8,
    marginBottom: 12,
  },
  freeShippingText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.danger, // Red for total
  },
  checkoutButton: {
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default CartScreen;
