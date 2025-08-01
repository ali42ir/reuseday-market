
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import type { CartItem, Product, DiscountCode } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { useMarketing } from './MarketingContext.tsx';
import { useToast } from './ToastContext.tsx';
import { useLanguage } from './LanguageContext.tsx';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  appliedDiscount: { code: string; percentage: number } | null;
  applyDiscountCode: (code: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getInitialCart = (key: string): CartItem[] => {
    try {
      const storedCart = localStorage.getItem(key);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { getValidDiscountCode } = useMarketing();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const storageKey = useMemo(() => {
    return user ? `cart_${user.id}` : 'cart_guest';
  }, [user]);
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getInitialCart(storageKey));
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number } | null>(null);

  useEffect(() => {
    setCartItems(getInitialCart(storageKey));
    setAppliedDiscount(null); // Clear discount on user change
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);


  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedDiscount(null);
  };

  const applyDiscountCode = useCallback((code: string): boolean => {
    const discount = getValidDiscountCode(code);
    if (discount) {
        setAppliedDiscount({ code: discount.code, percentage: discount.percentage });
        addToast(t('cart_discount_applied'), 'success');
        return true;
    }
    setAppliedDiscount(null);
    addToast(t('cart_discount_invalid'), 'error');
    return false;
  }, [getValidDiscountCode, addToast, t]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    if (appliedDiscount) {
      const discountAmount = cartSubtotal * (appliedDiscount.percentage / 100);
      return Math.max(0, cartSubtotal - discountAmount);
    }
    return cartSubtotal;
  }, [cartSubtotal, appliedDiscount]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartSubtotal, cartTotal, appliedDiscount, applyDiscountCode }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
