import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useProductContext } from '../context/ProductContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useCategory } from '../context/CategoryContext.tsx';
import Spinner from '../components/Spinner.tsx';
import type { Product, SellingMode, BankInfo } from '../types.ts';
import { GoogleGenAI, Type } from '@google/genai';

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


// Edit Product Modal
const EditProductModal: React.FC<{
  product: Product;
  onSave: (updatedData: any) => void;
  onClose: () => void;
}> = ({ product, onSave, onClose }) => {
    const { t } = useLanguage();
    const { categories } = useCategory();
    const [formData, setFormData] = useState({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        longDescription: product.longDescription,
        category: product.category,
        imageUrl: product.imageUrl,
        sellingMode: product.sellingMode,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(formData);
    };

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
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('product_category')}</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3">
                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('form_image_url')}</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="https://example.com/image.png"/>
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

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        keywords: '',
        description: '',
        longDescription: '',
        category: categories.length > 0 ? categories[0].name : '',
        imageUrl: '',
        sellingMode: 'secure' as SellingMode,
        isGiveaway: false,
    });

    React.useEffect(() => {
        if (categories.length > 0 && !newProduct.category) {
            setNewProduct(prev => ({...prev, category: categories[0].name}));
        }
    }, [categories, newProduct.category]);

    const myProducts = useMemo(() => {
        if (!user) return [];
        return products.filter(p => p.sellerId === user.id)
                       .sort((a, b) => b.id - a.id);
    }, [products, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setNewProduct(prev => ({ ...prev, isGiveaway: checked, price: checked ? '0' : prev.price }));
        } else {
            setNewProduct(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSellingModeChange = (mode: SellingMode) => {
        setNewProduct(prev => ({...prev, sellingMode: mode, isGiveaway: mode === 'direct' ? prev.isGiveaway : false }));
    }

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

    const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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
            price: parseFloat(newProduct.price),
            description: newProduct.description,
            longDescription: newProduct.longDescription,
            category: newProduct.category,
            imageUrl: newProduct.imageUrl || `https://picsum.photos/seed/new${Date.now()}/400/400`,
            sellingMode: newProduct.sellingMode,
            condition: 'used_good' as const, // Default condition
        };
        
        addProduct(productData, user);
        addToast(t('seller_product_added_toast'), 'success');
        
        setNewProduct({ name: '', price: '', keywords: '', description: '', longDescription: '', category: categories.length > 0 ? categories[0].name : '', imageUrl: '', sellingMode: 'secure', isGiveaway: false });
    };
    
    const handleBankInfoSave = (bankInfo: BankInfo) => {
        if(user) {
            updateUserBankInfo(user.id, bankInfo);
            setIsBankModalOpen(false);
            const form = document.getElementById('add-product-form');
            if (form instanceof HTMLFormElement) {
                form.requestSubmit();
            }
        }
    };

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
    

    if (loading || categoriesLoading) return <Spinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            {isBankModalOpen && <BankInfoModal onClose={() => setIsBankModalOpen(false)} onSave={handleBankInfoSave} />}
            {editingProduct && <EditProductModal product={editingProduct} onSave={handleUpdate} onClose={() => setEditingProduct(null)} />}

            <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('seller_page_title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                        <h2 className="text-xl font-bold mb-4">{t('seller_add_product_title')}</h2>
                        <form id="add-product-form" onSubmit={handleAddSubmit} className="space-y-4">
                            {/* Selling Mode Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">{t('seller_selling_mode')}</label>
                                <div className="grid grid-cols-2 gap-2">
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
                                    <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required min="0.01" step="0.01" inputMode="decimal" />
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('product_category')}</label>
                                <select name="category" value={newProduct.category} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3">
                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_image_url')} ({t('optional')})</label>
                                <input type="url" name="imageUrl" value={newProduct.imageUrl} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="https://example.com/image.png"/>
                            </div>
                            <button type="submit" className="w-full bg-amazon-yellow text-amazon-blue font-bold py-3 rounded-lg hover:bg-amazon-yellow-light transition-colors">
                                {t('seller_add_product_button')}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
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
        </div>
    );
};

export default SellerPage;