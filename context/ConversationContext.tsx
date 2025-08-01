import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Conversation, Message, Product, User } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { useUserNotification } from './UserNotificationContext.tsx';

interface ConversationContextType {
  conversations: Conversation[];
  getConversationById: (id: string) => Conversation | undefined;
  sendMessage: (conversationId: string, text: string) => void;
  startConversation: (product: Product) => string;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'reuseday_conversations_';

// Basic filter for sensitive information
const filterSensitiveInfo = (text: string): string => {
    // Regex for email
    text = text.replace(/[\w.-]+@[\w.-]+\.\w{2,}/gi, '[email hidden]');
    // Regex for phone numbers (very basic)
    text = text.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[phone hidden]');
    // Regex for URLs
    text = text.replace(/(https?:\/\/[^\s]+)/g, '[link hidden]');
    return text;
};

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const { user } = useAuth();
    const { addNotification } = useUserNotification();
    
    const storageKey = user ? `${STORAGE_KEY_PREFIX}${user.id}` : null;

    useEffect(() => {
        if (storageKey) {
            try {
                const stored = localStorage.getItem(storageKey);
                setConversations(stored ? JSON.parse(stored) : []);
            } catch (e) {
                console.error("Failed to parse conversations from localStorage", e);
                setConversations([]);
            }
        } else {
            setConversations([]);
        }
    }, [storageKey]);
    
    const saveConversations = (updatedConversations: Conversation[], userId: number) => {
        const userStorageKey = `${STORAGE_KEY_PREFIX}${userId}`;
        localStorage.setItem(userStorageKey, JSON.stringify(updatedConversations));
    };

    const getConversationById = useCallback((id: string) => {
        return conversations.find(c => c.id === id);
    }, [conversations]);
    
    const startConversation = useCallback((product: Product): string => {
        if (!user) throw new Error("User must be logged in to start a conversation.");
        
        const conversationId = `${product.id}-${user.id}`;
        
        // Check if conversation already exists for this user
        const existingConversation = conversations.find(c => c.id === conversationId);
        if (existingConversation) {
            return conversationId;
        }

        const newConversation: Conversation = {
            id: conversationId,
            productId: product.id,
            productName: product.name,
            productImageUrl: product.imageUrl,
            sellerId: product.sellerId,
            sellerName: product.sellerName,
            buyerId: user.id,
            buyerName: user.name,
            messages: [],
            lastUpdatedAt: new Date().toISOString()
        };
        
        // Add to current user's conversations
        const updatedUserConversations = [...conversations, newConversation];
        setConversations(updatedUserConversations);
        saveConversations(updatedUserConversations, user.id);
        
        // Also add to the seller's conversations
        try {
            const sellerStorageKey = `${STORAGE_KEY_PREFIX}${product.sellerId}`;
            const sellerConversationsRaw = localStorage.getItem(sellerStorageKey);
            const sellerConversations = sellerConversationsRaw ? JSON.parse(sellerConversationsRaw) : [];
            const updatedSellerConversations = [...sellerConversations, newConversation];
            localStorage.setItem(sellerStorageKey, JSON.stringify(updatedSellerConversations));
        } catch (e) {
            console.error("Failed to update seller's conversations", e);
        }

        return conversationId;

    }, [conversations, user]);

    const sendMessage = useCallback((conversationId: string, text: string) => {
        if (!user) return;
        
        const newMessage: Message = {
            id: Date.now(),
            senderId: user.id,
            senderName: user.name,
            text: filterSensitiveInfo(text),
            createdAt: new Date().toISOString()
        };
        
        const updateConversation = (convos: Conversation[]) => {
             return convos.map(c => {
                if (c.id === conversationId) {
                    return { ...c, messages: [...c.messages, newMessage], lastUpdatedAt: new Date().toISOString() };
                }
                return c;
            }).sort((a,b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
        };
        
        const updatedUserConversations = updateConversation(conversations);
        setConversations(updatedUserConversations);
        saveConversations(updatedUserConversations, user.id);
        
        // Also update the other participant's conversations and notify them
        const currentConvo = updatedUserConversations.find(c => c.id === conversationId);
        if (currentConvo) {
            const otherParticipantId = user.id === currentConvo.sellerId ? currentConvo.buyerId : currentConvo.sellerId;
             try {
                const otherUserStorageKey = `${STORAGE_KEY_PREFIX}${otherParticipantId}`;
                const otherUserConvosRaw = localStorage.getItem(otherUserStorageKey);
                const otherUserConvos = otherUserConvosRaw ? JSON.parse(otherUserConvosRaw) : [];
                const updatedOtherUserConvos = updateConversation(otherUserConvos);
                localStorage.setItem(otherUserStorageKey, JSON.stringify(updatedOtherUserConvos));
                
                // Send notification
                addNotification(otherParticipantId, {
                    type: 'new_message',
                    message: `notification_new_message`,
                    replacements: { senderName: user.name, productName: currentConvo.productName },
                    link: `/profile/conversations?convo=${conversationId}`
                });

            } catch (e) {
                console.error("Failed to update other participant's conversations", e);
            }
        }

    }, [conversations, user, addNotification]);

    const value = { conversations, getConversationById, sendMessage, startConversation };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversations = () => {
    const context = useContext(ConversationContext);
    if (context === undefined) {
        throw new Error('useConversations must be used within a ConversationProvider');
    }
    return context;
};