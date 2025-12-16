import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/config';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ProductsScreen from '../screens/Product/ProductsScreen';
import WishlistScreen from '../screens/Wishlist/WishlistScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Wishlist: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabBarIcon = ({ route, focused, color, size }: any) => {
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  let iconName: keyof typeof Ionicons.glyphMap = 'home';
  let badge = 0;

  if (route.name === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === 'Products') {
    iconName = focused ? 'grid' : 'grid-outline';
  } else if (route.name === 'Wishlist') {
    iconName = focused ? 'heart' : 'heart-outline';
    badge = wishlist.length;
  } else if (route.name === 'Chat') {
    iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
  } else if (route.name === 'Profile') {
    iconName = focused ? 'person' : 'person-outline';
  }

  return (
    <View>
      <Ionicons name={iconName} size={size} color={color} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ tabBarLabel: 'Sản phẩm' }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ tabBarLabel: 'Yêu thích' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: 'Chat AI' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MainTabNavigator;
