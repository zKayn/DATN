'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get wishlist key based on user
  const getWishlistKey = (userId: string | null) => {
    return userId ? `wishlist_${userId}` : 'wishlist_guest';
  };

  // Load wishlist from localStorage on mount and when user changes
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

    const wishlistKey = getWishlistKey(userId);
    const savedWishlist = localStorage.getItem(wishlistKey);

    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    } else {
      setWishlistItems([]);
    }

    setIsLoaded(true);

    // Listen for login/logout events
    const handleUserChange = () => {
      // Reload wishlist for new user
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
      const newWishlistKey = getWishlistKey(newUserId);
      const newSavedWishlist = localStorage.getItem(newWishlistKey);

      if (newSavedWishlist) {
        try {
          setWishlistItems(JSON.parse(newSavedWishlist));
        } catch (error) {
          console.error('Error loading wishlist:', error);
          setWishlistItems([]);
        }
      } else {
        setWishlistItems([]);
      }
    };

    window.addEventListener('user-login', handleUserChange);
    window.addEventListener('user-logout', handleUserChange);

    return () => {
      window.removeEventListener('user-login', handleUserChange);
      window.removeEventListener('user-logout', handleUserChange);
    };
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const wishlistKey = getWishlistKey(currentUserId);
      localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded, currentUserId]);

  const addToWishlist = (item: Omit<WishlistItem, 'id'>) => {
    setWishlistItems(prev => {
      // Check if product already in wishlist
      const existingIndex = prev.findIndex(i => i.productId === item.productId);

      if (existingIndex > -1) {
        // Already in wishlist, don't add again
        return prev;
      }

      // Add new item
      const newItem: WishlistItem = {
        ...item,
        id: `${item.productId}-${Date.now()}`
      };
      return [...prev, newItem];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
