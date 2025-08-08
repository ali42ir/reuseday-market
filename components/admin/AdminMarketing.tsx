import React, { useState, useMemo, useEffect } from 'react';
import { useMarketing } from '../../context/MarketingContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import type { DiscountCode, Banner } from '../../types.ts';

const EditCodeModal: React.FC<{ code: DiscountCode; onSave: (id: number, data: Partial<DiscountCode>) => void; onClose: () => void; }> = ({ code, onSave, onClose }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        code: code.code,
        percentage: code.percentage.toString(),
        startDate: code.startDate,
        expiryDate: code.expiryDate
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(code.id, {
            ...formData,
            percentage: parseFloat(formData.percentage)
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold p-6 border-b">{t('admin_edit_code_title')}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('form_discount_code')}</label>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('form_discount_percentage')}</label>
                            <input type="number" name="percentage" value={formData.percentage} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required min="1" max="100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('form_discount_start_date')}</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('form_discount_expiry')}</label>
                            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg">{t('seller_save_changes_button')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditBannerModal: React.FC<{ banner: Banner; onSave: (id: number, data: Partial<Omit<Banner, 'id'>>) => void; onClose: () => void; }> = ({ banner, onSave, onClose }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
    });

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(banner.id, formData);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold p-6 border-b">{t('admin_edit_banner_title')}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_marketing_banner_image')}</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">{t('admin_marketing_banner_link')}</label>
                           <input type="text" name="linkUrl" value={formData.linkUrl} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                        </div>
                    </div>
                     <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg">{t('seller_save_changes_button')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminMarketing: React.FC = () => {
    const { 
        discountCodes, 
        featuredProductIds, 
        addDiscountCode, 
        updateDiscountCode,
        deleteDiscountCode, 
        setFeaturedProductIds,
    } = useMarketing();
    const { t } = useLanguage();
    const { addToast } = useToast();

    const [newCode, setNewCode] = useState({ code: '', percentage: '', startDate: '', expiryDate: '' });
    const [featuredIdsInput, setFeaturedIdsInput] = useState(featuredProductIds.join(', '));
    const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);

    useEffect(() => {
        setFeaturedIdsInput(featuredProductIds.join(', '));
    }, [featuredProductIds]);

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
    
    const sortedCodes = useMemo(() => {
        return [...discountCodes].sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime());
    }, [discountCodes]);

    return (
        <div className="space-y-8">
            {editingCode && <EditCodeModal code={editingCode} onSave={updateDiscountCode} onClose={() => setEditingCode(null)} />}
            
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                    <button onClick={() => setEditingCode(code)} className="text-blue-600 hover:text-blue-900">{t('seller_edit_product_button')}</button>
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