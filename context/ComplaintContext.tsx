import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Complaint, ComplaintStatus, Order } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { useOrders } from './OrderContext.tsx';

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaintData: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'replies' | 'userName' | 'userId' | 'sellerId'> & { orderId: string, imageUrl?: string }) => void;
  updateComplaintStatus: (id: number, status: ComplaintStatus) => void;
  getComplaintsForAdmin: () => Complaint[];
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);
const STORAGE_KEY = 'reuseday_complaints';

const getInitialComplaints = (): Complaint[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { console.error(e); return []; }
};

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { getAllOrdersForAdmin } = useOrders();
    const [complaints, setComplaints] = useState<Complaint[]>(getInitialComplaints);

    const saveComplaints = (updatedComplaints: Complaint[]) => {
        setComplaints(updatedComplaints);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedComplaints));
    };

    const addComplaint = useCallback((complaintData: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'replies' | 'userName' | 'userId' | 'sellerId'> & { orderId: string, imageUrl?: string }) => {
        if (!user) return;

        const allOrders = getAllOrdersForAdmin();
        const order = allOrders.find(o => o.id === complaintData.orderId);
        if (!order) return;

        const newComplaint: Complaint = {
            ...complaintData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'Open',
            replies: [],
            userName: user.name,
            userId: user.id,
            sellerId: order.items[0]?.sellerId || 0,
        };
        saveComplaints([newComplaint, ...complaints]);
    }, [complaints, user, getAllOrdersForAdmin]);

    const updateComplaintStatus = useCallback((id: number, status: ComplaintStatus) => {
        saveComplaints(complaints.map(c => c.id === id ? { ...c, status } : c));
    }, [complaints]);

    const getComplaintsForAdmin = useCallback(() => {
        return complaints.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [complaints]);

    const value = { complaints, addComplaint, updateComplaintStatus, getComplaintsForAdmin };

    return (
        <ComplaintContext.Provider value={value}>
            {children}
        </ComplaintContext.Provider>
    );
};

export const useComplaint = () => {
    const context = useContext(ComplaintContext);
    if (context === undefined) { throw new Error('useComplaint must be used within a ComplaintProvider'); }
    return context;
};
