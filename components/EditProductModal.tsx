
import React, { useState, useMemo, useEffect } from 'react';
import type { Product, DeliveryOption } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useCategory } from '../context/CategoryContext.tsx';

interface EditProductModalProps {
  product: Product;
  onSave: (updatedData: any) => void;
  onClose: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onSave, onClose }) => {
    const { t } = useLanguage();
    const { categories, getSubCategoryById } = useCategory();

    const [formData, setFormData] = useState({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        longDescription: product.longDescription,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        sellingMode: product.sellingMode,
        deliveryOptions: product.deliveryOptions || [],
        shippingCost: product.shippingCost?.toString() || '',
    });

    const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
    
    useEffect(() => {
        const catInfo = getSubCategoryById(product.categoryId);
        if (catInfo) {
            setSelectedMainCategory(catInfo.parent.id);
        } else {
            // It might be a main category itself (if it has no subcategories)
            setSelectedMainCategory(product.categoryId);
        }
    }, [product.categoryId, getSubCategoryById]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, type } = e.target;
        
        if (type === 'file') {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, [name]: reader.result as string }));
                };
                reader.readAsDataURL(file);
            }
        } else {
            const { value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDeliveryOptionChangeInModal = (option: DeliveryOption) => {
        setFormData(prev => {
            let options = [...prev.deliveryOptions];
            let cost = prev.shippingCost;

            if (options.includes(option)) {
                options = options.filter(o => o !== option);
            } else {
                options.push(option);
            }

            if (option === 'shipping' && options.includes('shipping')) {
                options = options.filter(o => o !== 'free_shipping');
            }
            if (option === 'free_shipping' && options.includes('free_shipping')) {
                options = options.filter(o => o !== 'shipping');
                cost = '';
            }

            if (!options.includes('shipping')) {
                cost = '';
            }
            
            return { ...prev, deliveryOptions: options, shippingCost: cost };
        });
    };

    const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mainCatId = e.target.value;
        setSelectedMainCategory(mainCatId);
        const mainCategory = categories.find(c => c.id === mainCatId);
        const firstSub = mainCategory?.subcategories[0];
        setFormData(prev => ({...prev, categoryId: firstSub ? firstSub.id : mainCatId}));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({
            ...formData,
            shippingCost: formData.deliveryOptions.includes('shipping') && formData.shippingCost ? parseFloat(formData.shippingCost) : undefined
        });
    };
    
    const currentSubcategories = useMemo(() => {
        return categories.find(c => c.id === selectedMainCategory)?.subcategories || [];
    }, [selectedMainCategory, categories]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">{t('seller_edit_modal_title')}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('form_product_name')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
                        </div>
                         {formData.sellingMode !== 'direct' || formData.price !== "0" ? (
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_price')}</label>
                                <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required min="0.01" step="0.01" inputMode="decimal" />
                            </div>
                         ) : null}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('product_description')}</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('form_long_description')}</label>
                            <textarea name="longDescription" value={formData.longDescription} onChange={handleInputChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required></textarea>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('product_category')}</label>
                                <select value={selectedMainCategory} onChange={handleMainCategoryChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3">
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{t(cat.nameKey)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('subcategory')}</label>
                                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" disabled={currentSubcategories.length === 0}>
                                    {currentSubcategories.length > 0 ? (
                                        currentSubcategories.map(sub => <option key={sub.id} value={sub.id}>{t(sub.nameKey)}</option>)
                                    ) : (
                                        <option value={selectedMainCategory}>{t(categories.find(c => c.id === selectedMainCategory)?.nameKey || '')}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('delivery_options_title')}</label>
                            <div className="mt-2 space-y-2">
                                {(['shipping', 'free_shipping', 'local_pickup'] as DeliveryOption[]).map(option => (
                                    <div key={option} className="flex items-center">
                                        <input
                                            id={`edit-delivery-${option}`}
                                            type="checkbox"
                                            checked={formData.deliveryOptions.includes(option)}
                                            onChange={() => handleDeliveryOptionChangeInModal(option)}
                                            className="h-4 w-4 text-amazon-yellow border-gray-300 rounded focus:ring-amazon-yellow"
                                        />
                                        <label htmlFor={`edit-delivery-${option}`} className="ml-2 block text-sm text-gray-900">
                                            {t(`delivery_option_${option}`)}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {formData.deliveryOptions.includes('shipping') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_shipping_cost')}</label>
                                <input
                                    type="number"
                                    name="shippingCost"
                                    value={formData.shippingCost}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3"
                                    required
                                    min="0"
                                    step="0.01"
                                    inputMode="decimal"
                                />
                            </div>
                        )}
                         <div>
                            <label htmlFor="imageUrlEdit" className="block text-sm font-medium text-gray-700">{t('form_product_image')}</label>
                            <input
                                id="imageUrlEdit"
                                type="file"
                                name="imageUrl"
                                accept="image/*"
                                onChange={handleInputChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amazon-yellow-light file:text-amazon-blue hover:file:bg-amazon-yellow cursor-pointer"
                            />
                            {formData.imageUrl && (
                                <div className="mt-4">
                                     <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                                    <img src={formData.imageUrl} alt="Product preview" className="h-32 w-32 object-cover rounded-md shadow-sm" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                            {t('cancel')}
                        </button>
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg hover:bg-amazon-yellow-light transition-colors">
                            {t('seller_save_changes_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;