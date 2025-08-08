

export type DeliveryOption = 'shipping' | 'free_shipping' | 'local_pickup';
export type SellingMode = 'secure' | 'direct';
export type ProductCondition = 'new' | 'used_like_new' | 'used_good' | 'used_acceptable';
export type TwoFactorMethod = 'none' | 'sms' | 'email';

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
  categoryId: string; // Subcategory ID
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
  deliveryOptions: DeliveryOption[];
  shippingCost?: number;
}

export interface Review {
  id: number;
  userId: number;
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
  phone?: string;
  address?: Address;
  isSeller?: boolean;
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

export type OrderStatus = 'Pending' | 'AwaitingPayment' | 'AwaitingShipment' | 'PaymentHeld' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'card' | 'paypal' | 'google_pay' | 'direct_arrangement';


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
  deliveryMethod: DeliveryOption;
  shippingCost: number;
  reviewedItems?: { [productId: number]: boolean };
  paymentMethod?: PaymentMethod;
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
  vatNumber?: string;
  isVerified?: boolean;
  isSeller?: boolean;
  twoFactorMethod?: TwoFactorMethod;
}

export interface SubCategory {
  id: string; 
  nameKey: string;
}

export interface Category {
  id: string;
  nameKey: string;
  subcategories: SubCategory[];
}


export interface FooterLinkLabels {
    get_to_know_us: string;
    about: string;
    contact_us: string;
    make_money: string;
    sell_products: string;
    affiliate: string;
    advertise: string;
    let_us_help: string;
    your_account: string;
    your_orders: string;
    shipping: string;
    help: string;
    payment_products: string;
    business_card: string;
    shop_with_points: string;
    terms: string;
    privacy: string;
}

export interface SystemSettings {
    siteTitle: string;
    maintenanceMode: boolean;
    commissionRate: number; // Percentage
    directListingFee: number; // Fixed amount, future use
    logoUrl?: string;
    defaultLanguage?: 'en' | 'fr' | 'fa' | 'nl' | 'ar';
    contactInfo?: {
        supportEmail?: string;
        phone?: string;
        address?: string;
    };
    links?: {
        termsUrl?: string;
        privacyUrl?: string;
    };
    dailyAdRate?: number;
    weeklyAdRate?: number;
    footerLinkLabels?: Partial<FooterLinkLabels>;
    enablePaidListings?: boolean;
    freeListingThreshold?: number;
    listingFee?: number;
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

export type UserNotificationType = 'new_message' | 'order_update' | 'new_question_answer' | 'ad_status_update' | 'new_sale';
export interface UserNotification {
    id: number;
    type: UserNotificationType;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}

export type AdStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type AdPackage = 'daily' | 'weekly';

export interface Advertisement {
    id: number;
    uploaderId: number;
    uploaderName: string;
    companyName: string;
    imageUrl: string;
    linkUrl: string;
    status: AdStatus;
    adPackage: AdPackage;
    submittedAt: string;
    expiresAt?: string;
}

export type ComplaintStatus = 'Open' | 'UnderReview' | 'Resolved' | 'Closed';

export interface ComplaintReply {
    id: number;
    authorId: number;
    authorName: string;
    text: string;
    createdAt: string;
}

export interface Complaint {
    id: number;
    orderId: string;
    userId: number;
    userName: string;
    sellerId: number;
    subject: string;
    description: string;
    status: ComplaintStatus;
    createdAt: string;
    imageUrl?: string;
    replies: ComplaintReply[];
}

// KindWall Feature Types
export type KindWallPostType = 'giving' | 'requesting';
export type KindWallPostStatus = 'pending' | 'approved' | 'rejected';

export interface KindWallPost {
  id: number;
  type: KindWallPostType;
  title: string;
  description: string;
  imageUrl?: string; // base64
  location: string;
  contactInfo?: string;
  status: KindWallPostStatus;
  userId: number;
  userName: string;
  createdAt: string; // ISO string
  language: 'en' | 'fr' | 'fa' | 'nl' | 'ar';
}