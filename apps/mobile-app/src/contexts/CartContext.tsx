import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const CartContext = createContext<CartContextData>({} as CartContextData);

const CART_STORAGE_KEY = '@cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveCart();
    }
  }, [cartItems, isLoaded]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Load cart error:', error);
    }
    setIsLoaded(true);
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Save cart error:', error);
    }
  };

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
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
          quantity: Math.min(
            newCart[existingIndex].quantity + (item.quantity || 1),
            item.stock
          ),
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
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
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
