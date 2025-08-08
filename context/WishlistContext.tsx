
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Product } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { useProductContext } from './ProductContext.tsx';

interface WishlistContextType {
  wishlistItems: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProductContext();

  useEffect(() => {
    if (user) {
      try {
        const storedIds = localStorage.getItem(`wishlist_${user.id}`);
        if (storedIds) {
          setWishlistIds(JSON.parse(storedIds));
        } else {
          setWishlistIds([]);
        }
      } catch (e) {
        console.error("Failed to parse wishlist from localStorage", e);
        setWishlistIds([]);
      }
    } else {
      setWishlistIds([]);
    }
  }, [user]);
  
  useEffect(() => {
    if (wishlistIds.length > 0 && products.length > 0) {
      const items = products.filter(p => wishlistIds.includes(p.id));
      setWishlistItems(items);
    } else {
      setWishlistItems([]);
    }
  }, [wishlistIds, products]);

  const toggleWishlist = (product: Product) => {
    if (!user) return;
    const newWishlistIds = wishlistIds.includes(product.id)
      ? wishlistIds.filter(id => id !== product.id)
      : [...wishlistIds, product.id];
    
    setWishlistIds(newWishlistIds);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newWishlistIds));
  };
  
  const isInWishlist = (productId: number) => {
    return wishlistIds.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, loading: productsLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};