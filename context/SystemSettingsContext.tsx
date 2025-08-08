import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { SystemSettings } from '../types.ts';

interface SystemSettingsContextType {
  systemSettings: SystemSettings;
  setSystemSettings: (settings: SystemSettings) => void;
  loading: boolean;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'reuseday_system_settings';

const defaultSettings: SystemSettings = {
    siteTitle: 'Reuseday - Your Online Marketplace',
    maintenanceMode: false,
    commissionRate: 5, // Default 5% commission
    directListingFee: 0.50, // Default €0.50 fee
    logoUrl: '',
    defaultLanguage: 'en',
    contactInfo: {
        supportEmail: '',
        phone: '',
        address: ''
    },
    links: {
        termsUrl: '',
        privacyUrl: '',
    },
    dailyAdRate: 25,
    weeklyAdRate: 150,
    enablePaidListings: false,
    freeListingThreshold: 5.00,
    listingFee: 0.99,
    footerLinkLabels: {}
};

const getInitialSettings = (): SystemSettings => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Deep merge to ensure new settings fields are present
            return {
                ...defaultSettings,
                ...parsed,
                contactInfo: { ...defaultSettings.contactInfo, ...parsed.contactInfo },
                links: { ...defaultSettings.links, ...parsed.links },
                footerLinkLabels: { ...defaultSettings.footerLinkLabels, ...parsed.footerLinkLabels },
            };
        }
    } catch (e) {
        console.error("Failed to parse system settings from localStorage", e);
    }
    return defaultSettings;
}

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [systemSettings, setSettingsState] = useState<SystemSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setSettingsState(getInitialSettings());
        setLoading(false);
    }, []);

    const setSystemSettings = useCallback((settings: SystemSettings) => {
        setSettingsState(settings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, []);

    const value = { systemSettings, setSystemSettings, loading };

    return (
        <SystemSettingsContext.Provider value={value}>
            {children}
        </SystemSettingsContext.Provider>
    );
}

export const useSystemSettings = () => {
    const context = useContext(SystemSettingsContext);
    if (context === undefined) {
        throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
    }
    return context;
}