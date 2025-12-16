import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface WishlistContextType {
  wishlist: any[];
  wishlistItems: any[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  loadWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getWishlist();
      if (response.success && response.data) {
        let items = Array.isArray(response.data) ? response.data : response.data.items || [];

        // Nếu items chỉ chứa IDs (string) hoặc objects thiếu thông tin sản phẩm
        // thì fetch thông tin chi tiết
        const needsFetch = items.length > 0 && (
          typeof items[0] === 'string' ||
          (!items[0].tenSanPham && !items[0].name && items[0]._id)
        );

        if (needsFetch) {
          console.log('Fetching full product details for wishlist items...');
          const detailedItems = await Promise.all(
            items.map(async (item: any) => {
              try {
                const productId = typeof item === 'string' ? item : item._id || item.productId;
                const productResponse = await api.getProductById(productId);
                if (productResponse.success && productResponse.data) {
                  return productResponse.data;
                }
                return null;
              } catch (error) {
                console.error('Error fetching product details:', error);
                return null;
              }
            })
          );
          // Filter out null values
          items = detailedItems.filter(item => item !== null);
        }

        setWishlist(items);
      }
    } catch (error: any) {
      // Nếu lỗi 403 hoặc 404, có thể do backend chưa hỗ trợ wishlist
      // Fallback to localStorage
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Wishlist API not available, using local storage');
        try {
          const localData = await AsyncStorage.getItem('wishlist_local');
          if (localData) {
            const localItems = JSON.parse(localData);
            // Fetch full product details for local items too
            if (localItems.length > 0) {
              const detailedItems = await Promise.all(
                localItems.map(async (item: any) => {
                  try {
                    const productId = item._id || item.productId;
                    const productResponse = await api.getProductById(productId);
                    if (productResponse.success && productResponse.data) {
                      return productResponse.data;
                    }
                    return null;
                  } catch (error) {
                    console.error('Error fetching product details:', error);
                    return null;
                  }
                })
              );
              setWishlist(detailedItems.filter(item => item !== null));
            } else {
              setWishlist(localItems);
            }
          }
        } catch (e) {
          console.error('Error loading local wishlist:', e);
        }
      } else {
        console.error('Error loading wishlist:', error);
      }
      setWishlist([]);
    }
    setLoading(false);
  };

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.addToWishlist(productId);
      if (response.success) {
        await loadWishlist();
      }
    } catch (error: any) {
      // Fallback to local storage if API fails
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Using local wishlist storage');
        try {
          // Fetch full product details
          const productResponse = await api.getProductById(productId);
          if (productResponse.success && productResponse.data) {
            const updated = [...wishlist, productResponse.data];
            setWishlist(updated);
            // Save to local storage with full product data
            await AsyncStorage.setItem('wishlist_local', JSON.stringify(updated));
          }
        } catch (fetchError) {
          console.error('Error fetching product details:', fetchError);
          // Fallback to just ID
          const newItem = { _id: productId, addedAt: new Date() };
          const updated = [...wishlist, newItem];
          setWishlist(updated);
          await AsyncStorage.setItem('wishlist_local', JSON.stringify(updated));
        }
      } else {
        console.error('Error adding to wishlist:', error);
        throw error;
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.removeFromWishlist(productId);
      if (response.success) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
      }
    } catch (error: any) {
      // Fallback to local storage if API fails
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Using local wishlist storage');
        const updated = wishlist.filter((item) => item._id !== productId);
        setWishlist(updated);
        await AsyncStorage.setItem('wishlist_local', JSON.stringify(updated));
      } else {
        console.error('Error removing from wishlist:', error);
        throw error;
      }
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item._id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const value = {
    wishlist,
    wishlistItems: wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loadWishlist,
    wishlistCount: wishlist.length,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
