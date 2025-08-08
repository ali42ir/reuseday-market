import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { AdminNotification, NotificationType } from '../types.ts';

interface NotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  addNotification: (data: Omit<AdminNotification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'reuseday_admin_notifications';

const getInitialNotifications = (): AdminNotification[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse notifications from localStorage", e);
    }
    return [];
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AdminNotification[]>(getInitialNotifications);

    const saveNotifications = (updatedNotifications: AdminNotification[]) => {
        // Keep only the latest 50 notifications
        const sorted = updatedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const limited = sorted.slice(0, 50);
        setNotifications(limited);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    };

    const addNotification = useCallback((data: Omit<AdminNotification, 'id' | 'isRead' | 'createdAt'>) => {
        const newNotification: AdminNotification = {
            id: Date.now(),
            isRead: false,
            createdAt: new Date().toISOString(),
            ...data,
        };
        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            const limited = updated.slice(0, 50);
             localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
             return limited;
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        saveNotifications(updated);
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const value = { notifications, unreadCount, addNotification, markAllAsRead };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};