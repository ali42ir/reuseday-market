import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Order, CartItem, Address, OrderStatus, SellingMode, DeliveryOption } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { useNotifications } from './NotificationContext.tsx';
import { useUserNotification } from './UserNotificationContext.tsx';

interface OrderContextType {
  orders: Order[];
  getOrderById: (orderId: string) => Order | undefined;
  placeOrder: (cartItems: CartItem[], itemsTotal: number, shippingAddress: Address, deliveryMethod: DeliveryOption, shippingCost: number) => Promise<Order | null>;
  markAsShipped: (orderId: string) => void;
  confirmReceipt: (orderId: string) => void;
  getAllOrdersForAdmin: () => Order[];
  addRatingToOrder: (orderId: string) => void;
  markItemAsReviewed: (orderId: string, productId: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();
  const { addNotification: addAdminNotification } = useNotifications();
  const { addNotification: addUserNotification } = useUserNotification();
  
  // Seed a completed transaction for demonstration purposes
  useEffect(() => {
    const seeded = localStorage.getItem('orders_seeded_v4');
    if (!seeded) {
        const mockOrder: Order = {
            id: (Date.now() - 259200000).toString(), // 3 days ago
            userId: 2, // John Doe
            date: new Date(Date.now() - 259200000).toISOString(),
            items: [
                {
                    id: 1, name: 'Modern Wireless Headphones', price: 199.99, description: 'High-fidelity sound with noise cancellation.',
                    longDescription: 'Experience immersive sound with these state-of-the-art wireless headphones. Featuring active noise cancellation, a 20-hour battery life, and a comfortable, lightweight design for all-day wear. Connects seamlessly via Bluetooth 5.0.',
                    categoryId: 'electronics-computers', rating: 4.5, reviewCount: 1250, imageUrl: 'https://picsum.photos/seed/product1/400/400',
                    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', quantity: 1, condition: 'used_like_new', questions: [],
                    deliveryOptions: ['shipping', 'free_shipping'], shippingCost: 5.99
                }
            ],
            total: 199.99,
            shippingAddress: { fullName: 'John Doe', street: '123 Test St', city: 'Testville', zipCode: '12345', country: 'Testland' },
            status: 'Completed',
            sellingMode: 'secure',
            buyerRating: { rated: true }, // Already rated for demo
            deliveryMethod: 'free_shipping',
            shippingCost: 0,
            reviewedItems: {},
        };
        localStorage.setItem('orders_2', JSON.stringify([mockOrder]));
        localStorage.setItem('orders_seeded_v4', 'true');
    }
  }, []);

  const getOrdersFromStorage = useCallback((userId: number): Order[] => {
      try {
        const storedOrders = localStorage.getItem(`orders_${userId}`);
        return storedOrders ? JSON.parse(storedOrders) : [];
      } catch (e) {
        console.error("Failed to parse orders from localStorage", e);
        return [];
      }
  }, []);

  useEffect(() => {
    if (user) {
      setOrders(getOrdersFromStorage(user.id));
    } else {
      setOrders([]);
    }
  }, [user, getOrdersFromStorage]);

  const saveOrdersForUser = (userId: number, userOrders: Order[]) => {
      localStorage.setItem(`orders_${userId}`, JSON.stringify(userOrders));
  };
  
  const updateOrderStatusAndSave = (orderId: string, updates: Partial<Order>): boolean => {
    let orderFoundAndUpdated = false;
    let buyerId: number | null = null;
    let sellerId: number | null = null;
    
    // Find the order in the current user's context first
    let orderToUpdate = orders.find(o => o.id === orderId);
    if (orderToUpdate && user) {
        const updatedOrder = { ...orderToUpdate, ...updates };
        const updatedOrders = orders.map(o => o.id === orderId ? updatedOrder : o);
        setOrders(updatedOrders);
        saveOrdersForUser(user.id, updatedOrders);
        orderFoundAndUpdated = true;
        buyerId = updatedOrder.userId;
        sellerId = updatedOrder.items[0]?.sellerId;
    }

    // Now, update the other participant's order list in localStorage
    const allUsers: {id: number}[] = JSON.parse(localStorage.getItem('users') || '[]');
    for (const u of allUsers) {
        if (u.id === user?.id) continue; // Skip current user, already handled
        
        const userOrders = getOrdersFromStorage(u.id);
        const orderIndex = userOrders.findIndex(o => o.id === orderId);

        if (orderIndex !== -1) {
            userOrders[orderIndex] = { ...userOrders[orderIndex], ...updates };
            saveOrdersForUser(u.id, userOrders);
            orderFoundAndUpdated = true;
            if (!buyerId) buyerId = userOrders[orderIndex].userId;
            if (!sellerId) sellerId = userOrders[orderIndex].items[0]?.sellerId;
            break; // Assume order is unique between two participants
        }
    }
    
    // Send notifications
    if (orderFoundAndUpdated && updates.status && buyerId && sellerId) {
        const notificationMessage = `notification_order_update`;
        const link = `/profile/orders`;
        // Notify buyer
        if (user?.id !== buyerId) {
            addUserNotification(buyerId, { type: 'order_update', message: notificationMessage, replacements: { orderId: orderId.slice(-6), status: updates.status }, link });
        }
        // Notify seller
        if (user?.id !== sellerId) {
            addUserNotification(sellerId, { type: 'order_update', message: notificationMessage, replacements: { orderId: orderId.slice(-6), status: updates.status }, link });
        }
    }

    return orderFoundAndUpdated;
};


  const placeOrder = async (cartItems: CartItem[], _itemsTotal: number, shippingAddress: Address, deliveryMethod: DeliveryOption, _shippingCost: number): Promise<Order | null> => {
    if (!user || cartItems.length === 0) return null;

    // Group items by sellerId to handle multiple sellers in one cart
    const itemsBySeller = cartItems.reduce((acc, item) => {
        (acc[item.sellerId] = acc[item.sellerId] || []).push(item);
        return acc;
    }, {} as { [key: number]: CartItem[] });

    const createdOrders: Order[] = [];
    const buyerOrders = [...orders];

    for (const sellerIdStr in itemsBySeller) {
        const sellerId = parseInt(sellerIdStr, 10);
        const sellerItems = itemsBySeller[sellerId];
        
        if(sellerId === user.id) continue; // User can't buy their own items.

        const sellingMode: SellingMode = sellerItems[0].sellingMode;
        
        // Calculate subtotal and shipping for this specific seller's items
        const subtotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        let orderShippingCost = 0;
        if (deliveryMethod === 'shipping') {
            orderShippingCost = sellerItems.reduce((total, item) => {
                 if (item.deliveryOptions.includes('free_shipping')) return total;
                 return total + (item.shippingCost || 0) * item.quantity;
            }, 0);
        }
        
        const total = subtotal + orderShippingCost;
        const orderId = `${Date.now()}-${sellerId}`;
        
        const buyerStatus: OrderStatus = 'AwaitingShipment';

        const newOrder: Order = {
            id: orderId,
            userId: user.id,
            date: new Date().toISOString(),
            items: sellerItems,
            total,
            shippingAddress,
            status: buyerStatus,
            sellingMode,
            buyerRating: { rated: false },
            deliveryMethod,
            shippingCost: orderShippingCost,
            reviewedItems: {},
        };

        // 1. Save order for buyer
        buyerOrders.push(newOrder);
        createdOrders.push(newOrder);

        // 2. Save order for seller
        const sellerStatus: OrderStatus = sellingMode === 'secure' ? 'PaymentHeld' : 'AwaitingShipment';
        const sellerOrders = getOrdersFromStorage(sellerId);
        const sellerOrderVersion = { ...newOrder, status: sellerStatus };
        saveOrdersForUser(sellerId, [...sellerOrders, sellerOrderVersion]);

        // 3. Admin Notification
        addAdminNotification({
            type: 'new_order',
            message: `New order #${orderId.slice(-6)} for seller ${sellerId} placed for €${total.toFixed(2)}`,
            link: `/admin?tab=orders&highlight=${orderId}`
        });
        
        // 4. Seller Notification
        const notificationMessageKey = sellerItems.length > 1 ? 'notification_new_sale_multi' : 'notification_new_sale';
        addUserNotification(sellerId, {
            type: 'new_sale',
            message: notificationMessageKey,
            replacements: {
                orderId: orderId.slice(-6),
                productName: sellerItems[0].name,
                count: sellerItems.length
            },
            link: '/profile/orders'
        });
    }

    if (createdOrders.length > 0) {
        setOrders(buyerOrders);
        saveOrdersForUser(user.id, buyerOrders);
        return createdOrders[0]; // Return the first created order for redirection
    }

    return null;
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  }

  const markAsShipped = (orderId: string) => {
     updateOrderStatusAndSave(orderId, { status: 'Shipped' });
  };
  
  const confirmReceipt = (orderId: string) => {
     updateOrderStatusAndSave(orderId, { status: 'Completed' });
  };
  
  const addRatingToOrder = (orderId: string) => {
      updateOrderStatusAndSave(orderId, { buyerRating: { rated: true } });
  };

  const markItemAsReviewed = (orderId: string, productId: number) => {
    if (!user) return;
    const userOrders = getOrdersFromStorage(user.id);
    const orderIndex = userOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        const order = userOrders[orderIndex];
        const updatedOrder = {
            ...order,
            reviewedItems: {
                ...order.reviewedItems,
                [productId]: true,
            },
        };
        userOrders[orderIndex] = updatedOrder;
        saveOrdersForUser(user.id, userOrders);
        setOrders(userOrders); // update current user's state
    }
  };

  const getAllOrdersForAdmin = useCallback((): Order[] => {
      try {
          const usersRaw = localStorage.getItem('users');
          if (!usersRaw) return [];
          const allUsers: {id: number}[] = JSON.parse(usersRaw);
          
          let allUserOrders: Order[] = [];
          allUsers.forEach(u => {
              const userOrders = getOrdersFromStorage(u.id);
              allUserOrders = [...allUserOrders, ...userOrders];
          });
          
          const uniqueOrders = Array.from(new Map(allUserOrders.map(o => [o.id, o])).values());
          return uniqueOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      } catch (e) {
          console.error("Failed to load all orders for admin", e);
          return [];
      }
  }, [getOrdersFromStorage]);

  return (
    <OrderContext.Provider value={{ orders, placeOrder, getOrderById, markAsShipped, confirmReceipt, getAllOrdersForAdmin, addRatingToOrder, markItemAsReviewed }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
