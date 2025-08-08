import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { SupportTicket, SupportTicketStatus, TicketReply } from '../types.ts';
import { useAuth } from './AuthContext.tsx';

interface SupportContextType {
  tickets: SupportTicket[];
  addTicket: (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'replies'>) => void;
  updateTicketStatus: (id: number, status: SupportTicketStatus) => void;
  replyToTicket: (ticketId: number, replyText: string) => void;
  deleteTicket: (ticketId: number) => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

const STORAGE_KEY = 'reuseday_support_tickets';

const initialMockTickets: Omit<SupportTicket, 'id'>[] = [
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Question about my order',
        message: 'Hello, I was wondering when my order for the "Classic Leather Watch" will be shipped. Thank you!',
        status: 'New',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        replies: [],
    },
    {
        name: 'Carlos Ray',
        email: 'carlos@example.com',
        subject: 'Return Policy',
        message: 'What is your return policy for electronics? I am interested in the wireless headphones but want to be sure I can return them if they do not fit well.',
        status: 'Read',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        replies: [
            {
                id: 1,
                author: 'Admin',
                text: 'Hi Carlos, we offer a 14-day return policy on all electronics. Please see our Terms of Service for full details.',
                createdAt: new Date(Date.now() - 162800000).toISOString(),
            }
        ],
    }
];

const getInitialTickets = (): SupportTicket[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse support tickets from localStorage", e);
    }
    const ticketsWithIds = initialMockTickets.map((t, i) => ({ ...t, id: i + 1 }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ticketsWithIds));
    return ticketsWithIds;
};

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>(getInitialTickets);

    const saveTickets = (updatedTickets: SupportTicket[]) => {
        setTickets(updatedTickets);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
    };

    const addTicket = useCallback((ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'replies'>) => {
        const newTicket: SupportTicket = {
            ...ticketData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'New',
            replies: [],
        };
        saveTickets([newTicket, ...tickets]);
    }, [tickets]);

    const updateTicketStatus = useCallback((id: number, status: SupportTicketStatus) => {
        const updatedTickets = tickets.map(t => t.id === id ? { ...t, status } : t);
        saveTickets(updatedTickets);
    }, [tickets]);

    const replyToTicket = useCallback((ticketId: number, replyText: string) => {
        const newReply: TicketReply = {
            id: Date.now(),
            author: user?.name || 'Admin',
            text: replyText,
            createdAt: new Date().toISOString()
        };

        const updatedTickets = tickets.map(t => {
            if (t.id === ticketId) {
                const newReplies = t.replies ? [...t.replies, newReply] : [newReply];
                return { ...t, replies: newReplies, status: 'Read' as SupportTicketStatus };
            }
            return t;
        });
        saveTickets(updatedTickets);

    }, [tickets, user]);

    const deleteTicket = useCallback((ticketId: number) => {
        const updatedTickets = tickets.filter(t => t.id !== ticketId);
        saveTickets(updatedTickets);
    }, [tickets]);

    const value = { tickets, addTicket, updateTicketStatus, replyToTicket, deleteTicket };

    return (
        <SupportContext.Provider value={value}>
            {children}
        </SupportContext.Provider>
    );
};

export const useSupport = () => {
    const context = useContext(SupportContext);
    if (context === undefined) {
        throw new Error('useSupport must be used within a SupportProvider');
    }
    return context;
};