import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useProductContext } from '../context/ProductContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useCategory } from '../context/CategoryContext.tsx';
import { useSystemSettings } from '../context/SystemSettingsContext.tsx';
import Spinner from '../components/Spinner.tsx';
import type { Product, SellingMode, BankInfo, DeliveryOption } from '../types.ts';
import { GoogleGenAI, Type } from '@google/genai';
import EditProductModal from '../components/EditProductModal.tsx';

// Bank Info Modal
const BankInfoModal: React.FC<{
    onSave: (bankInfo: BankInfo) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const { t } = useLanguage();
    const [bankInfo, setBankInfo] = useState<BankInfo>({ accountHolder: '', iban: '', swift: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBankInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(bankInfo);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">{t('seller_bank_info_title')}</h2>
                    <p className="text-sm text-gray-600 mt-1">{t('seller_bank_info_desc')}</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_bank_account_holder')}</label>
                            <input type="text" name="accountHolder" value={bankInfo.accountHolder} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_bank_iban')}</label>
                            <input type="text" name="iban" value={bankInfo.iban} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_bank_swift')}</label>
                            <input type="text" name="swift" value={bankInfo.swift} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg">{t('seller_save_changes_button')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ListingFeePaymentModal: React.FC<{
    fee: number;
    onConfirm: () => void;
    onClose: () => void;
}> = ({ fee, onConfirm, onClose }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold">{t('seller_listing_fee_title')}</h3>
                    <p className="my-4 text-gray-600">{t('seller_listing_fee_desc', { fee: fee.toFixed(2) })}</p>
                    <p className="text-xs text-gray-500 italic mb-6">{t('advertise_purchase_simulation')}</p>
                    <div className="flex justify-center space-x-4">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg">{t('cancel')}</button>
                        <button onClick={onConfirm} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg">{t('seller_listing_fee_pay_button')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SellerProductCard: React.FC<{ product: Product; onDelete: () => void; onEdit: () => void; }> = ({ product, onDelete, onEdit }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-32 object-cover"
        loading="lazy"
      />
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
        <p className="text-base font-bold text-gray-900 mt-auto">€{product.price.toFixed(2)}</p>
        <div className="mt-3 flex space-x-2">
           <button
              onClick={onEdit}
              className="w-full py-2 px-3 text-sm rounded-md font-semibold transition-colors duration-300 bg-blue-600 hover:bg-blue-700 text-white"
              aria-label={`${t('seller_edit_product_button')} ${product.name}`}
            >
              {t('seller_edit_product_button')}
            </button>
            <button
              onClick={onDelete}
              className="w-full py-2 px-3 text-sm rounded-md font-semibold transition-colors duration-300 bg-red-600 hover:bg-red-700 text-white"
              aria-label={`${t('seller_delete_product_button')} ${product.name}`}
            >
              {t('seller_delete_product_button')}
            </button>
        </div>
      </div>
    </div>
  );
};


const SellerPage: React.FC = () => {
    const { user, getStoredUser, updateUserBankInfo } = useAuth();
    const { products, loading, addProduct, deleteProduct, updateProduct } = useProductContext();
    const { t } = useLanguage();
    const { addToast } = useToast();
    const { categories, loading: categoriesLoading } = useCategory();
    const { systemSettings } = useSystemSettings();

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isListingFeeModalOpen, setIsListingFeeModalOpen] = useState(false);
    
    const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');

    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        keywords: '',
        description: '',
        longDescription: '',
        categoryId: '',
        imageUrl: '',
        sellingMode: 'secure' as SellingMode,
        isGiveaway: false,
        deliveryOptions: [] as DeliveryOption[],
        shippingCost: '',
    });

    useEffect(() => {
        if (categories.length > 0) {
            const firstCategory = categories[0];
            setSelectedMainCategory(firstCategory.id);
            const firstSubCategory = firstCategory.subcategories[0];
            if (firstSubCategory) {
                 setNewProduct(prev => ({...prev, categoryId: firstSubCategory.id}));
            } else {
                 setNewProduct(prev => ({...prev, categoryId: firstCategory.id}));
            }
        }
    }, [categories]);

    const myProducts = useMemo(() => {
        if (!user) return [];
        return products.filter(p => p.sellerId === user.id)
                       .sort((a, b) => b.id - a.id);
    }, [products, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, type } = e.target;
        
        if (type === 'file') {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewProduct(prev => ({ ...prev, [name]: reader.result as string }));
                };
                reader.readAsDataURL(file);
            } else {
                setNewProduct(prev => ({ ...prev, [name]: '' }));
            }
        } else if (type === 'checkbox' && name === 'isGiveaway') {
             const checked = (e.target as HTMLInputElement).checked;
             setNewProduct(prev => ({ ...prev, isGiveaway: checked, price: checked ? '0' : prev.price }));
        } else {
            const { value } = e.target;
            setNewProduct(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSellingModeChange = (mode: SellingMode) => {
        setNewProduct(prev => ({...prev, sellingMode: mode, isGiveaway: mode === 'direct' ? prev.isGiveaway : false }));
    }

    const handleDeliveryOptionChange = (option: DeliveryOption) => {
        setNewProduct(prev => {
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
        // If there are subcategories, select the first one. Otherwise, use the main category id.
        setNewProduct(prev => ({...prev, categoryId: firstSub ? firstSub.id : mainCatId}));
    };
    
    const handleGenerateDescription = useCallback(async () => {
        if (!newProduct.name) {
            addToast(t('ai_no_product_name'), 'error');
            return;
        }
        if (!process.env.API_KEY) {
            addToast(t('ai_no_api_key'), 'error');
            return;
        }
        
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on the product name "${newProduct.name}" and keywords "${newProduct.keywords}", generate a short description and a long description for an online marketplace selling second-hand items. The item is used. The tone should be appealing to buyers looking for a good deal.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING, description: 'A catchy, one-sentence description.' },
                            longDescription: { type: Type.STRING, description: 'A detailed, paragraph-long description.' }
                        },
                        required: ['description', 'longDescription']
                    },
                },
            });

            const jsonResponse = JSON.parse(response.text);
            setNewProduct(prev => ({ ...prev, description: jsonResponse.description, longDescription: jsonResponse.longDescription }));

        } catch (error) {
            console.error("AI description generation failed:", error);
            addToast(t('ai_error_toast'), 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [newProduct.name, newProduct.keywords, addToast, t]);
    
    const finalizeProductSubmission = useCallback(() => {
        if (!user) return;

        if (newProduct.sellingMode === 'secure') {
            const storedUser = getStoredUser(user.id);
            if (!storedUser?.bankInfo?.iban) {
                setIsBankModalOpen(true);
                return; 
            }
        }
        const productData = {
            name: newProduct.name,
            price: parseFloat(newProduct.price) || 0,
            description: newProduct.description,
            longDescription: newProduct.longDescription,
            categoryId: newProduct.categoryId,
            imageUrl: newProduct.imageUrl || `https://picsum.photos/seed/new${Date.now()}/400/400`,
            sellingMode: newProduct.sellingMode,
            condition: 'used_good' as const,
            deliveryOptions: newProduct.deliveryOptions,
            shippingCost: newProduct.deliveryOptions.includes('shipping') && newProduct.shippingCost ? parseFloat(newProduct.shippingCost) : undefined,
        };
        
        addProduct(productData, user);
        addToast(t('seller_product_added_toast'), 'success');
        
        setNewProduct({ name: '', price: '', keywords: '', description: '', longDescription: '', categoryId: categories.length > 0 ? (categories[0].subcategories[0]?.id || categories[0].id) : '', imageUrl: '', sellingMode: 'secure', isGiveaway: false, deliveryOptions: [], shippingCost: '' });

    }, [user, newProduct, getStoredUser, addProduct, addToast, t, categories]);


    const handleAddSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        if (newProduct.deliveryOptions.length === 0) {
            addToast(t('seller_select_delivery_toast'), 'error');
            return;
        }
        
        const { enablePaidListings, freeListingThreshold, listingFee } = systemSettings;
        const price = parseFloat(newProduct.price) || 0;

        if (newProduct.isGiveaway) {
            finalizeProductSubmission();
            return;
        }

        const isFeeRequired = enablePaidListings && price > (freeListingThreshold ?? 0);
        if (isFeeRequired) {
            setIsListingFeeModalOpen(true);
            return;
        }

        finalizeProductSubmission();
    }, [user, newProduct, systemSettings, finalizeProductSubmission, t, addToast]);

    const handlePaymentSuccess = useCallback(() => {
        setIsListingFeeModalOpen(false);
        finalizeProductSubmission();
    }, [finalizeProductSubmission]);
    
    const handleBankInfoSave = useCallback((bankInfo: BankInfo) => {
        if(user) {
            updateUserBankInfo(user.id, bankInfo);
            setIsBankModalOpen(false);
            finalizeProductSubmission();
        }
    }, [user, updateUserBankInfo, finalizeProductSubmission]);

    const handleDelete = (productId: number) => {
        if (window.confirm(t('seller_delete_confirm'))) {
            if (user && deleteProduct(productId, user.id)) {
                addToast(t('seller_product_deleted_toast'), 'success');
            }
        }
    };
    
    const handleUpdate = (updatedData: any) => {
        if (editingProduct && user) {
            const parsedData = { ...updatedData, price: parseFloat(updatedData.price) };
            if(updateProduct(editingProduct.id, parsedData, user.id)) {
                addToast(t('seller_product_updated_toast'), 'success');
            }
            setEditingProduct(null);
        }
    };
    
    const currentSubcategories = useMemo(() => {
        return categories.find(c => c.id === selectedMainCategory)?.subcategories || [];
    }, [selectedMainCategory, categories]);

    if (loading || categoriesLoading) return <Spinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            {isBankModalOpen && <BankInfoModal onClose={() => setIsBankModalOpen(false)} onSave={handleBankInfoSave} />}
            {editingProduct && <EditProductModal product={editingProduct} onSave={handleUpdate} onClose={() => setEditingProduct(null)} />}
             {isListingFeeModalOpen && (
                <ListingFeePaymentModal 
                    fee={systemSettings.listingFee || 0}
                    onConfirm={handlePaymentSuccess}
                    onClose={() => setIsListingFeeModalOpen(false)}
                />
            )}

            <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('seller_page_title')}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">{t('seller_add_product_title')}</h2>
                        <form id="add-product-form" onSubmit={handleAddSubmit} className="space-y-4">
                            {/* Selling Mode Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">{t('seller_selling_mode')}</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <button type="button" onClick={() => handleSellingModeChange('secure')} className={`p-3 text-center rounded-md border-2 ${newProduct.sellingMode === 'secure' ? 'border-amazon-yellow bg-yellow-50' : 'bg-gray-100'}`}>
                                        <h4 className="font-bold text-sm">{t('seller_mode_secure')}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{t('seller_mode_secure_desc')}</p>
                                    </button>
                                    <button type="button" onClick={() => handleSellingModeChange('direct')} className={`p-3 text-center rounded-md border-2 ${newProduct.sellingMode === 'direct' ? 'border-amazon-yellow bg-yellow-50' : 'bg-gray-100'}`}>
                                        <h4 className="font-bold text-sm">{t('seller_mode_direct')}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{t('seller_mode_direct_desc')}</p>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_product_name')}</label>
                                <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
                            </div>
                            
                            {newProduct.sellingMode === 'direct' && (
                                <div className="flex items-center">
                                    <input id="is-giveaway" type="checkbox" name="isGiveaway" checked={newProduct.isGiveaway} onChange={handleInputChange} className="h-4 w-4 text-amazon-yellow border-gray-300 rounded focus:ring-amazon-yellow"/>
                                    <label htmlFor="is-giveaway" className="ml-2 block text-sm text-gray-900">{t('seller_giveaway_checkbox')}</label>
                                </div>
                            )}

                            {!newProduct.isGiveaway && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('form_price')}</label>
                                    <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required min="0" step="0.01" inputMode="decimal" />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('ai_keywords_label')} ({t('optional')})</label>
                                <input type="text" name="keywords" value={newProduct.keywords} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder={t('ai_keywords_placeholder')} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700">{t('product_description')}</label>
                                    <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !newProduct.name} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-wait">
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2l4.293-1.84a1 1 0 011.33.21l.5.866a1 1 0 01-.21 1.33l-4.293 1.84 1.182 2.756a1 1 0 01-.967 1.256h-1.182l-1.84 4.293a1 1 0 01-1.33.21l-.866-.5a1 1 0 01-.21-1.33L12.586 13H12a1 1 0 01-1-1v-1H9.854l-2.756 1.182a1 1 0 01-1.256-.967v-1.182L4.002 8.75a1 1 0 01-.21-1.33l.5-.866a1 1 0 011.33-.21L7.464 7.2 6.282 4.445A1 1 0 017.25 3h1.182l1.84-4.293a1 1 0 011.33-.21l.866.5a1 1 0 01.21 1.33L11.414 5H12a1 1 0 011 1V5a1 1 0 011-1h.001z" clipRule="evenodd" /></svg>
                                       <span>{isGenerating ? t('ai_generating') : t('ai_generate')}</span>
                                    </button>
                                </div>
                                <textarea name="description" value={newProduct.description} onChange={handleInputChange} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required></textarea>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_long_description')}</label>
                                <textarea name="longDescription" value={newProduct.longDescription} onChange={handleInputChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required></textarea>
                            </div>
                             <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('product_category')}</label>
                                    <select value={selectedMainCategory} onChange={handleMainCategoryChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3">
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{t(cat.nameKey)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('subcategory')}</label>
                                    <select name="categoryId" value={newProduct.categoryId} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" disabled={currentSubcategories.length === 0}>
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
                                                id={`delivery-${option}`}
                                                name="deliveryOptions"
                                                type="checkbox"
                                                checked={newProduct.deliveryOptions.includes(option)}
                                                onChange={() => handleDeliveryOptionChange(option)}
                                                className="h-4 w-4 text-amazon-yellow border-gray-300 rounded focus:ring-amazon-yellow"
                                            />
                                            <label htmlFor={`delivery-${option}`} className="ml-2 block text-sm text-gray-900">
                                                {t(`delivery_option_${option}`)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {newProduct.deliveryOptions.includes('shipping') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('form_shipping_cost')}</label>
                                    <input
                                        type="number"
                                        name="shippingCost"
                                        value={newProduct.shippingCost}
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
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">{t('form_product_image')}</label>
                                <input
                                    id="imageUrl"
                                    type="file"
                                    name="imageUrl"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amazon-yellow-light file:text-amazon-blue hover:file:bg-amazon-yellow cursor-pointer"
                                />
                            </div>
                            <button type="submit" className="w-full bg-amazon-yellow text-amazon-blue font-bold py-3 rounded-lg hover:bg-amazon-yellow-light transition-colors">
                                {t('seller_add_product_button')}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Preview</h3>
                        <div className="space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 no-scrollbar">
                            {newProduct.imageUrl ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
                                    <img src={newProduct.imageUrl} alt="Product preview" className="w-full h-auto object-cover rounded-md shadow-sm" />
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-center p-4">
                                    Your uploaded image will appear here.
                                </div>
                            )}
                            <div className="border-t pt-4 space-y-2">
                                <h4 className="font-bold text-lg text-gray-800 break-words">{newProduct.name || "Product Name"}</h4>
                                <p className="text-2xl font-bold text-gray-900">
                                    {newProduct.isGiveaway ? t('seller_giveaway_checkbox') : `€${newProduct.price || "0.00"}`}
                                </p>
                                <p className="text-sm text-gray-600 break-words">{newProduct.description || "Short description will be shown here."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">{t('seller_your_listings_title')}</h2>
                    {myProducts.length === 0 ? (
                        <p className="text-gray-600">{t('seller_no_listings')}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {myProducts.map(product => (
                                <SellerProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onDelete={() => handleDelete(product.id)}
                                    onEdit={() => setEditingProduct(product)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerPage;
