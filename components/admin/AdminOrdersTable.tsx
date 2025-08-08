
import React, { useState, useMemo, useEffect } from 'react';
import type { Order, OrderStatus, StoredUser, SellingMode } from '../../types.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminOrdersTableProps {
    orders: Order[];
    users: StoredUser[];
    onUpdateStatus: (orderId: string, userId: number, newStatus: OrderStatus) => void;
    highlightedOrderId?: string | null;
}

const statusColors: { [key in OrderStatus]: string } = {
    Pending: 'bg-yellow-100 text-yellow-800',
    AwaitingPayment: 'bg-orange-100 text-orange-800',
    AwaitingShipment: 'bg-blue-100 text-blue-800',
    PaymentHeld: 'bg-purple-100 text-purple-800',
    Shipped: 'bg-indigo-100 text-indigo-800',
    Delivered: 'bg-green-100 text-green-800',
    Completed: 'bg-teal-100 text-teal-800',
    Cancelled: 'bg-red-100 text-red-800',
};

const allStatuses: OrderStatus[] = ['Pending', 'AwaitingPayment', 'AwaitingShipment', 'PaymentHeld', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];

const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({ orders, users, onUpdateStatus, highlightedOrderId }) => {
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

    const filteredOrders = useMemo(() => {
        if (statusFilter === 'all') return orders;
        return orders.filter(order => order.status === statusFilter);
    }, [orders, statusFilter]);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language, {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    const handleInvoiceClick = () => {
        addToast(t('admin_order_invoice_toast'), 'info');
    };

    useEffect(() => {
        if(highlightedOrderId) {
            const element = document.getElementById(`order-row-${highlightedOrderId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedOrderId]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-xl font-bold">{t('admin_orders_title')} ({filteredOrders.length})</h2>
                <div>
                    <label htmlFor="status-filter" className="sr-only">{t('admin_order_filter_by_status')}</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                        className="p-2 border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="all">{t('admin_order_all_statuses')}</option>
                        {allStatuses.map(status => (
                            <option key={status} value={status}>{t(`order_status_${status.toLowerCase()}`)}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_id')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_user')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_date')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_total')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_status')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => {
                            const user = userMap.get(order.userId);
                            const isHighlighted = order.id === highlightedOrderId;
                            return (
                                <tr key={order.id} id={`order-row-${order.id}`} className={isHighlighted ? 'bg-yellow-100' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">#{order.id.slice(-6)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">€{order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                         <select 
                                            value={order.status}
                                            onChange={(e) => onUpdateStatus(order.id, order.userId, e.target.value as OrderStatus)}
                                            className={`text-xs p-1 border-0 rounded-md font-semibold ${statusColors[order.status]} focus:ring-2 focus:ring-offset-1 focus:ring-amazon-yellow`}
                                        >
                                            {allStatuses.map(status => (
                                                <option key={status} value={status}>{t(`order_status_${status.toLowerCase()}`)}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{order.sellingMode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={handleInvoiceClick} className="text-blue-600 hover:text-blue-900">{t('admin_order_generate_invoice')}</button>
                                        <a href={`mailto:${user?.email}`} className="text-green-600 hover:text-green-900">{t('admin_order_contact_user')}</a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredOrders.length === 0 && (
                    <p className="text-center py-4 text-gray-500">No orders match the selected status.</p>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersTable;