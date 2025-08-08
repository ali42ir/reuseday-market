
import React, { useMemo } from 'react';
import { useMarketing } from '../../context/MarketingContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import type { Advertisement, AdStatus } from '../../types.ts';

const statusColors: { [key in AdStatus]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
};

const AdminAdvertisements: React.FC = () => {
    const { advertisements, approveAdvertisement, rejectAdvertisement } = useMarketing();
    const { t, language } = useLanguage();

    const sortedAdvertisements = useMemo(() => {
        return [...advertisements].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [advertisements]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(language, { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{t('admin_tab_advertisements')} ({advertisements.length})</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('form_company_name')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_user_name')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('ad_table_package')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('ad_table_submitted')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('ad_table_expires')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_status')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedAdvertisements.map(ad => (
                            <tr key={ad.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ad.companyName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.uploaderName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{ad.adPackage}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(ad.submittedAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.expiresAt ? formatDate(ad.expiresAt) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ad.status]}`}>
                                        {t(`ad_status_${ad.status}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {ad.status === 'pending' && (
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => approveAdvertisement(ad.id)} className="text-green-600 hover:text-green-900">{t('ad_action_approve')}</button>
                                            <button onClick={() => rejectAdvertisement(ad.id)} className="text-red-600 hover:text-red-900">{t('ad_action_reject')}</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedAdvertisements.length === 0 && (
                    <p className="text-center py-8 text-gray-500">{t('ad_table_no_ads')}</p>
                )}
            </div>
        </div>
    );
};

export default AdminAdvertisements;