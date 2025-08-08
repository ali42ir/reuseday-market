
import React, { useMemo, useState } from 'react';
import type { Order, StoredUser } from '../../types.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSystemSettings } from '../../context/SystemSettingsContext.tsx';

interface AdminTransactionsProps {
    orders: Order[];
    users: StoredUser[];
}

const AdminTransactions: React.FC<AdminTransactionsProps> = ({ orders, users }) => {
    const { t, language } = useLanguage();
    const { systemSettings } = useSystemSettings();
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const [sellerFilter, setSellerFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

    const completedTransactions = useMemo(() => {
        return orders
            .filter(order => order.status === 'Completed' && order.sellingMode === 'secure')
            .map(order => {
                const commission = order.total * (systemSettings.commissionRate / 100);
                const payout = order.total - commission;
                const seller = userMap.get(order.items[0]?.sellerId);
                const buyer = userMap.get(order.userId);
                return { ...order, commission, payout, sellerName: seller?.name || 'N/A', buyerName: buyer?.name || 'N/A' };
            });
    }, [orders, systemSettings.commissionRate, userMap]);

    const filteredTransactions = useMemo(() => {
        return completedTransactions.filter(t => {
            const sellerMatch = sellerFilter === 'all' || t.items[0]?.sellerId.toString() === sellerFilter;
            const date = new Date(t.date);
            const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
            const endDate = dateFilter.end ? new Date(dateFilter.end) : null;

            if (startDate) startDate.setHours(0, 0, 0, 0);
            if (endDate) endDate.setHours(23, 59, 59, 999);

            const dateMatch = (!startDate || date >= startDate) && (!endDate || date <= endDate);
            return sellerMatch && dateMatch;
        });
    }, [completedTransactions, sellerFilter, dateFilter]);

    const uniqueSellers = useMemo(() => {
        const sellerIds = new Set(completedTransactions.map(t => t.items[0]?.sellerId));
        return Array.from(sellerIds).map(id => userMap.get(id)).filter(Boolean) as StoredUser[];
    }, [completedTransactions, userMap]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language, {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{t('admin_tab_transactions')} ({filteredTransactions.length})</h2>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700">{t('admin_transactions_filter_by_seller')}</label>
                    <select value={sellerFilter} onChange={e => setSellerFilter(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm text-sm">
                        <option value="all">{t('admin_transactions_all_sellers')}</option>
                        {uniqueSellers.map(seller => <option key={seller.id} value={seller.id}>{seller.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                     <label className="block text-sm font-medium text-gray-700">{t('admin_transactions_date_from')}</label>
                     <input type="date" value={dateFilter.start} onChange={e => setDateFilter(prev => ({ ...prev, start: e.target.value }))} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"/>
                </div>
                <div className="flex-1 min-w-[200px]">
                     <label className="block text-sm font-medium text-gray-700">{t('admin_transactions_date_to')}</label>
                     <input type="date" value={dateFilter.end} onChange={e => setDateFilter(prev => ({ ...prev, end: e.target.value }))} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"/>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_id')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_date')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_product_seller')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_transactions_buyer')}</th>
                            <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_transactions_total_sale')}</th>
                            <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_transactions_commission')} ({systemSettings.commissionRate}%)</th>
                            <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_transactions_payout')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">#{order.id.slice(-6)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.sellerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.buyerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-end">€{order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-end">€{order.commission.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-end">€{order.payout.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTransactions.length === 0 && (
                    <p className="text-center py-4 text-gray-500">{t('admin_transactions_none')}</p>
                )}
            </div>
        </div>
    );
};

export default AdminTransactions;