import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Order, CartItem, Address, OrderStatus, SellingMode } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { useNotifications } from './NotificationContext.tsx';
import { useUserNotification } from './UserNotificationContext.tsx';

interface OrderContextType {
  orders: Order[];
  getOrderById: (orderId: string) => Order | undefined;
  placeOrder: (cartItems: CartItem[], total: number, shippingAddress: Address) => Promise<Order | null>;
  markAsShipped: (orderId: string) => void;
  confirmReceipt: (orderId: string) => void;
  getAllOrdersForAdmin: () => Order[];
  addRatingToOrder: (orderId: string) => void;
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
                    category: 'Electronics', rating: 4.5, reviewCount: 1250, imageUrl: 'https://picsum.photos/seed/product1/400/400',
                    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', quantity: 1, condition: 'used_like_new', questions: []
                }
            ],
            total: 199.99,
            shippingAddress: { fullName: 'John Doe', street: '123 Test St', city: 'Testville', zipCode: '12345', country: 'Testland' },
            status: 'Completed',
            sellingMode: 'secure',
            buyerRating: { rated: true }, // Already rated for demo
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


  const placeOrder = async (cartItems: CartItem[], total: number, shippingAddress: Address): Promise<Order | null> => {
    if (!user || cartItems.length === 0) return null;
    
    const sellingMode: SellingMode = cartItems[0].sellingMode;
    const initialStatus: OrderStatus = sellingMode === 'secure' ? 'AwaitingShipment' : 'Completed';

    const orderId = Date.now().toString();
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      date: new Date().toISOString(),
      items: cartItems,
      total,
      shippingAddress,
      status: initialStatus,
      sellingMode: sellingMode,
      buyerRating: { rated: false }
    };

    saveOrdersForUser(user.id, [...orders, newOrder]);
    setOrders(prev => [...prev, newOrder]);
    
    addAdminNotification({
        type: 'new_order',
        message: `New order #${orderId.slice(-6)} placed for €${total.toFixed(2)}`,
        link: `/admin?tab=orders&highlight=${orderId}`
    });
    
    if (sellingMode === 'secure') {
      const sellerId = cartItems[0].sellerId;
      if (sellerId !== user.id) {
        const sellerOrders = getOrdersFromStorage(sellerId);
        const sellerOrderVersion = { ...newOrder, status: 'PaymentHeld' as OrderStatus };
        saveOrdersForUser(sellerId, [...sellerOrders, sellerOrderVersion]);
      }
    }
    return newOrder;
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

  const getAllOrdersForAdmin = (): Order[] => {
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
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, getOrderById, markAsShipped, confirmReceipt, getAllOrdersForAdmin, addRatingToOrder }}>
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