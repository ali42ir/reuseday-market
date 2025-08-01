import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useSystemSettings } from '../context/SystemSettingsContext.tsx';
import { useUserNotification } from '../context/UserNotificationContext.tsx';
import { Link, useNavigate } from 'react-router-dom';

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
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
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
                                {!n.isRead && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 ml-auto flex-shrink-0"></div>}
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
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { systemSettings } = useSystemSettings();
  const { unreadCount, fetchNotifications } = useUserNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
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
    { code: 'fr', name: 'Français' },
    { code: 'nl', name: 'Nederlands' },
  ] as const;
  
  const selectedLanguageName = languages.find(l => l.code === language)?.name || 'English';

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  return (
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
            >
              <path d="M16 18L21 13L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 13H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6L3 11L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 11H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="text-2xl font-bold group-hover:text-amazon-yellow transition-colors duration-200 hidden sm:inline">{systemSettings.siteTitle.split(' ')[0]}</span>
        </Link>

        {/* Desktop Search */}
        <div className="flex-1 mx-4 max-w-lg hidden md:block">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-l-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amazon-yellow"
              placeholder={t('header_search_placeholder')}
            />
            <button
              type="submit"
              className="bg-amazon-yellow hover:bg-amazon-yellow-light text-amazon-blue font-bold px-4 rounded-r-md flex items-center justify-center transition-colors"
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
          
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <Link to="/" className="px-2 py-1 hover:text-amazon-yellow transition-colors">{t('header_home')}</Link>
            <Link to="/sell" className="px-2 py-1 hover:text-amazon-yellow transition-colors">{t('footer_sell_products')}</Link>
            
            <div className="relative" ref={langDropdownRef}>
              <button onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center px-2 py-1 hover:text-amazon-yellow transition-colors">
                 <span>{language.toUpperCase()}</span>
              </button>
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  {languages.map(lang => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsLangDropdownOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-amazon-yellow-light text-amazon-blue font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
               <div className="flex items-center space-x-4">
                  <div className="relative" ref={notificationRef}>
                      <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2 hover:text-amazon-yellow transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                            </span>
                          )}
                      </button>
                       {isNotificationOpen && <UserNotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
                  </div>
                  <div className="relative" ref={userDropdownRef}>
                      <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center px-2 py-1 hover:text-amazon-yellow transition-colors">
                          <span>{t('header_hello', { name: user?.name?.split(' ')[0] })}</span>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                      {isUserDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                              {isAdmin && (
                                  <Link to="/admin" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm font-bold text-amazon-blue bg-amazon-yellow-light hover:bg-amazon-yellow">
                                      {t('admin_dashboard')}
                                  </Link>
                              )}
                              <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('header_profile')}</Link>
                              <Link to="/wishlist" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('header_wishlist')}</Link>
                              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('header_sign_out')}</button>
                          </div>
                      )}
                 </div>
               </div>
            ) : (
                <Link to="/login" className="px-2 py-1 hover:text-amazon-yellow transition-colors">{t('header_sign_in')}</Link>
            )}
          </div>

          <Link to="/cart" className="relative flex items-center hover:text-amazon-yellow transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-amazon-yellow text-amazon-blue text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="ml-2 hidden lg:inline">{t('header_cart')}</span>
          </Link>
        </nav>
      </div>
      {/* Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div className="absolute top-0 left-0 w-full h-16 bg-amazon-blue z-50 p-2 flex items-center animate-slide-down">
           <style>{`
              @keyframes slide-down {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
              }
              .animate-slide-down { animation: slide-down 0.3s ease-out; }
            `}</style>
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-l-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amazon-yellow"
              placeholder={t('header_search_placeholder')}
              autoFocus
            />
             <button
              type="submit"
              className="bg-amazon-yellow hover:bg-amazon-yellow-light text-amazon-blue font-bold px-4 rounded-r-md flex items-center justify-center transition-colors"
              aria-label={t('search')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
           <button onClick={() => setIsMobileSearchOpen(false)} className="ml-2 p-2" aria-label="Close search">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;