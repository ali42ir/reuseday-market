
import React, { useState, useMemo } from 'react';
import { useMarketing } from '../../context/MarketingContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import type { DiscountCode, Banner } from '../../types.ts';

const AdminMarketing: React.FC = () => {
    const { 
        discountCodes, 
        featuredProductIds, 
        banners,
        addDiscountCode, 
        deleteDiscountCode, 
        setFeaturedProductIds,
        addBanner,
        deleteBanner
    } = useMarketing();
    const { t } = useLanguage();
    const { addToast } = useToast();

    const [newCode, setNewCode] = useState({ code: '', percentage: '', startDate: '', expiryDate: '' });
    const [featuredIdsInput, setFeaturedIdsInput] = useState(featuredProductIds.join(', '));
    const [newBanner, setNewBanner] = useState({ imageUrl: '', linkUrl: '' });

    const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCode(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCode.code && newCode.percentage && newCode.startDate && newCode.expiryDate) {
            const success = addDiscountCode({
                code: newCode.code.toUpperCase(),
                percentage: parseFloat(newCode.percentage),
                startDate: newCode.startDate,
                expiryDate: newCode.expiryDate,
            });
            if (success) {
                addToast(t('admin_code_saved_toast'), 'success');
                setNewCode({ code: '', percentage: '', startDate: '', expiryDate: '' });
            } else {
                addToast("A code with this name already exists.", 'error');
            }
        }
    };

    const handleDeleteCode = (id: number) => {
        if (window.confirm(t('admin_code_delete_confirm'))) {
            deleteDiscountCode(id);
            addToast(t('admin_code_deleted_toast'), 'success');
        }
    };

    const handleSaveFeatured = (e: React.FormEvent) => {
        e.preventDefault();
        const ids = featuredIdsInput.split(',')
            .map(id => parseInt(id.trim(), 10))
            .filter(id => !isNaN(id));
        setFeaturedProductIds(ids);
        addToast(t('admin_settings_saved_toast'), 'success');
    };
    
    const handleBannerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewBanner(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddBanner = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBanner.imageUrl && newBanner.linkUrl) {
            addBanner(newBanner);
            setNewBanner({ imageUrl: '', linkUrl: '' });
            addToast('Banner added successfully!', 'success');
        }
    };
    
    const sortedCodes = useMemo(() => {
        return [...discountCodes].sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime());
    }, [discountCodes]);

    return (
        <div className="space-y-8">
            {/* Banner Management */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold mb-4">{t('admin_marketing_banners_title')}</h2>
                 <form onSubmit={handleAddBanner} className="space-y-3 mb-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_marketing_banner_image')}</label>
                            <input type="text" name="imageUrl" value={newBanner.imageUrl} onChange={handleBannerInputChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" placeholder="https://example.com/banner.jpg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_marketing_banner_link')}</label>
                            <input type="text" name="linkUrl" value={newBanner.linkUrl} onChange={handleBannerInputChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" placeholder="/category/electronics" required />
                        </div>
                     </div>
                     <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">{t('admin_marketing_banner_add')}</button>
                 </form>
                 <div className="space-y-2">
                     {banners.map(banner => (
                         <div key={banner.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                             <div className="flex items-center space-x-3">
                                 <img src={banner.imageUrl} alt="Banner" className="w-20 h-10 object-cover rounded"/>
                                 <div>
                                     <p className="text-sm font-medium">{t('admin_marketing_banner_link')}: <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{banner.linkUrl}</a></p>
                                 </div>
                             </div>
                             <button onClick={() => deleteBanner(banner.id)} className="text-red-500 hover:text-red-700">&times;</button>
                         </div>
                     ))}
                 </div>
            </div>

            {/* Featured Products Management */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">{t('admin_marketing_featured_title')}</h2>
                <p className="text-sm text-gray-600 mb-4">{t('admin_marketing_featured_desc')}</p>
                <form onSubmit={handleSaveFeatured} className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label htmlFor="featured-ids" className="sr-only">{t('admin_marketing_featured_title')}</label>
                        <input
                            id="featured-ids"
                            type="text"
                            value={featuredIdsInput}
                            onChange={(e) => setFeaturedIdsInput(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2"
                            placeholder={t('admin_marketing_featured_placeholder')}
                        />
                    </div>
                    <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg hover:bg-amazon-yellow-light transition-colors">
                        {t('admin_marketing_featured_save_button')}
                    </button>
                </form>
            </div>

            {/* Discount Code Management */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4">{t('admin_marketing_add_code')}</h3>
                        <form onSubmit={handleAddCode} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_discount_code')}</label>
                                <input type="text" name="code" value={newCode.code} onChange={handleCodeInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_discount_percentage')}</label>
                                <input type="number" name="percentage" value={newCode.percentage} onChange={handleCodeInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required min="1" max="100" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_discount_start_date')}</label>
                                <input type="date" name="startDate" value={newCode.startDate} onChange={handleCodeInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_discount_expiry')}</label>
                                <input type="date" name="expiryDate" value={newCode.expiryDate} onChange={handleCodeInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                            <button type="submit" className="w-full bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg hover:bg-amazon-yellow-light transition-colors">
                                {t('admin_code_add_button')}
                            </button>
                        </form>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">{t('admin_marketing_discounts_title')} ({sortedCodes.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_code_table_code')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_code_table_percentage')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_code_table_dates')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_code_table_status')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedCodes.map(code => {
                                        const now = new Date();
                                        now.setHours(0,0,0,0);
                                        const expiry = new Date(code.expiryDate);
                                        const start = new Date(code.startDate);
                                        const isExpired = now > expiry;
                                        const isPending = now < start;
                                        const isActive = !isExpired && !isPending;

                                        let statusText = t('admin_code_status_active');
                                        let statusClass = 'bg-green-100 text-green-800';
                                        if (isExpired) {
                                            statusText = t('admin_code_status_expired');
                                            statusClass = 'bg-red-100 text-red-800';
                                        } else if (isPending) {
                                            statusText = t('admin_code_status_pending');
                                            statusClass = 'bg-yellow-100 text-yellow-800';
                                        }

                                        return (
                                            <tr key={code.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{code.code}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.percentage}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(code.startDate).toLocaleDateString()} - {new Date(code.expiryDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                                        {statusText}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button onClick={() => handleDeleteCode(code.id)} className="text-red-600 hover:text-red-900">{t('admin_delete_button')}</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                             {sortedCodes.length === 0 && (
                                <p className="text-center py-4 text-gray-500">No discount codes have been created yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMarketing;