import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import ProductDetailScreen from '../screens/Product/ProductDetailScreen';
import CartScreen from '../screens/Cart/CartScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import OrderSuccessScreen from '../screens/Order/OrderSuccessScreen';
import OrderHistoryScreen from '../screens/Order/OrderHistoryScreen';
import OrderDetailScreen from '../screens/Order/OrderDetailScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import AddressListScreen from '../screens/Address/AddressListScreen';
import AddressFormScreen from '../screens/Address/AddressFormScreen';
import ReviewScreen from '../screens/Review/ReviewScreen';
import AllReviewsScreen from '../screens/Review/AllReviewsScreen';
import MyReviewsScreen from '../screens/Review/MyReviewsScreen';
import ProfileEditScreen from '../screens/Profile/ProfileEditScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTab: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string; orderCode: string };
  OrderHistory: undefined;
  OrderDetail: { id: string };
  Search: undefined;
  AddressList: { selectMode?: boolean; onSelect?: (address: any) => void };
  AddressForm: { addressId?: string };
  WriteReview: { productId: string; productName: string; productImage: string; orderId?: string };
  AllReviews: { productId: string; productName: string; averageRating: number; totalReviews: number };
  MyReviews: undefined;
  ProfileEdit: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Show splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTab" component={MainTabNavigator} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: true, title: 'Đăng nhập' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: true, title: 'Đăng ký' }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ headerShown: true, title: 'Chi tiết sản phẩm' }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: true, title: 'Giỏ hàng' }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ headerShown: true, title: 'Thanh toán' }}
        />
        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistoryScreen}
          options={{ headerShown: true, title: 'Lịch sử đơn hàng' }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ headerShown: true, title: 'Chi tiết đơn hàng' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddressList"
          component={AddressListScreen}
          options={{ headerShown: true, title: 'Địa chỉ giao hàng' }}
        />
        <Stack.Screen
          name="AddressForm"
          component={AddressFormScreen}
          options={{ headerShown: true, title: 'Thêm địa chỉ' }}
        />
        <Stack.Screen
          name="WriteReview"
          component={ReviewScreen}
          options={{ headerShown: true, title: 'Viết đánh giá' }}
        />
        <Stack.Screen
          name="AllReviews"
          component={AllReviewsScreen}
          options={{ headerShown: true, title: 'Tất cả đánh giá' }}
        />
        <Stack.Screen
          name="MyReviews"
          component={MyReviewsScreen}
          options={{ headerShown: true, title: 'Đánh giá của tôi' }}
        />
        <Stack.Screen
          name="ProfileEdit"
          component={ProfileEditScreen}
          options={{ headerShown: true, title: 'Chỉnh sửa thông tin' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
