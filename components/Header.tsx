
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useSystemSettings } from '../context/SystemSettingsContext.tsx';
import { useUserNotification } from '../context/UserNotificationContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import VisualSearchModal from './VisualSearchModal.tsx';

const UserNotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { notifications, unreadCount, markAllAsRead } = useUserNotification();
    const { user } = useAuth();
    const { t } = useLanguage();

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
    };

    const handleMarkAllRead = () => {
        if (user) {
            markAllAsRead(user.id);
        }
    };

    return (
        <div className="absolute end-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
            <div className="p-3 flex justify-between items-center border-b">
                <h4 className="font-bold text-gray-800">{t('user_notifications_title')}</h4>
                {notifications.length > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm text-blue-600 hover:underline">{t('user_notifications_mark_all_read')}</button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">{t('user_notifications_empty')}</p>
                ) : (
                    notifications.map(n => (
                        <Link to={n.link || '#'} key={n.id} onClick={onClose} className={`block p-3 hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                             <div className="flex items-start space-x-3">
                                <div>
                                    <p className="text-sm text-gray-700">{n.message}</p>
                                    <p className="text-xs text-gray-400">{timeSince(n.createdAt)}</p>
                                </div>
                                {!n.isRead && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 ms-auto flex-shrink-0"></div>}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};


const Header: React.FC = () => {
  const { cartCount } = useCart();
  const { isAuthenticated, user, logout, isSuperAdmin, isSeller } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { systemSettings } = useSystemSettings();
  const { unreadCount, fetchNotifications } = useUserNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user, fetchNotifications]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileSearchOpen(false);
    }
  };

  const handleVisualSearchClick = () => {
    setIsVisualSearchOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fa', name: 'فارسی' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' },
    { code: 'nl', name: 'Nederlands' },
  ] as const;

  const langButtonText = useMemo(() => {
    return language.toUpperCase();
  }, [language]);

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  return (
    <>
      {isVisualSearchOpen && <VisualSearchModal onClose={() => setIsVisualSearchOpen(false)} />}
      <header className="bg-amazon-blue text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-white flex-shrink-0 group">
            {systemSettings.logoUrl ? (
              <img src={systemSettings.logoUrl} alt="Site Logo" className="h-9" loading="lazy" />
            ) : (
              <svg
                className="h-8 w-8 text-green-500 group-hover:text-amazon-yellow transition-colors duration-200"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
            )}
            <span className="hidden sm:inline-block text-xl sm:text-2xl font-bold group-hover:text-amazon-yellow transition-colors duration-200">{systemSettings.siteTitle.split(' ')[0]}</span>
          </Link>

          {/* Desktop Search */}
          <div className="flex-1 mx-4 max-w-lg hidden md:block">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-s-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amazon-yellow"
                placeholder={t('header_search_placeholder')}
              />
              <button
                type="button"
                onClick={handleVisualSearchClick}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 flex items-center justify-center transition-colors"
                aria-label={t('visual_search_title')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-.707-.707A2 2 0 0012.414 4H7.586a2 2 0 00-1.293.293L5.586 5H4zm6 8a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="submit"
                className="bg-amazon-yellow hover:bg-amazon-yellow-light text-amazon-blue font-bold px-4 rounded-e-md flex items-center justify-center transition-colors"
                aria-label={t('search')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Toggle */}
            <button onClick={() => setIsMobileSearchOpen(true)} className="p-2 md:hidden" aria-label={t('search')}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
            
            <Link to="/" className="p-2 hover:text-amazon-yellow transition-colors">{t('header_home')}</Link>

            {/* Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <button onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center space-x-1 p-2">
                <span>{langButtonText}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isLangDropdownOpen && (
                <div className="absolute end-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 text-black">
                  {languages.map(l => (
                    <a key={l.code} href="#" onClick={(e) => { e.preventDefault(); setLanguage(l.code); setIsLangDropdownOpen(false); }} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                      <span className="font-semibold w-8">{l.code.toUpperCase()}</span>
                      <span>{l.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            {/* KindWall Button */}
            <Link to="/kindwall" className="group flex items-center space-x-2 p-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors animate-pulse-slow" aria-label={t('kindwall_title')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 transition-colors group-hover:text-amazon-yellow">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span className="hidden sm:inline font-bold text-sm">{t('kindwall_title')}</span>
            </Link>


            {/* User Account & Notifications */}
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="p-2 relative" aria-label={t('user_notifications_title')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 end-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </button>
                  {isNotificationOpen && <UserNotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
                </div>
                
                {/* User Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center p-2">
                    <span className="hidden sm:inline">{t('header_hello', { name: user!.name.split(' ')[0] })}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ms-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute end-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 text-black">
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">{t('header_profile')}</Link>
                        <Link to="/wishlist" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">{t('header_wishlist')}</Link>
                        {(isSuperAdmin || isSeller) && <Link to="/sell" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">{t('footer_sell_products')}</Link>}
                        {isSuperAdmin && <Link to="/admin" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">{t('admin_dashboard')}</Link>}
                        <button onClick={handleLogout} className="w-full text-start block px-4 py-2 text-sm hover:bg-gray-100">{t('header_sign_out')}</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="p-2 hover:text-amazon-yellow transition-colors">{t('header_sign_in')}</Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2" aria-label={t('header_cart')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 end-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{cartCount}</span>
              )}
            </Link>
          </nav>
        </div>

        {/* Mobile Search Form */}
        {isMobileSearchOpen && (
          <div className="md:hidden absolute top-0 left-0 w-full h-16 bg-amazon-blue z-[51] p-2">
            <form onSubmit={handleSearch} className="flex h-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-s-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amazon-yellow"
                placeholder={t('header_search_placeholder')}
                autoFocus
              />
              <button
                type="submit"
                className="bg-amazon-yellow hover:bg-amazon-yellow-light text-amazon-blue font-bold px-4 rounded-e-md flex items-center justify-center"
                aria-label={t('search')}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button type="button" onClick={() => setIsMobileSearchOpen(false)} className="ms-2 text-white p-2" aria-label={t('close')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;