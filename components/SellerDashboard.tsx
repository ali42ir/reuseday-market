import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import type { Order, Product, StoredUser } from '../types.ts';
import { Link, useNavigate } from 'react-router-dom';

interface SellerDashboardProps {
    userProducts: Product[];
    allOrders: Order[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-start">
        <div className="bg-yellow-200 text-yellow-800 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const QuickLink: React.FC<{ to: string; title: string; }> = ({ to, title }) => {
    const navigate = useNavigate();
    return (
        <button onClick={() => navigate(to)} className="w-full text-left bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex justify-between items-center">
            <span className="font-semibold text-gray-700">{title}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        </button>
    )
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ userProducts, allOrders }) => {
    const { user, getStoredUser } = useAuth();
    const { t } = useLanguage();

    const sellerStats = useMemo(() => {
        if (!user) return { totalRevenue: 0, completedSales: 0, avgRating: 0, activeListings: 0 };

        const myCompletedOrders = allOrders.filter(o => 
            o.items.some(item => item.sellerId === user.id) && o.status === 'Completed' && o.sellingMode === 'secure'
        );
        const totalRevenue = myCompletedOrders.reduce((sum, order) => sum + order.total, 0);

        const storedUser = getStoredUser(user.id);
        const ratings = storedUser?.sellerRatings || [];
        const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
        
        return {
            totalRevenue,
            completedSales: myCompletedOrders.length,
            avgRating: avgRating.toFixed(1),
            activeListings: userProducts.length
        };
    }, [user, userProducts, allOrders, getStoredUser]);
    
    const icons = {
        revenue: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
        sales: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
        rating: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
        listings: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('seller_dashboard_title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <StatCard title={t('seller_dashboard_total_revenue')} value={`€${sellerStats.totalRevenue.toFixed(2)}`} icon={icons.revenue} />
                <StatCard title={t('seller_dashboard_completed_sales')} value={sellerStats.completedSales} icon={icons.sales} />
                <StatCard title={t('seller_dashboard_avg_rating')} value={sellerStats.avgRating} icon={icons.rating} />
                <StatCard title={t('seller_dashboard_active_listings')} value={sellerStats.activeListings} icon={icons.listings} />
            </div>

             <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">{t('seller_dashboard_quick_links')}</h3>
                 <div className="space-y-3">
                    <QuickLink to="/sell" title={t('seller_dashboard_view_listings')} />
                    <QuickLink to="/profile/ratings" title={t('seller_dashboard_view_ratings')} />
                    <QuickLink to="/profile/questions" title={t('seller_dashboard_view_qa')} />
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;