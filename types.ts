
export type SellingMode = 'secure' | 'direct';
export type ProductCondition = 'new' | 'used_like_new' | 'used_good' | 'used_acceptable';

export interface Question {
    id: number;
    text: string;
    answer?: string;
    askerName: string;
    askerId: number;
    createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  longDescription: string;
  category: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  reviews: Review[];
  sellerId: number;
  sellerName: string;
  isFeatured?: boolean;
  sellingMode: SellingMode;
  condition: ProductCondition;
  questions: Question[];
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  title: string;
  text: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface OrderItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Pending' | 'AwaitingShipment' | 'PaymentHeld' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  userId: number;
  date: string;
  items: OrderItem[];
  total: number;
  shippingAddress: Address;
  status: OrderStatus;
  sellingMode: SellingMode;
  buyerRating: { rated: boolean };
}

export interface BankInfo {
  accountHolder: string;
  iban: string;
  swift: string;
  internalCode?: string;
}

export interface SellerRating {
    rating: number; // 1-5
    comment: string;
    buyerName: string;
    buyerId: number;
    createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
  bankInfo?: BankInfo;
  sellerRatings?: SellerRating[];
}

export interface Category {
  id: number;
  name: string;
  order: number;
  iconUrl?: string;
}

export interface SystemSettings {
    siteTitle: string;
    maintenanceMode: boolean;
    commissionRate: number; // Percentage
    directListingFee: number; // Fixed amount, future use
    logoUrl?: string;
    defaultLanguage?: 'en' | 'fr' | 'fa' | 'nl';
    contactInfo?: {
        supportEmail?: string;
        phone?: string;
        address?: string;
    };
    links?: {
        termsUrl?: string;
        privacyUrl?: string;
    };
}

export interface DiscountCode {
    id: number;
    code: string;
    percentage: number;
    startDate: string;
    expiryDate: string;
    isActive: boolean;
}

export interface Banner {
    id: number;
    imageUrl: string;
    linkUrl: string;
}

export interface StaticPage {
    id: number;
    slug: string;
    title: string;
    content: string;
    createdAt: string;
}

export type SupportTicketStatus = 'New' | 'Read' | 'Archived';

export interface TicketReply {
    id: number;
    author: string;
    text: string;
    createdAt: string;
}

export interface SupportTicket {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: SupportTicketStatus;
    createdAt: string;
    replies: TicketReply[];
}

export type NotificationType = 'new_order' | 'new_user';
export interface AdminNotification {
    id: number;
    type: NotificationType;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}

export interface Message {
    id: number;
    senderId: number;
    senderName: string;
    text: string;
    createdAt: string;
}

export interface Conversation {
    id: string; // Composite key: `productId-buyerId`
    productId: number;
    productName: string;
    productImageUrl: string;
    sellerId: number;
    sellerName: string;
    buyerId: number;
    buyerName: string;
    messages: Message[];
    lastUpdatedAt: string;
}

export type UserNotificationType = 'new_message' | 'order_update' | 'new_question_answer';
export interface UserNotification {
    id: number;
    type: UserNotificationType;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}