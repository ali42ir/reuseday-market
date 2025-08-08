import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { StaticPage } from '../types.ts';

interface ContentContextType {
  pages: StaticPage[];
  loading: boolean;
  getPageBySlug: (slug: string) => StaticPage | undefined;
  addPage: (pageData: Omit<StaticPage, 'id' | 'createdAt'>) => boolean;
  updatePage: (id: number, updatedData: Partial<StaticPage>) => void;
  deletePage: (id: number) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const STORAGE_KEY = 'reuseday_static_pages';

const initialPages: Omit<StaticPage, 'id' | 'createdAt'>[] = [
    {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        content: `## Welcome to Dast be Dast!

By using our platform, you agree to these terms. Dast be Dast is a marketplace that connects buyers and sellers of second-hand goods.

### 1. Our Role

The platform acts solely as an intermediary. We are not a party to the transaction between buyer and seller. We do not handle, inspect, or guarantee any items. All liability for the item, its condition, and the transaction rests with the buyer and seller.

### 2. User Responsibilities

- **Buyers** are responsible for carefully reviewing item descriptions and communicating with sellers before making a purchase.
- **Sellers** are responsible for providing accurate listings and shipping items as described.

Dast be Dast is not responsible for any disputes that may arise.`
    },
    {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: `## Privacy Policy

This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our site.

### Personal Information We Collect
When you visit the Site, we automatically collect certain information about your device. Additionally, when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.`
    },
    {
        slug: 'about-us',
        title: 'About Us',
        content: `## About Dast be Dast

Dast be Dast was founded on a simple principle: to give items a second life. We believe in sustainability and the power of community. Our platform is designed to make it easy and safe for people to buy and sell pre-loved goods.

Thank you for being a part of our journey to make the world a little greener, one reused item at a time.`
    },
    {
        slug: 'affiliate-program',
        title: 'Become an Affiliate',
        content: `## Join the Dast be Dast Affiliate Program

Earn money by sharing our products! Our affiliate program is free to join and easy to set up. Contact us for more details.`
    },
    {
        slug: 'advertise',
        title: 'Advertise Your Products',
        content: `## Advertise with Us

Want to reach a larger audience? We offer advertising packages to help you promote your products on our platform. Get in touch to learn more about our advertising opportunities.`
    },
    {
        slug: 'business-card',
        title: 'Dast be Dast Business Card',
        content: `## Dast be Dast Business Card

(Feature Coming Soon)

This feature is currently under development. Stay tuned for updates on our exclusive business card program.`
    },
    {
        slug: 'shop-with-points',
        title: 'Shop with Points',
        content: `## Shop with Points

(Feature Coming Soon)

Soon you'll be able to earn and redeem points on your purchases. We're working on an exciting loyalty program.`
    },
    {
        slug: 'reload-balance',
        title: 'Reload Your Balance',
        content: `## Reload Your Balance

(Feature Coming Soon)

We are developing a wallet feature that will allow you to reload your balance for faster checkouts.`
    },
    {
        slug: 'shipping-policy',
        title: 'Shipping Rates & Policies',
        content: `## Shipping Policy

Sellers are responsible for setting their own shipping rates and policies. Please check the individual product page for shipping details or contact the seller directly.`
    },
    {
        slug: 'help-faq',
        title: 'Help & FAQ',
        content: `## Help Center

### How do I buy an item?
Simply add the item to your cart and proceed to checkout.

### How do I sell an item?
Navigate to the 'Sell on Dast be Dast' page from your profile and list your item.

### Is Dast be Dast responsible for transactions?
No, Dast be Dast is an intermediary platform. The transaction is solely between the buyer and the seller.

### How do I contact support?
You can reach us through our [Contact Us](/contact) page.`
    }
];

const getInitialContent = (): StaticPage[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.error("Failed to parse content from localStorage", e);
    }
    const pagesWithIds = initialPages.map((p, i) => ({ ...p, id: i + 1, createdAt: new Date().toISOString() }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pagesWithIds));
    return pagesWithIds;
}


export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPages(getInitialContent());
        setLoading(false);
    }, []);

    const savePages = (updatedPages: StaticPage[]) => {
        setPages(updatedPages);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPages));
    };
    
    const getPageBySlug = useCallback((slug: string) => {
        return pages.find(p => p.slug === slug);
    }, [pages]);

    const addPage = useCallback((pageData: Omit<StaticPage, 'id' | 'createdAt'>): boolean => {
        if(pages.some(p => p.slug === pageData.slug)) {
            return false; // Slug must be unique
        }
        const newPage: StaticPage = {
            ...pageData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
        };
        savePages([...pages, newPage]);
        return true;
    }, [pages]);

    const updatePage = useCallback((id: number, updatedData: Partial<StaticPage>) => {
        // Ensure slug uniqueness if it's being changed
        if (updatedData.slug && pages.some(p => p.id !== id && p.slug === updatedData.slug)) {
            // In a real app, you'd throw an error or handle this more gracefully
            console.error("Slug must be unique");
            return;
        }
        const updatedPages = pages.map(p => p.id === id ? { ...p, ...updatedData } : p);
        savePages(updatedPages);
    }, [pages]);

    const deletePage = useCallback((id: number) => {
        savePages(pages.filter(p => p.id !== id));
    }, [pages]);
    
    const value = { pages, loading, getPageBySlug, addPage, updatePage, deletePage };

    return (
        <ContentContext.Provider value={value}>
            {children}
        </ContentContext.Provider>
    );
}

export const useContent = () => {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
}