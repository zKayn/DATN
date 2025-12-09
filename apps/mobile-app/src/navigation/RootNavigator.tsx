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
import OrderSuccessScreen from '../screens/Checkout/OrderSuccessScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTab: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
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
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTab" component={MainTabNavigator} />
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
