
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { DiscountCode, Banner } from '../types.ts';

interface MarketingContextType {
  discountCodes: DiscountCode[];
  featuredProductIds: number[];
  banners: Banner[];
  addDiscountCode: (codeData: Omit<DiscountCode, 'id' | 'isActive'>) => boolean;
  updateDiscountCode: (id: number, updatedData: Partial<DiscountCode>) => void;
  deleteDiscountCode: (id: number) => void;
  getValidDiscountCode: (code: string) => DiscountCode | null;
  setFeaturedProductIds: (ids: number[]) => void;
  addBanner: (bannerData: Omit<Banner, 'id'>) => void;
  deleteBanner: (id: number) => void;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

const DISCOUNT_STORAGE_KEY = 'reuseday_discounts';
const FEATURED_STORAGE_KEY = 'reuseday_featured_products';
const BANNERS_STORAGE_KEY = 'reuseday_banners';


const getFromStorage = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored) as T;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
    }
    return fallback;
};

export const MarketingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(() => getFromStorage(DISCOUNT_STORAGE_KEY, []));
    const [featuredProductIds, setFeaturedProductIdsState] = useState<number[]>(() => getFromStorage(FEATURED_STORAGE_KEY, []));
    const [banners, setBanners] = useState<Banner[]>(() => getFromStorage(BANNERS_STORAGE_KEY, []));

    useEffect(() => {
        localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(discountCodes));
    }, [discountCodes]);

    useEffect(() => {
        localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(featuredProductIds));
    }, [featuredProductIds]);

    useEffect(() => {
        localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
    }, [banners]);

    const addDiscountCode = useCallback((codeData: Omit<DiscountCode, 'id' | 'isActive'>) => {
        const codeExists = discountCodes.some(c => c.code.toUpperCase() === codeData.code.toUpperCase());
        if (codeExists) {
            return false;
        }
        const newCode: DiscountCode = {
            ...codeData,
            id: Date.now(),
            isActive: true,
        };
        setDiscountCodes(prev => [...prev, newCode]);
        return true;
    }, [discountCodes]);

    const updateDiscountCode = useCallback((id: number, updatedData: Partial<DiscountCode>) => {
        setDiscountCodes(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    }, []);

    const deleteDiscountCode = useCallback((id: number) => {
        setDiscountCodes(prev => prev.filter(c => c.id !== id));
    }, []);

    const getValidDiscountCode = useCallback((code: string): DiscountCode | null => {
        const foundCode = discountCodes.find(c => c.code.toUpperCase() === code.toUpperCase());
        if (!foundCode || !foundCode.isActive) return null;

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
        
        // Add a day to expiry to make it inclusive
        const expiry = new Date(foundCode.expiryDate);
        expiry.setHours(23, 59, 59, 999);

        const start = new Date(foundCode.startDate);
        start.setHours(0, 0, 0, 0);
        
        if (now > expiry || now < start) return null;
        
        return foundCode;
    }, [discountCodes]);

    const setFeaturedProductIds = useCallback((ids: number[]) => {
        setFeaturedProductIdsState(ids);
    }, []);

    const addBanner = useCallback((bannerData: Omit<Banner, 'id'>) => {
        const newBanner: Banner = { ...bannerData, id: Date.now() };
        setBanners(prev => [...prev, newBanner]);
    }, []);

    const deleteBanner = useCallback((id: number) => {
        setBanners(prev => prev.filter(b => b.id !== id));
    }, []);

    const value = { 
        discountCodes, 
        featuredProductIds,
        banners,
        addDiscountCode, 
        updateDiscountCode, 
        deleteDiscountCode,
        getValidDiscountCode,
        setFeaturedProductIds,
        addBanner,
        deleteBanner
    };

    return (
        <MarketingContext.Provider value={value}>
            {children}
        </MarketingContext.Provider>
    );
}

export const useMarketing = () => {
    const context = useContext(MarketingContext);
    if (context === undefined) {
        throw new Error('useMarketing must be used within a MarketingProvider');
    }
    return context;
}