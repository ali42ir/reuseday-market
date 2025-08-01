import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { OrderProvider } from './context/OrderContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { CategoryProvider } from './context/CategoryContext.tsx';
import { SystemSettingsProvider } from './context/SystemSettingsContext.tsx';
import { MarketingProvider } from './context/MarketingContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { ContentProvider } from './context/ContentContext.tsx';
import { SupportProvider } from './context/SupportContext.tsx';
import { ConversationProvider } from './context/ConversationContext.tsx';
import { ProductProvider } from './context/ProductContext.tsx';
import { UserNotificationProvider } from './context/UserNotificationContext.tsx';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <SystemSettingsProvider>
          <LanguageProvider>
            <NotificationProvider>
              <UserNotificationProvider>
                <AuthProvider>
                  <ProductProvider>
                    <CategoryProvider>
                      <MarketingProvider>
                        <ContentProvider>
                          <SupportProvider>
                            <ConversationProvider>
                                <WishlistProvider>
                                  <OrderProvider>
                                    <CartProvider>
                                      <App />
                                    </CartProvider>
                                  </OrderProvider>
                                </WishlistProvider>
                            </ConversationProvider>
                          </SupportProvider>
                        </ContentProvider>
                      </MarketingProvider>
                    </CategoryProvider>
                  </ProductProvider>
                </AuthProvider>
              </UserNotificationProvider>
            </NotificationProvider>
          </LanguageProvider>
        </SystemSettingsProvider>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>
);