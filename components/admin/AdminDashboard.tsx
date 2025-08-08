
import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import type { StoredUser, Order, Product } from '../../types.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useCategory } from '../../context/CategoryContext.tsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

interface AdminDashboardProps {
    users: StoredUser[];
    products: Product[];
    orders: Order[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, products, orders }) => {
    const { t } = useLanguage();
    const { getSubCategoryById } = useCategory();

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    const revenueData = useMemo(() => {
        const monthlyRevenue: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            monthlyRevenue[monthKey] = 0;
        }

        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const monthKey = `${monthNames[orderDate.getMonth()]} ${orderDate.getFullYear()}`;
            if (monthKey in monthlyRevenue) {
                monthlyRevenue[monthKey] += order.total;
            }
        });

        return {
            labels: Object.keys(monthlyRevenue),
            datasets: [{
                label: t('admin_chart_label_revenue'),
                data: Object.values(monthlyRevenue),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                tension: 0.1
            }],
        };
    }, [orders, t]);
    
    const userRegistrationData = useMemo(() => {
        const monthlyUsers: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            monthlyUsers[monthKey] = 0;
        }

        users.forEach(user => {
            const registrationDate = new Date(user.id); // Using ID as timestamp
            const monthKey = `${monthNames[registrationDate.getMonth()]} ${registrationDate.getFullYear()}`;
             if (monthKey in monthlyUsers) {
                monthlyUsers[monthKey]++;
            }
        });
        
        return {
            labels: Object.keys(monthlyUsers),
            datasets: [{
                label: t('admin_chart_label_new_users'),
                data: Object.values(monthlyUsers),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
            }],
        };
    }, [users, t]);


    const categoryData = useMemo(() => {
        const categoryCount = products.reduce((acc, product) => {
            const catInfo = getSubCategoryById(product.categoryId);
            const mainCategoryName = catInfo ? t(catInfo.parent.nameKey) : product.categoryId;
            acc[mainCategoryName] = (acc[mainCategoryName] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        return {
            labels: Object.keys(categoryCount),
            datasets: [{
                label: t('admin_chart_label_num_products'),
                data: Object.values(categoryCount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(99, 255, 132, 0.6)',
                ],
            }],
        };
    }, [products, getSubCategoryById, t]);
    
    const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);

    const stats = [
        { title: t('admin_total_users'), value: users.length },
        { title: t('admin_total_products'), value: products.length },
        { title: t('admin_total_orders'), value: orders.length },
        { title: t('admin_total_revenue'), value: `€${totalRevenue.toFixed(2)}`},
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {stats.map(stat => (
                    <div key={stat.title} className="bg-white p-5 rounded-lg shadow">
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">{t('admin_chart_revenue_title')}</h3>
                    <Line options={chartOptions} data={revenueData} />
                </div>
                <div className="bg-white p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">{t('admin_chart_registrations_title')}</h3>
                    <Bar options={chartOptions} data={userRegistrationData} />
                </div>
            </div>
             <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">{t('admin_chart_categories_title')}</h3>
                <div className="max-w-md mx-auto">
                    <Pie data={categoryData} options={{...chartOptions, plugins: { legend: { position: 'right' }}}} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;