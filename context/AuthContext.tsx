import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import type { User, StoredUser, UserRole, BankInfo, SellerRating } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext.tsx';
import { useLanguage } from './LanguageContext.tsx';
import { useNotifications } from './NotificationContext.tsx';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  deleteUser: (userId: number) => boolean;
  updateUserRole: (userId: number, role: UserRole) => boolean;
  updateUserBankInfo: (userId: number, bankInfo: BankInfo) => boolean;
  getStoredUser: (userId: number) => StoredUser | null;
  createUserByAdmin: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
  addSellerRating: (sellerId: number, rating: SellerRating) => boolean;
  getUserById: (userId: number) => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple hashing function for demonstration. DO NOT USE IN PRODUCTION.
const simpleHash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return String(hash);
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 5;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  // Seed admin user on initial load if not present
  useEffect(() => {
    try {
        const usersJSON = localStorage.getItem('users') || '[]';
        let users: StoredUser[] = JSON.parse(usersJSON);
        const adminExists = users.some(u => u.email === 'admin@reuseday.be');
        let usersModified = false;

        if (!adminExists) {
            const adminUser: StoredUser = {
                id: 1, name: 'Admin', email: 'admin@reuseday.be', passwordHash: simpleHash('admin123'), role: 'super_admin'
            };
            users.push(adminUser);
            usersModified = true;
        }
        
        const testUserExists = users.some(u => u.email === 'john@example.com');
        if (!testUserExists) {
            const testUser: StoredUser = {
                id: 2, name: 'John Doe', email: 'john@example.com', passwordHash: simpleHash('password123'), role: 'user', sellerRatings: []
            };
            users.push(testUser);
            usersModified = true;
        }

        // Ensure all users have sellerRatings array
        users = users.map(u => ({ ...u, sellerRatings: u.sellerRatings || [] }));

        if (usersModified) {
            localStorage.setItem('users', JSON.stringify(users));
        }

    } catch (e) { console.error("Failed to seed users", e); }
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const attemptsKey = `login_attempts_${email.toLowerCase()}`;
    try {
        const attemptsData = JSON.parse(localStorage.getItem(attemptsKey) || '{}');
        if (attemptsData.lockUntil && Date.now() < attemptsData.lockUntil) {
            const minutesRemaining = Math.ceil((attemptsData.lockUntil - Date.now()) / 60000);
            addToast(t('login_error_locked', { minutes: minutesRemaining }), 'error');
            return false;
        }
    } catch (e) {
        console.error("Failed to check login attempts", e);
    }
    
    const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
    const passwordHash = simpleHash(pass);
    const foundUser = users.find(u => u.email === email && u.passwordHash === passwordHash);

    if (foundUser) {
      const { passwordHash: _, ...userToStore } = foundUser;
      setUser(userToStore);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      localStorage.removeItem(attemptsKey);
      
      if (userToStore.role === 'super_admin' || userToStore.role === 'admin') {
        addToast(t('login_welcome_admin'), 'info');
      }

      return true;
    }

    try {
        let attemptsData = JSON.parse(localStorage.getItem(attemptsKey) || '{"count": 0}');
        attemptsData.count++;
        if (attemptsData.count >= MAX_LOGIN_ATTEMPTS) {
            attemptsData.lockUntil = Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000;
            attemptsData.count = 0; // Reset count after locking
             const minutesRemaining = Math.ceil((attemptsData.lockUntil - Date.now()) / 60000);
             addToast(t('login_error_locked', { minutes: minutesRemaining }), 'error');
        }
        localStorage.setItem(attemptsKey, JSON.stringify(attemptsData));
    } catch(e) {
        console.error("Failed to update login attempts", e);
    }

    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email)) return false;

    const newUser: StoredUser = {
      id: Date.now(), name, email, passwordHash: simpleHash(pass), role: 'user', sellerRatings: []
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    const { passwordHash: _, ...userToStore } = newUser;
    setUser(userToStore);
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
    
    addNotification({ type: 'new_user', message: `New user registered: ${name}` });

    return true;
  };

  const logout = () => {
    const userId = user?.id;
    setUser(null);
    localStorage.removeItem('currentUser');
    if (userId) {
        localStorage.removeItem(`wishlist_${userId}`);
        localStorage.removeItem(`orders_${userId}`);
        localStorage.removeItem(`cart_${userId}`);
    }
    navigate('/');
  };
  
  const deleteUser = (userIdToDelete: number): boolean => {
      try {
          const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
          if (!users.some(u => u.id === userIdToDelete)) return false;
          if (userIdToDelete === 1) {
              addToast("Cannot delete the main admin user.", "error");
              return false;
          }
          localStorage.setItem('users', JSON.stringify(users.filter(u => u.id !== userIdToDelete)));
          return true;
      } catch (e) {
          console.error("Failed to delete user", e);
          return false;
      }
  };

  const updateUserRole = (userIdToUpdate: number, newRole: UserRole): boolean => {
      try {
          const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === userIdToUpdate);
          if (userIndex === -1) return false;

          users[userIndex].role = newRole;
          localStorage.setItem('users', JSON.stringify(users));
          
          if (user?.id === userIdToUpdate) {
              setUser(prev => prev ? { ...prev, role: newRole } : null);
          }
          addToast(t('admin_role_updated_toast'), 'success');
          return true;
      } catch (e) {
          addToast(t('admin_role_update_failed_toast'), 'error');
          return false;
      }
  };
    
  const updateUserBankInfo = (userId: number, bankInfo: BankInfo): boolean => {
      try {
          const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === userId);
          if (userIndex === -1) return false;
          users[userIndex].bankInfo = bankInfo;
          localStorage.setItem('users', JSON.stringify(users));
          addToast(t('profile_bank_info_saved_toast'), 'success');
          return true;
      } catch (e) {
          addToast(t('profile_bank_info_failed_toast'), 'error');
          return false;
      }
  };

  const getStoredUser = useCallback((userId: number): StoredUser | null => {
      try {
          const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
          return users.find(u => u.id === userId) || null;
      } catch (e) {
          return null;
      }
  }, []);

  const getUserById = useCallback((userId: number): User | null => {
    const storedUser = getStoredUser(userId);
    if (!storedUser) return null;
    const { passwordHash, bankInfo, sellerRatings, ...publicUser } = storedUser;
    return publicUser;
  }, [getStoredUser]);
    
  const createUserByAdmin = async (name: string, email: string, pass: string, role: UserRole): Promise<boolean> => {
      const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return false;

      const newUser: StoredUser = {
        id: Date.now(), name, email, passwordHash: simpleHash(pass), role, sellerRatings: []
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      return true;
  };
  
  const addSellerRating = useCallback((sellerId: number, rating: SellerRating): boolean => {
      try {
            const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === sellerId);
            if (userIndex === -1) return false;
            
            const seller = users[userIndex];
            const newRatings = [...(seller.sellerRatings || []), rating];
            users[userIndex] = { ...seller, sellerRatings: newRatings };
            
            localStorage.setItem('users', JSON.stringify(users));
            addToast(t('seller_rating_submitted_toast'), 'success');
            return true;
        } catch (e) {
            addToast(t('seller_rating_failed_toast'), 'error');
            return false;
        }
  }, [addToast, t]);

  const isAuthenticated = useMemo(() => !!user, [user]);
  const isSuperAdmin = useMemo(() => user?.role === 'super_admin', [user]);
  const isAdmin = useMemo(() => user?.role === 'super_admin' || user?.role === 'admin', [user]);

  const value = { user, isAuthenticated, isAdmin, isSuperAdmin, login, logout, register, deleteUser, updateUserRole, updateUserBankInfo, getStoredUser, createUserByAdmin, addSellerRating, getUserById };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};