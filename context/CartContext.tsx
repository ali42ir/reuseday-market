import React, { createContext, useState, useContext, useMemo, useEffect, useCallback, useRef } from 'react';
import type { CartItem, Product, DiscountCode, User } from '../types.ts';
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

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const prevUser = usePrevious(user);
  const marketing = useMarketing();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const storageKey = useMemo(() => {
    return user ? `cart_${user.id}` : 'cart_guest';
  }, [user]);
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    let initialUser: User | null = null;
    try {
        const storedUser = localStorage.getItem('currentUser');
        initialUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Failed to parse initial user for cart", error);
    }
    const key = initialUser ? `cart_${initialUser.id}` : 'cart_guest';
    return getInitialCart(key);
  });
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number } | null>(null);
  
  useEffect(() => {
    // A user has just logged in
    if (user && !prevUser) {
        const guestCart = getInitialCart('cart_guest');
        const userCart = getInitialCart(`cart_${user.id}`);
        
        const mergedCart = [...userCart];
        guestCart.forEach(guestItem => {
            const existingItem = mergedCart.find(item => item.id === guestItem.id);
            if (existingItem) {
                // To keep it simple, we'll just add quantities.
                existingItem.quantity += guestItem.quantity;
            } else {
                mergedCart.push(guestItem);
            }
        });
        
        setCartItems(mergedCart);
        localStorage.removeItem('cart_guest');
    } else if (!user && prevUser) { // User has logged out
        setCartItems(getInitialCart('cart_guest'));
    }
    setAppliedDiscount(null);
  }, [user, prevUser]);

  useEffect(() => {
    // This effect only saves the cart to localStorage when it changes.
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
    const discount = marketing.getValidDiscountCode(code);
    if (discount) {
        setAppliedDiscount({ code: discount.code, percentage: discount.percentage });
        addToast(t('cart_discount_applied'), 'success');
        return true;
    }
    setAppliedDiscount(null);
    addToast(t('cart_discount_invalid'), 'error');
    return false;
  }, [marketing, addToast, t]);

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