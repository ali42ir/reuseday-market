import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import { useSystemSettings } from './context/SystemSettingsContext.tsx';

import Header from './components/Header.tsx';
import CategoryNavBar from './components/CategoryNavBar.tsx';
import Footer from './components/Footer.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.tsx';
import SellerProtectedRoute from './components/SellerProtectedRoute.tsx';
import MasqueradeBanner from './components/MasqueradeBanner.tsx';

import HomePage from './pages/HomePage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CartPage from './pages/CartPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import SearchResultsPage from './pages/SearchResultsPage.tsx';
import WishlistPage from './pages/WishlistPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.tsx';
import SellerPage from './pages/SellerPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import MaintenancePage from './pages/MaintenancePage.tsx';
import StaticPage from './pages/StaticPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import AdvertisePage from './pages/AdvertisePage.tsx';
import KindWallPage from './pages/KindWallPage.tsx';
import { useLanguage } from './context/LanguageContext.tsx';
import Chatbot from './components/Chatbot.tsx';


const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const { systemSettings } = useSystemSettings();
  const { isSuperAdmin, masqueradeAdminId } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    document.title = systemSettings.siteTitle || t('app_default_title');
  }, [systemSettings.siteTitle, t]);

  if (systemSettings.maintenanceMode && !isSuperAdmin && !masqueradeAdminId) {
    return <MaintenancePage />;
  }

  return (
    <div className={`flex flex-col min-h-screen overflow-x-hidden ${masqueradeAdminId ? 'pt-10' : ''}`}>
      <MasqueradeBanner />
      <Header />
      <CategoryNavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pages/:slug" element={<StaticPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/kindwall" element={<KindWallPage />} />
          
          <Route path="/advertise" element={<ProtectedRoute><AdvertisePage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:tab" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
          <Route path="/sell" element={<SellerProtectedRoute><SellerPage /></SellerProtectedRoute>} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

const App: React.FC = () => {
  useEffect(() => {
    // Enforce HTTPS on non-localhost environments
    if (window.location.hostname !== 'localhost' && window.location.protocol === 'http:') {
      window.location.href = window.location.href.replace('http:', 'https');
    }
  }, []);

  return (
    <>
      <ScrollToTop />
      <AppContent />
    </>
  );
};

export default App;