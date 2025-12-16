'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface WishlistItem {
  _id: string;
  ten: string;
  slug: string;
  hinhAnh: string[];
  gia: number;
  giaKhuyenMai?: number;
  danhGia?: {
    trungBinh: number;
    soLuong: number;
  };
  tonKho?: number;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  loading: boolean;
  addToWishlist: (product: WishlistItem) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  loadWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  // Load wishlist when user logs in or component mounts
  useEffect(() => {
    if (user && token) {
      loadWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, token]);

  const loadWishlist = async () => {
    if (!token) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getWishlist(token);

      if (response.success && response.data) {
        // Handle different response structures
        let items = Array.isArray(response.data)
          ? response.data
          : (response.data.wishlist || response.data.items || []);

        // Filter out null/undefined and map to WishlistItem format
        const mappedItems: WishlistItem[] = items
          .filter((item: any) => item && item._id)
          .map((item: any) => ({
            _id: item._id,
            ten: item.ten || item.name || '',
            slug: item.slug || '',
            hinhAnh: item.hinhAnh || item.images || [],
            gia: item.gia || item.price || 0,
            giaKhuyenMai: item.giaKhuyenMai || item.salePrice || undefined,
            danhGia: item.danhGia || {
              trungBinh: item.rating || 0,
              soLuong: item.reviewCount || 0
            },
            tonKho: item.tonKho || item.stock || 0
          }));

        setWishlistItems(mappedItems);
      }
    } catch (error: any) {
      console.error('Error loading wishlist:', error);

      // Fallback to localStorage for offline support
      if (error.message?.includes('401') || error.message?.includes('403')) {
        console.log('Not authenticated, clearing wishlist');
        setWishlistItems([]);
      } else {
        // Try loading from localStorage as backup
        try {
          const localData = localStorage.getItem(`wishlist_${user?._id || 'guest'}`);
          if (localData) {
            const parsed = JSON.parse(localData);
            setWishlistItems(parsed);
          }
        } catch (e) {
          console.error('Error loading local wishlist:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: WishlistItem) => {
    if (!token || !user) {
      console.warn('User must be logged in to add to wishlist');
      return;
    }

    try {
      const response = await api.addToWishlist(token, product._id);

      if (response.success) {
        // Optimistically update UI
        setWishlistItems(prev => {
          // Check if already exists
          if (prev.some(item => item._id === product._id)) {
            return prev;
          }
          const updated = [...prev, product];

          // Also save to localStorage as backup
          try {
            localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updated));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }

          return updated;
        });

        // Reload from server to ensure sync
        await loadWishlist();
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);

      // Fallback to localStorage
      setWishlistItems(prev => {
        if (prev.some(item => item._id === product._id)) {
          return prev;
        }
        const updated = [...prev, product];
        try {
          localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving to localStorage:', e);
        }
        return updated;
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!token || !user) {
      console.warn('User must be logged in to remove from wishlist');
      return;
    }

    try {
      const response = await api.removeFromWishlist(token, productId);

      if (response.success) {
        // Optimistically update UI
        setWishlistItems(prev => {
          const updated = prev.filter(item => item._id !== productId);

          // Also save to localStorage as backup
          try {
            localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updated));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }

          return updated;
        });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);

      // Fallback to localStorage
      setWishlistItems(prev => {
        const updated = prev.filter(item => item._id !== productId);
        try {
          localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving to localStorage:', e);
        }
        return updated;
      });
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item._id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    if (user) {
      try {
        localStorage.removeItem(`wishlist_${user._id}`);
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        loadWishlist,
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
