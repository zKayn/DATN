'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get cart key based on user
  const getCartKey = (userId: string | null) => {
    return userId ? `cart_${userId}` : 'cart_guest';
  };

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    // Get current user from token
    const token = localStorage.getItem('token');
    let userId: string | null = null;

    if (token) {
      try {
        // Decode JWT to get user ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload._id || payload.id;
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    setCurrentUserId(userId);

    const cartKey = getCartKey(userId);
    const savedCart = localStorage.getItem(cartKey);

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    } else {
      setCartItems([]);
    }

    setIsLoaded(true);

    // Listen for login/logout events
    const handleUserChange = () => {
      // Reload cart for new user
      const newToken = localStorage.getItem('token');
      let newUserId: string | null = null;

      if (newToken) {
        try {
          const payload = JSON.parse(atob(newToken.split('.')[1]));
          newUserId = payload._id || payload.id;
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      setCurrentUserId(newUserId);
      const newCartKey = getCartKey(newUserId);
      const newSavedCart = localStorage.getItem(newCartKey);

      if (newSavedCart) {
        try {
          setCartItems(JSON.parse(newSavedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    };

    window.addEventListener('user-login', handleUserChange);
    window.addEventListener('user-logout', handleUserChange);

    return () => {
      window.removeEventListener('user-login', handleUserChange);
      window.removeEventListener('user-logout', handleUserChange);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const cartKey = getCartKey(currentUserId);
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded, currentUserId]);

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    setCartItems(prev => {
      // Check if item with same product, size, and color already exists
      const existingIndex = prev.findIndex(
        i => i.productId === item.productId && i.size === item.size && i.color === item.color
      );

      if (existingIndex > -1) {
        // Update existing item quantity
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: Math.min(
            newCart[existingIndex].quantity + (item.quantity || 1),
            item.stock
          )
        };
        return newCart;
      }

      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.productId}-${item.size}-${item.color}-${Date.now()}`,
        quantity: item.quantity || 1
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
