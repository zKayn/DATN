import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { WishlistProvider } from './src/contexts/WishlistContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import RootNavigator from './src/navigation/RootNavigator';

// Suppress all logs and warnings in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// Ignore specific warnings and errors
LogBox.ignoreAllLogs(true); // Ignore all log notifications

// Setup global error handler
const setupGlobalErrorHandler = () => {
  const defaultErrorHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Silently handle errors - don't show red screen
    // In production, you might want to log these to a crash reporting service
    if (__DEV__) {
      // In development, still show errors in console but not red screen
      console.log('[Handled Error]:', error.message);
    }
    // Don't call default handler to avoid red screen
  });
};

export default function App() {
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <RootNavigator />
                <StatusBar style="auto" />
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
