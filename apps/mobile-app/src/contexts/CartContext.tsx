import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice: number | null;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

interface CartContextData {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

const CART_STORAGE_KEY = '@cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Load cart from API for logged-in users
  const loadCartFromAPI = async () => {
    try {
      const response = await api.getCart();
      if (response.success && response.data) {
        // Convert API cart format to local cart format
        const apiCart: CartItem[] = response.data.map((item: any) => ({
          id: `${item.sanPham}-${item.kichThuoc}-${item.mauSac}`,
          productId: item.sanPham,
          name: item.ten,
          slug: item.slug,
          image: item.hinhAnh,
          price: item.gia,
          salePrice: item.giaKhuyenMai || null,
          size: item.kichThuoc,
          color: item.mauSac,
          quantity: item.soLuong,
          stock: item.tonKho,
        }));
        setCartItems(apiCart);
        // Also save to AsyncStorage as cache
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(apiCart));
        return apiCart;
      }
    } catch (error) {
      console.error('Error loading cart from API:', error);
      // Fallback to AsyncStorage
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const localCart = JSON.parse(savedCart);
        setCartItems(localCart);
        return localCart;
      }
    }
    return [];
  };

  // Sync local cart to API
  const syncCartToAPI = async (items: CartItem[]) => {
    try {
      // Clear server cart first
      await api.clearCart();

      // Add all items to server
      for (const item of items) {
        await api.addToCart({
          sanPham: item.productId,
          ten: item.name,
          slug: item.slug,
          hinhAnh: item.image,
          gia: item.price,
          giaKhuyenMai: item.salePrice || undefined,
          kichThuoc: item.size,
          mauSac: item.color,
          soLuong: item.quantity,
          tonKho: item.stock,
        });
      }
    } catch (error) {
      console.error('Error syncing cart to API:', error);
    }
  };

  // Manual sync function (can be called from components)
  const syncCart = async () => {
    if (isAuthenticated && cartItems.length > 0) {
      await syncCartToAPI(cartItems);
    }
  };

  // Load cart on mount and when auth state changes
  useEffect(() => {
    const initCart = async () => {
      if (isAuthenticated) {
        // Logged in user - load from API
        const apiCart = await loadCartFromAPI();

        // Check if there's a local cart to merge (from guest session)
        const localCartStr = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (localCartStr) {
          try {
            const localCart: CartItem[] = JSON.parse(localCartStr);
            // Only merge if local cart has items and is different from API cart
            if (localCart.length > 0 && JSON.stringify(localCart) !== JSON.stringify(apiCart)) {
              // Merge local cart with API cart
              const mergedCart = [...apiCart];
              for (const localItem of localCart) {
                const existingIndex = mergedCart.findIndex(
                  (item) =>
                    item.productId === localItem.productId &&
                    item.size === localItem.size &&
                    item.color === localItem.color
                );
                if (existingIndex > -1) {
                  // Item exists, add quantities
                  mergedCart[existingIndex].quantity = Math.min(
                    mergedCart[existingIndex].quantity + localItem.quantity,
                    localItem.stock
                  );
                } else {
                  // New item, add to cart
                  mergedCart.push(localItem);
                }
              }
              setCartItems(mergedCart);
              // Sync merged cart to API
              await syncCartToAPI(mergedCart);
            }
          } catch (error) {
            console.error('Error merging local cart:', error);
          }
        }
      } else {
        // Guest user - load from AsyncStorage
        try {
          const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error('Load cart error:', error);
          setCartItems([]);
        }
      }
      setIsLoaded(true);
    };

    initCart();
  }, [isAuthenticated, user?._id]);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (isLoaded) {
        try {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
          console.error('Save cart error:', error);
        }
      }
    };
    saveCart();
  }, [cartItems, isLoaded]);

  const addToCart = async (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    // Update local state first for immediate UI feedback
    setCartItems((prev) => {
      // Check if item with same product, size, and color already exists
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
      );

      if (existingIndex > -1) {
        // Update existing item quantity
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: Math.min(newCart[existingIndex].quantity + (item.quantity || 1), item.stock),
        };
        return newCart;
      }

      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.productId}-${item.size}-${item.color}-${Date.now()}`,
        quantity: item.quantity || 1,
      };
      return [...prev, newItem];
    });

    // Sync to API if user is logged in
    if (isAuthenticated) {
      try {
        await api.addToCart({
          sanPham: item.productId,
          ten: item.name,
          slug: item.slug,
          hinhAnh: item.image,
          gia: item.price,
          giaKhuyenMai: item.salePrice || undefined,
          kichThuoc: item.size,
          mauSac: item.color,
          soLuong: item.quantity || 1,
          tonKho: item.stock,
        });
      } catch (error) {
        console.error('Error syncing add to cart:', error);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    const itemToRemove = cartItems.find((item) => item.id === itemId);

    setCartItems((prev) => prev.filter((item) => item.id !== itemId));

    // Sync to API if user is logged in
    if (isAuthenticated && itemToRemove) {
      try {
        await api.removeFromCart({
          sanPham: itemToRemove.productId,
          kichThuoc: itemToRemove.size,
          mauSac: itemToRemove.color,
        });
      } catch (error) {
        console.error('Error syncing remove from cart:', error);
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const item = cartItems.find((i) => i.id === itemId);

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item
      )
    );

    // Sync to API if user is logged in
    if (isAuthenticated && item) {
      try {
        await api.updateCartItem({
          sanPham: item.productId,
          kichThuoc: item.size,
          mauSac: item.color,
          soLuong: Math.max(1, Math.min(quantity, item.stock)),
        });
      } catch (error) {
        console.error('Error syncing update quantity:', error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);

    // Sync to API if user is logged in
    if (isAuthenticated) {
      try {
        await api.clearCart();
      } catch (error) {
        console.error('Error syncing clear cart:', error);
      }
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.salePrice || item.price;
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
