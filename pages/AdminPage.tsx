import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import type { StoredUser, Order, Product, OrderStatus, UserRole } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useSupport } from '../context/SupportContext.tsx';
import { useOrders } from '../context/OrderContext.tsx';
import Spinner from '../components/Spinner.tsx';

import AdminDashboard from '../components/admin/AdminDashboard.tsx';
import AdminUsersTable from '../components/admin/AdminUsersTable.tsx';
import AdminProductsTable from '../components/admin/AdminProductsTable.tsx';
import AdminOrdersTable from '../components/admin/AdminOrdersTable.tsx';
import AdminSettings from '../components/admin/AdminSettings.tsx';
import AdminCategories from '../components/admin/AdminCategories.tsx';
import AdminMarketing from '../components/admin/AdminMarketing.tsx';
import AdminContent from '../components/admin/AdminContent.tsx';
import AdminSupport from '../components/admin/AdminSupport.tsx';
import AdminNotifications from '../components/admin/AdminNotifications.tsx';
import AdminTransactions from '../components/admin/AdminTransactions.tsx';
import AdminBackup from '../components/admin/AdminBackup.tsx';
import AdminAdvertisements from '../components/admin/AdminAdvertisements.tsx';
import AdminComplaints from '../components/admin/AdminComplaints.tsx';
import AdminKindWall from '../components/admin/AdminKindWall.tsx';


type AdminTab = 'dashboard' | 'users' | 'products' | 'orders' | 'transactions' | 'categories' | 'marketing' | 'settings' | 'content' | 'support' | 'backup' | 'advertisements' | 'complaints' | 'kindwall';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AdminPage: React.FC = () => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const { products, loading: productsLoading, deleteProductAsAdmin, deleteProductsByUserId } = useProductContext();
    const { user: currentUser, isSuperAdmin, isAdmin, deleteUser, updateUserRole, createUserByAdmin, changeUserPasswordByAdmin } = useAuth();
    const { replyToTicket, deleteTicket } = useSupport();
    const { getAllOrdersForAdmin } = useOrders();
    
    const navigate = useNavigate();
    const query = useQuery();
    const [users, setUsers] = useState<StoredUser[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

    const allTabs: { id: AdminTab; labelKey: string; superAdminOnly: boolean; }[] = useMemo(() => [
        { id: 'dashboard', labelKey: 'admin_tab_dashboard', superAdminOnly: false },
        { id: 'orders', labelKey: 'admin_tab_orders', superAdminOnly: false },
        { id: 'users', labelKey: 'admin_tab_users', superAdminOnly: false },
        { id: 'products', labelKey: 'admin_tab_products', superAdminOnly: false },
        { id: 'support', labelKey: 'admin_tab_support', superAdminOnly: false },
        { id: 'complaints', labelKey: 'admin_tab_complaints', superAdminOnly: false },
        { id: 'kindwall', labelKey: 'kindwall_title', superAdminOnly: false },
        { id: 'transactions', labelKey: 'admin_tab_transactions', superAdminOnly: true },
        { id: 'categories', labelKey: 'admin_tab_categories', superAdminOnly: true },
        { id: 'marketing', labelKey: 'admin_tab_marketing', superAdminOnly: true },
        { id: 'advertisements', labelKey: 'admin_tab_advertisements', superAdminOnly: true },
        { id: 'content', labelKey: 'admin_tab_content', superAdminOnly: true },
        { id: 'settings', labelKey: 'admin_tab_settings', superAdminOnly: true },
        { id: 'backup', labelKey: 'admin_tab_backup', superAdminOnly: true },
    ], []);

    const visibleTabs = useMemo(() => {
        return allTabs.filter(tab => isSuperAdmin || !tab.superAdminOnly);
    }, [isSuperAdmin, allTabs]);

    useEffect(() => {
        const tabFromUrl = query.get('tab') as AdminTab;
        const highlightId = query.get('highlight');
        
        const targetTab = visibleTabs.find(t => t.id === tabFromUrl);
        if (targetTab) {
            setActiveTab(targetTab.id);
        } else {
            const defaultTab = visibleTabs[0]?.id || 'dashboard';
            setActiveTab(defaultTab);
            if (tabFromUrl && tabFromUrl !== defaultTab) {
                navigate(`/admin?tab=${defaultTab}`, { replace: true });
            }
        }
        
        if (highlightId) {
            setHighlightedOrderId(highlightId);
        }
    }, [query, visibleTabs, navigate]);


    const fetchAdminData = useCallback(() => {
        setLoading(true);
        try {
            const storedUsers = localStorage.getItem('users');
            const parsedUsers: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : [];
            setUsers(parsedUsers);
            setAllOrders(getAllOrdersForAdmin());
        } catch (e) {
            console.error("Failed to load admin data from localStorage", e);
            addToast("Failed to load admin data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast, getAllOrdersForAdmin]);
    
    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const handleDeleteUser = useCallback((userIdToDelete: number) => {
        if (window.confirm(t('admin_delete_user_confirm'))) {
            if (deleteUser(userIdToDelete)) {
                deleteProductsByUserId(userIdToDelete);
                localStorage.removeItem(`cart_${userIdToDelete}`);
                localStorage.removeItem(`wishlist_${userIdToDelete}`);
                localStorage.removeItem(`orders_${userIdToDelete}`);
                
                setUsers(prev => prev.filter(u => u.id !== userIdToDelete));
                setAllOrders(prev => prev.filter(o => o.userId !== userIdToDelete));
                
                addToast(t('admin_user_deleted_toast'), 'success');
            }
        }
    }, [t, deleteUser, deleteProductsByUserId, addToast]);
    
    const handleDeleteProduct = useCallback((productId: number) => {
        if (window.confirm(t('admin_delete_product_confirm'))) {
            if (deleteProductAsAdmin(productId)) {
                 addToast(t('admin_product_deleted_toast'), 'success');
            }
        }
    }, [t, deleteProductAsAdmin, addToast]);

    const handleUpdateOrderStatus = useCallback((orderId: string, userId: number, newStatus: OrderStatus) => {
        try {
            const allUsersRaw = localStorage.getItem('users');
            const allUsers: StoredUser[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
            let orderFound = false;

            for(const u of allUsers) {
                const userOrdersKey = `orders_${u.id}`;
                const userOrdersRaw = localStorage.getItem(userOrdersKey);
                if(userOrdersRaw) {
                    let userOrders: Order[] = JSON.parse(userOrdersRaw);
                    const orderIndex = userOrders.findIndex(o => o.id === orderId);
                    if (orderIndex !== -1) {
                         userOrders[orderIndex].status = newStatus;
                         localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));
                         orderFound = true;
                    }
                }
            }
            if (!orderFound) throw new Error(`Could not find order ${orderId} for any user.`);
            
            setAllOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
            addToast(t('admin_order_status_updated_toast'), 'success');
        } catch (error) {
            console.error("Failed to update order status:", error);
            addToast("Failed to update order status.", "error");
        }
    }, [addToast, t]);

    const handleRoleUpdate = useCallback((userId: number, role: UserRole): boolean => {
        const success = updateUserRole(userId, role);
        if(success) {
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role } : u));
        }
        return success;
    }, [updateUserRole]);
    
    const isLoading = loading || productsLoading;

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[70vh]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('admin_title')}</h1>
                <AdminNotifications />
            </div>
            
            <div className="mb-6 border-b border-gray-200">
                <div className="overflow-x-auto no-scrollbar">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {visibleTabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => navigate(`/admin?tab=${tab.id}`, { replace: true })}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-amazon-yellow text-amazon-blue'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </nav>
                 </div>
            </div>
            
            {isLoading ? (
                 <div className="flex items-center justify-center pt-20"><Spinner /></div>
            ) : (
                <div className="animate-fade-in">
                    <style>{`@keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } } .animate-fade-in { animation: fade-in 0.5s; }`}</style>
                    {activeTab === 'dashboard' && <AdminDashboard users={users} products={products} orders={allOrders} />}
                    {activeTab === 'users' && <AdminUsersTable users={users} currentUser={currentUser} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} onDeleteUser={handleDeleteUser} onUpdateRole={handleRoleUpdate} onCreateUser={createUserByAdmin} onUserCreated={fetchAdminData} onChangePassword={changeUserPasswordByAdmin} />}
                    {activeTab === 'products' && <AdminProductsTable products={products} onDeleteProduct={handleDeleteProduct} />}
                    {activeTab === 'orders' && <AdminOrdersTable orders={allOrders} users={users} onUpdateStatus={handleUpdateOrderStatus} highlightedOrderId={highlightedOrderId} />}
                    {activeTab === 'transactions' && isSuperAdmin && <AdminTransactions orders={allOrders} users={users} />}
                    {activeTab === 'categories' && isSuperAdmin && <AdminCategories />}
                    {activeTab === 'marketing' && isSuperAdmin && <AdminMarketing />}
                    {activeTab === 'advertisements' && isSuperAdmin && <AdminAdvertisements />}
                    {activeTab === 'complaints' && <AdminComplaints />}
                    {activeTab === 'kindwall' && <AdminKindWall />}
                    {activeTab === 'content' && isSuperAdmin && <AdminContent />}
                    {activeTab === 'support' && <AdminSupport replyToTicket={replyToTicket} deleteTicket={deleteTicket} />}
                    {activeTab === 'settings' && isSuperAdmin && <AdminSettings />}
                    {activeTab === 'backup' && isSuperAdmin && <AdminBackup />}
                </div>
            )}
        </div>
    );
};

export default AdminPage;