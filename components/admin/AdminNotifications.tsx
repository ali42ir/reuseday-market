
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Link } from 'react-router-dom';

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const UserIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const OrderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H4.72l-.21-1.054A1 1 0 003 1z" />
        <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
);


const AdminNotifications: React.FC = () => {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-500 hover:text-gray-800 focus:outline-none">
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -end-2 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute end-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                    <div className="p-3 flex justify-between items-center border-b">
                        <h4 className="font-bold text-gray-800">{t('admin_notifications_title')}</h4>
                        {notifications.length > 0 && (
                            <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:underline">{t('admin_notifications_mark_all_read')}</button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-center text-gray-500 py-6">{t('admin_notifications_empty')}</p>
                        ) : (
                            notifications.map(n => {
                                const content = (
                                    <div className={`p-3 flex items-start space-x-3 hover:bg-gray-50 ${!n.isRead && 'bg-blue-50'}`}>
                                        <div className="flex-shrink-0 mt-1">
                                            {n.type === 'new_order' ? <OrderIcon /> : <UserIcon />}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-700">{n.message}</p>
                                            <p className="text-xs text-gray-400">{timeSince(n.createdAt)}</p>
                                        </div>
                                        {!n.isRead && <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 ms-auto"></div>}
                                    </div>
                                );
                                return n.link ? (
                                    <Link to={n.link} key={n.id} onClick={() => setIsOpen(false)}>{content}</Link>
                                ) : (
                                    <div key={n.id}>{content}</div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;