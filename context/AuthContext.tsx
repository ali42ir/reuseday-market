import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import type { User, StoredUser, UserRole, BankInfo, SellerRating, Address, TwoFactorMethod } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext.tsx';
import { useLanguage } from './LanguageContext.tsx';
import { useNotifications } from './NotificationContext.tsx';

interface PasswordResetToken {
    userId: number;
    token: string;
    expires: number;
}

interface AuthContextType {
  user: User | null;
  masqueradeAdminId: number | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSeller: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, pass: string, isSeller: boolean) => Promise<boolean>;
  deleteUser: (userId: number) => boolean;
  updateUserRole: (userId: number, role: UserRole) => boolean;
  updateUserBankInfo: (userId: number, bankInfo: BankInfo) => boolean;
  getStoredUser: (userId: number) => StoredUser | null;
  createUserByAdmin: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
  addSellerRating: (sellerId: number, rating: SellerRating) => boolean;
  getUserById: (userId: number) => User | null;
  requestPasswordReset: (email: string) => Promise<boolean>;
  validateResetToken: (token: string, userId: number) => Promise<boolean>;
  resetPassword: (token: string, userId: number, newPass: string) => Promise<boolean>;
  changeUserPasswordByAdmin: (userId: number, newPass: string) => Promise<boolean>;
  updateUserProfile: (userId: number, data: Partial<Pick<StoredUser, 'name' | 'email' | 'phone' | 'address' | 'vatNumber' | 'twoFactorMethod'>>) => boolean;
  enableSelling: () => boolean;
  loginAsUser: (targetUserId: number) => Promise<boolean>;
  returnToAdmin: () => Promise<boolean>;
  verifyCurrentUserPassword: (password: string) => Promise<boolean>;
  generateAndStore2FACode: () => Promise<TwoFactorMethod | 'none'>;
  verify2FACode: (code: string) => Promise<boolean>;
  toggleUserVerification: (userId: number) => boolean;
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

const getInitialUser = (): User | null => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
      return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [masqueradeAdminId, setMasqueradeAdminId] = useState<number | null>(() => {
    const storedId = sessionStorage.getItem('masquerade_admin_id');
    return storedId ? parseInt(storedId, 10) : null;
  });
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Self-healing: Ensure a super admin exists if none are found.
    try {
        const usersRaw = localStorage.getItem('users') || '[]';
        let users: StoredUser[] = JSON.parse(usersRaw);
        const superAdminExists = users.some(u => u.role === 'super_admin');

        if (!superAdminExists) {
            const defaultAdmin: StoredUser = {
                id: 1, // Use a stable low ID
                name: 'Default Admin',
                email: 'admin@reuseday.be',
                passwordHash: simpleHash('Taragu9270@'),
                role: 'super_admin',
                isSeller: true,
                isVerified: true,
                sellerRatings: [],
                twoFactorMethod: 'none',
            };
            // Prepend to make sure it's the first user if array is empty
            users.unshift(defaultAdmin);
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Ensure seller John Doe is verified for demo
        const johnDoeIndex = users.findIndex(u => u.id === 2);
        if (johnDoeIndex !== -1 && users[johnDoeIndex].isVerified === undefined) {
            users[johnDoeIndex].isVerified = true;
            localStorage.setItem('users', JSON.stringify(users));
        }

    } catch (e) {
        // Silently fail or handle error differently if needed
    }

    setUser(getInitialUser());
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
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);

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

  const register = async (name: string, email: string, pass: string, isSeller: boolean): Promise<boolean> => {
    const usersRaw = localStorage.getItem('users') || '[]';
    const users: StoredUser[] = JSON.parse(usersRaw);
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return false;

    const role: UserRole = 'user';

    const newUser: StoredUser = {
      id: Date.now(), name, email, passwordHash: simpleHash(pass), role, sellerRatings: [], isVerified: false, isSeller, twoFactorMethod: 'none',
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    const { passwordHash: _, ...userToStore } = newUser;
    setUser(userToStore);
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
    
    addNotification({ type: 'new_user', message: `New user registered: ${name}` });

    return true;
  };

  const enableSelling = (): boolean => {
    if (!user) return false;
    try {
        const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex === -1) return false;
        
        users[userIndex].isSeller = true;
        localStorage.setItem('users', JSON.stringify(users));
        
        const updatedUser = { ...user, isSeller: true };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        addToast(t('seller_account_enabled_toast'), 'success');
        return true;
    } catch (e) {
        addToast(t('seller_account_enable_failed_toast'), 'error');
        return false;
    }
  };


  const logout = () => {
    const userId = user?.id;
    setUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('masquerade_admin_id');
    sessionStorage.removeItem('2fa_code');
    setMasqueradeAdminId(null);
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
          const userToDelete = users.find(u => u.id === userIdToDelete);
          
          if (!userToDelete) {
              return false;
          }
          
          if (userToDelete.id === 1 && userToDelete.role === 'super_admin') {
              addToast(t('admin_cannot_delete_main_admin'), "error");
              return false;
          }

          if (userToDelete.role === 'admin' || userToDelete.role === 'super_admin') {
              addToast(t('admin_cannot_delete_admin'), 'error');
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
             const { passwordHash: _, ...userToStore } = users[userIndex];
             setUser(userToStore);
             localStorage.setItem('currentUser', JSON.stringify(userToStore));
          }
          addToast(t('admin_role_updated_toast'), 'success');
          return true;
      } catch (e) {
          addToast(t('admin_role_update_failed_toast'), 'error');
          return false;
      }
  };
    
  const updateUserProfile = (userId: number, data: Partial<Pick<StoredUser, 'name' | 'email' | 'phone' | 'address' | 'vatNumber' | 'twoFactorMethod'>>): boolean => {
        try {
            const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
            
            if (data.email) {
                const emailExists = users.some(u => u.email.toLowerCase() === data.email!.toLowerCase() && u.id !== userId);
                if (emailExists) {
                    addToast(t('profile_email_exists_toast'), 'error');
                    return false;
                }
            }
            
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) return false;
            
            users[userIndex] = { ...users[userIndex], ...data };
            localStorage.setItem('users', JSON.stringify(users));
            
            if (user?.id === userId) {
                 const { passwordHash: _, ...userToStore } = users[userIndex];
                 setUser(userToStore);
                 localStorage.setItem('currentUser', JSON.stringify(userToStore));
            }
            addToast(t('profile_details_saved_toast'), 'success');
            return true;
        } catch (e) {
             addToast(t('profile_details_failed_toast'), 'error');
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
    const { passwordHash: _, ...publicUser } = storedUser;
    return publicUser;
  }, [getStoredUser]);
    
  const createUserByAdmin = async (name: string, email: string, pass: string, role: UserRole): Promise<boolean> => {
      const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return false;

      const newUser: StoredUser = {
        id: Date.now(), name, email, passwordHash: simpleHash(pass), role, sellerRatings: [], twoFactorMethod: 'none',
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
  
    const requestPasswordReset = async (email: string): Promise<boolean> => {
        // This is a simulation. In a real app, this would trigger a backend process.
        // We return true to prevent email enumeration attacks.
        return Promise.resolve(true);
    };

    const validateResetToken = async (token: string, userId: number): Promise<boolean> => {
        const resetTokens: { [key: number]: PasswordResetToken } = JSON.parse(localStorage.getItem('reuseday_password_reset_tokens') || '{}');
        const tokenData = resetTokens[userId];

        if (!tokenData || tokenData.token !== token || Date.now() > tokenData.expires) {
            return false;
        }
        return true;
    };

    const resetPassword = async (token: string, userId: number, newPass: string): Promise<boolean> => {
        // This function is kept for the simulated flow but relies on a token that is no longer generated.
        // In a real app, this would be the endpoint the user hits from their email link.
        const isTokenValid = await validateResetToken(token, userId);
        if (!isTokenValid) {
            return false;
        }

        const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;

        users[userIndex].passwordHash = simpleHash(newPass);
        localStorage.setItem('users', JSON.stringify(users));

        // Invalidate the token
        const resetTokens: { [key: number]: PasswordResetToken } = JSON.parse(localStorage.getItem('reuseday_password_reset_tokens') || '{}');
        delete resetTokens[userId];
        localStorage.setItem('reuseday_password_reset_tokens', JSON.stringify(resetTokens));
        
        return true;
    };

    const changeUserPasswordByAdmin = async (userId: number, newPass: string): Promise<boolean> => {
        const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userToChange = users.find(u => u.id === userId);

        if (!userToChange) {
            addToast(t('admin_password_change_failed_toast'), 'error');
            return false;
        }
        
        if (userToChange.id === 1 && user?.id !== 1) {
            addToast(t('admin_cannot_change_main_admin_password'), 'error');
            return false;
        }

        // Prohibit a regular admin from changing another admin's password
        if (user?.role === 'admin' && (userToChange.role === 'admin' || userToChange.role === 'super_admin') && user.id !== userToChange.id) {
            addToast(t('admin_cannot_change_other_admin_password'), 'error');
            return false;
        }

        try {
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) { 
                addToast(t('admin_password_change_failed_toast'), 'error');
                return false;
            }

            users[userIndex].passwordHash = simpleHash(newPass);
            localStorage.setItem('users', JSON.stringify(users));
            
            addToast(t('admin_password_changed_toast'), 'success');
            return true;
        } catch (e) {
            console.error("Failed to change user password by admin", e);
            addToast(t('admin_password_change_failed_toast'), 'error');
            return false;
        }
    };
    
    const loginAsUser = async (targetUserId: number): Promise<boolean> => {
        if (user?.role !== 'super_admin') return false;

        const targetUser = getStoredUser(targetUserId);
        if (!targetUser) return false;
        
        const adminId = user.id;
        sessionStorage.setItem('masquerade_admin_id', String(adminId));
        setMasqueradeAdminId(adminId);
        
        const { passwordHash: _, ...userToStore } = targetUser;
        setUser(userToStore);
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        addToast(t('login_as_user_toast', { name: userToStore.name }), 'success');
        navigate('/');
        return true;
    };

    const returnToAdmin = async (): Promise<boolean> => {
        const adminId = sessionStorage.getItem('masquerade_admin_id');
        if (!adminId) return false;
        
        const adminUser = getStoredUser(parseInt(adminId, 10));
        if (!adminUser) return false;

        sessionStorage.removeItem('masquerade_admin_id');
        setMasqueradeAdminId(null);
        
        const { passwordHash: _, ...userToStore } = adminUser;
        setUser(userToStore);
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        navigate('/admin');
        return true;
    };

    const verifyCurrentUserPassword = async (password: string): Promise<boolean> => {
        if (!user) return false;
        const storedUser = getStoredUser(user.id);
        return storedUser?.passwordHash === simpleHash(password);
    };

    const generateAndStore2FACode = async (): Promise<TwoFactorMethod | 'none'> => {
        if (!user) return 'none';
        const storedUser = getStoredUser(user.id);
        const method = storedUser?.twoFactorMethod || 'none';
        if (method === 'none') return 'none';

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
        const data = { code, expires, attempts: 0 };
        sessionStorage.setItem('2fa_code', JSON.stringify(data));

        // Simulation: In a real app, you'd send an SMS or email here.
        console.log(`%c2FA Code for ${user.email}: ${code}`, 'color: blue; font-size: 16px; font-weight: bold;');
        addToast(`${t('change_password_2fa_code_sent')} ${code}`, 'info');
        
        return method;
    };

    const verify2FACode = async (code: string): Promise<boolean> => {
        try {
            const dataRaw = sessionStorage.getItem('2fa_code');
            if (!dataRaw) return false;

            const data = JSON.parse(dataRaw);
            if (Date.now() > data.expires || data.attempts >= 3) {
                sessionStorage.removeItem('2fa_code');
                return false;
            }

            if (data.code === code) {
                sessionStorage.removeItem('2fa_code');
                return true;
            } else {
                data.attempts += 1;
                sessionStorage.setItem('2fa_code', JSON.stringify(data));
                return false;
            }
        } catch (e) {
            return false;
        }
    };
    
    const toggleUserVerification = useCallback((userId: number): boolean => {
      try {
          const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === userId);
          if (userIndex === -1) return false;
          
          users[userIndex].isVerified = !users[userIndex].isVerified;
          localStorage.setItem('users', JSON.stringify(users));
          addToast('User verification status updated!', 'success');
          return true;
      } catch(e) {
          addToast('Failed to update user verification.', 'error');
          return false;
      }
    }, [addToast]);

  const isAuthenticated = useMemo(() => !!user, [user]);
  const isSuperAdmin = useMemo(() => user?.role === 'super_admin' && !masqueradeAdminId, [user, masqueradeAdminId]);
  const isAdmin = useMemo(() => (user?.role === 'super_admin' || user?.role === 'admin') && !masqueradeAdminId, [user, masqueradeAdminId]);
  const isSeller = useMemo(() => !!user?.isSeller || user?.role === 'super_admin', [user]);


  const value = { user, masqueradeAdminId, isAuthenticated, isAdmin, isSuperAdmin, isSeller, login, logout, register, deleteUser, updateUserRole, updateUserBankInfo, getStoredUser, createUserByAdmin, addSellerRating, getUserById, requestPasswordReset, validateResetToken, resetPassword, changeUserPasswordByAdmin, updateUserProfile, enableSelling, loginAsUser, returnToAdmin, verifyCurrentUserPassword, generateAndStore2FACode, verify2FACode, toggleUserVerification };

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