import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { UserNotification } from '../types.ts';
import { useLanguage } from './LanguageContext.tsx';

interface UserNotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  addNotification: (userId: number, data: Omit<UserNotification, 'id' | 'isRead' | 'createdAt' | 'message'> & { message: string, replacements?: { [key: string]: string | number } }) => void;
  markAllAsRead: (userId: number) => void;
  fetchNotifications: (userId: number) => void;
}

const UserNotificationContext = createContext<UserNotificationContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'reuseday_user_notifications_';

const getInitialNotifications = (userId: number): UserNotification[] => {
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse user notifications from localStorage", e);
    }
    return [];
};

export const UserNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const { t } = useLanguage();

    const saveNotifications = (userId: number, updatedNotifications: UserNotification[]) => {
        const sorted = updatedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const limited = sorted.slice(0, 50);
        setNotifications(limited);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(limited));
    };

    const fetchNotifications = useCallback((userId: number) => {
        setNotifications(getInitialNotifications(userId));
    }, []);

    const addNotification = useCallback((
        userId: number, 
        data: Omit<UserNotification, 'id' | 'isRead' | 'createdAt' | 'message'> & { message: string, replacements?: { [key: string]: string | number } }
    ) => {
        const userNotifications = getInitialNotifications(userId);
        
        const newNotification: UserNotification = {
            id: Date.now(),
            isRead: false,
            createdAt: new Date().toISOString(),
            type: data.type,
            message: t(data.message, data.replacements),
            link: data.link,
        };
        
        const updated = [newNotification, ...userNotifications];
        const limited = updated.slice(0, 50);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(limited));

    }, [t]);

    const markAllAsRead = useCallback((userId: number) => {
        const userNotifications = getInitialNotifications(userId);
        const updated = userNotifications.map(n => ({ ...n, isRead: true }));
        saveNotifications(userId, updated);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const value = { notifications, unreadCount, addNotification, markAllAsRead, fetchNotifications };

    return (
        <UserNotificationContext.Provider value={value}>
            {children}
        </UserNotificationContext.Provider>
    );
};

export const useUserNotification = () => {
    const context = useContext(UserNotificationContext);
    if (context === undefined) {
        throw new Error('useUserNotification must be used within a UserNotificationProvider');
    }
    return context;
};