import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import { useSystemSettings } from './context/SystemSettingsContext.tsx';

import Header from './components/Header.tsx';
import CategoryNavBar from './components/CategoryNavBar.tsx';
import Footer from './components/Footer.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.tsx';

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


const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const { systemSettings } = useSystemSettings();
  const { isAdmin } = useAuth();

  useEffect(() => {
    document.title = systemSettings.siteTitle || 'Reuseday - Your Online Marketplace';
  }, [systemSettings.siteTitle]);

  if (systemSettings.maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex flex-col min-h-screen">
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
          
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:tab" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
          <Route path="/sell" element={<ProtectedRoute><SellerPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

const App: React.FC = () => {
  useEffect(() => {
    // Enforce HTTPS on non-localhost environments
    if (window.location.hostname !== 'localhost' && window.location.protocol === 'http:') {
      window.location.href = window.location.href.replace('http:', 'https:');
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