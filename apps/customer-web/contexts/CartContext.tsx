'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

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
  syncCart: () => Promise<void>;
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

  // De-duplicate cart items by productId, size, and color
  const deduplicateCart = (items: CartItem[]): CartItem[] => {
    const uniqueMap = new Map<string, CartItem>();

    for (const item of items) {
      const key = `${item.productId}-${item.size}-${item.color}`;
      const existing = uniqueMap.get(key);

      if (existing) {
        // Merge quantities
        uniqueMap.set(key, {
          ...existing,
          quantity: Math.min(existing.quantity + item.quantity, item.stock)
        });
      } else {
        uniqueMap.set(key, item);
      }
    }

    return Array.from(uniqueMap.values());
  };

  // Load cart from API for logged-in users
  const loadCartFromAPI = async (token: string, userId: string) => {
    try {
      const response = await api.getCart(token);
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
          stock: item.tonKho
        }));

        // De-duplicate items before setting
        const deduplicatedCart = deduplicateCart(apiCart);
        setCartItems(deduplicatedCart);
        // Also save to localStorage as cache with correct user key
        const cartKey = getCartKey(userId);
        localStorage.setItem(cartKey, JSON.stringify(deduplicatedCart));
        return deduplicatedCart;
      }
    } catch (error) {
      console.error('Error loading cart from API:', error);
      // Fallback to localStorage
      const cartKey = getCartKey(userId);
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        const localCart = JSON.parse(savedCart);
        const deduplicatedCart = deduplicateCart(localCart);
        setCartItems(deduplicatedCart);
        return deduplicatedCart;
      }
    }
    return [];
  };

  // Sync local cart to API
  const syncCartToAPI = async (token: string, items: CartItem[]) => {
    try {
      // Clear server cart first
      await api.clearCart(token);

      // Add all items to server
      for (const item of items) {
        await api.addToCart(token, {
          sanPham: item.productId,
          ten: item.name,
          slug: item.slug,
          hinhAnh: item.image,
          gia: item.price,
          giaKhuyenMai: item.salePrice || undefined,
          kichThuoc: item.size,
          mauSac: item.color,
          soLuong: item.quantity,
          tonKho: item.stock
        });
      }
    } catch (error) {
      console.error('Error syncing cart to API:', error);
    }
  };

  // Manual sync function (can be called from components)
  const syncCart = async () => {
    const token = localStorage.getItem('token');
    if (token && cartItems.length > 0) {
      await syncCartToAPI(token, cartItems);
    }
  };

  // Load cart from localStorage or API on mount and when user changes
  useEffect(() => {
    const initCart = async () => {
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

      if (token && userId) {
        // Logged in user - load from API first
        const apiCart = await loadCartFromAPI(token, userId);

        // Check if there's a guest cart to merge
        const guestCart = localStorage.getItem('cart_guest');
        if (guestCart) {
          try {
            const guestItems: CartItem[] = JSON.parse(guestCart);
            if (guestItems.length > 0) {
              // Merge guest cart with user cart and de-duplicate
              const combinedCart = [...apiCart, ...guestItems];
              const mergedCart = deduplicateCart(combinedCart);

              setCartItems(mergedCart);
              // Sync merged cart to API
              await syncCartToAPI(token, mergedCart);
              // Save merged cart with correct user key
              const userCartKey = getCartKey(userId);
              localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
              // Clear guest cart
              localStorage.removeItem('cart_guest');
            }
          } catch (error) {
            console.error('Error merging guest cart:', error);
          }
        }
      } else {
        // Guest user - load from localStorage
        const cartKey = getCartKey(userId);
        const savedCart = localStorage.getItem(cartKey);

        if (savedCart) {
          try {
            const localCart = JSON.parse(savedCart);
            const deduplicatedCart = deduplicateCart(localCart);
            setCartItems(deduplicatedCart);
            // Save deduplicated cart back to localStorage
            localStorage.setItem(cartKey, JSON.stringify(deduplicatedCart));
          } catch (error) {
            console.error('Error loading cart:', error);
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }

      setIsLoaded(true);
    };

    initCart();

    // Listen for login/logout events
    const handleUserChange = () => {
      setIsLoaded(false);
      initCart();
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

  const addToCart = async (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    const newCartItems = await new Promise<CartItem[]>((resolve) => {
      setCartItems(prev => {
        // Check if item with same product, size, and color already exists
        const existingIndex = prev.findIndex(
          i => i.productId === item.productId && i.size === item.size && i.color === item.color
        );

        let newCart: CartItem[];
        if (existingIndex > -1) {
          // Update existing item quantity
          newCart = [...prev];
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: Math.min(
              newCart[existingIndex].quantity + (item.quantity || 1),
              item.stock
            )
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            ...item,
            id: `${item.productId}-${item.size}-${item.color}-${Date.now()}`,
            quantity: item.quantity || 1
          };
          newCart = [...prev, newItem];
        }
        resolve(newCart);
        return newCart;
      });
    });

    // Sync to API if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.addToCart(token, {
          sanPham: item.productId,
          ten: item.name,
          slug: item.slug,
          hinhAnh: item.image,
          gia: item.price,
          giaKhuyenMai: item.salePrice || undefined,
          kichThuoc: item.size,
          mauSac: item.color,
          soLuong: item.quantity || 1,
          tonKho: item.stock
        });
      } catch (error) {
        console.error('Error syncing add to cart:', error);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);

    setCartItems(prev => prev.filter(item => item.id !== itemId));

    // Sync to API if user is logged in
    const token = localStorage.getItem('token');
    if (token && itemToRemove) {
      try {
        await api.removeFromCart(token, {
          sanPham: itemToRemove.productId,
          kichThuoc: itemToRemove.size,
          mauSac: itemToRemove.color
        });
      } catch (error) {
        console.error('Error syncing remove from cart:', error);
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const item = cartItems.find(i => i.id === itemId);

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );

    // Sync to API if user is logged in
    const token = localStorage.getItem('token');
    if (token && item) {
      try {
        await api.updateCartItem(token, {
          sanPham: item.productId,
          kichThuoc: item.size,
          mauSac: item.color,
          soLuong: Math.max(1, Math.min(quantity, item.stock))
        });
      } catch (error) {
        console.error('Error syncing update quantity:', error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);

    // Sync to API if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.clearCart(token);
      } catch (error) {
        console.error('Error syncing clear cart:', error);
      }
    }
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
        cartTotal,
        syncCart
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
