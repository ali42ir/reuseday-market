import React from 'react';
import { LanguageProvider } from './LanguageContext.tsx';
import { ToastProvider } from './ToastContext.tsx';
import { AuthProvider } from './AuthContext.tsx';
import { WishlistProvider } from './WishlistContext.tsx';
import { OrderProvider } from './OrderContext.tsx';
import { CartProvider } from './CartContext.tsx';
import { CategoryProvider } from './CategoryContext.tsx';
import { SystemSettingsProvider } from './SystemSettingsContext.tsx';
import { MarketingProvider } from './MarketingContext.tsx';
import { NotificationProvider } from './NotificationContext.tsx';
import { ContentProvider } from './ContentContext.tsx';
import { SupportProvider } from './SupportContext.tsx';
import { ConversationProvider } from './ConversationContext.tsx';
import { ProductProvider } from './ProductContext.tsx';
import { UserNotificationProvider } from './UserNotificationContext.tsx';
import { ComplaintProvider } from './ComplaintContext.tsx';
import { KindWallProvider } from './KindWallContext.tsx';

// An array of all providers. Order matters.
const providers = [
  ToastProvider,
  SystemSettingsProvider,
  LanguageProvider,
  NotificationProvider,
  UserNotificationProvider,
  AuthProvider,
  ProductProvider,
  CategoryProvider,
  MarketingProvider,
  ContentProvider,
  SupportProvider,
  ConversationProvider,
  KindWallProvider,
  WishlistProvider,
  OrderProvider,
  ComplaintProvider,
  CartProvider,
];

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Reduce the providers array into a nested component structure.
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, <>{children}</>);
};