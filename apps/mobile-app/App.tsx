import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { WishlistProvider } from './src/contexts/WishlistContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
