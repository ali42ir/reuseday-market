
import React, { useState } from 'react';
import { useCategory } from '../../context/CategoryContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import type { Category } from '../../types.ts';

const UpArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L10 9.414l2.293 2.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
    </svg>
);
const DownArrowIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.707a1 1 0 001.414 1.414l3-3a1 1 0 00-1.414-1.414L10 10.586 7.707 8.293a1 1 0 00-1.414 1.414l3 3z" clipRule="evenodd" />
    </svg>
);


const AdminCategories: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, moveCategory } = useCategory();
    const { t } = useLanguage();
    const { addToast } = useToast();

    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIconUrl, setNewCategoryIconUrl] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim(), newCategoryIconUrl.trim());
            addToast(t('admin_category_saved_toast'), 'success');
            setNewCategoryName('');
            setNewCategoryIconUrl('');
        }
    };

    const handleUpdateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateCategory(editingCategory.id, { 
                name: editingCategory.name, 
                iconUrl: editingCategory.iconUrl 
            });
            addToast(t('admin_category_saved_toast'), 'success');
            setEditingCategory(null);
        }
    };

    const handleDeleteCategory = (id: number) => {
        if (window.confirm(t('admin_category_delete_confirm'))) {
            deleteCategory(id);
            addToast(t('admin_category_deleted_toast'), 'success');
        }
    };

    const startEditing = (category: Category) => {
        setEditingCategory({ ...category });
    };

    const cancelEditing = () => {
        setEditingCategory(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">{editingCategory ? "Edit Category" : t('admin_categories_add')}</h3>
                    <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_category_name')}</label>
                            <input
                                type="text"
                                value={editingCategory ? editingCategory.name : newCategoryName}
                                onChange={(e) => editingCategory ? setEditingCategory({...editingCategory, name: e.target.value}) : setNewCategoryName(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_category_icon_url')}</label>
                            <input
                                type="text"
                                value={editingCategory ? (editingCategory.iconUrl || '') : newCategoryIconUrl}
                                onChange={(e) => editingCategory ? setEditingCategory({...editingCategory, iconUrl: e.target.value}) : setNewCategoryIconUrl(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="https://example.com/icon.svg"
                            />
                        </div>
                        <div className="flex space-x-2">
                           <button type="submit" className="w-full bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg hover:bg-amazon-yellow-light transition-colors">
                               {editingCategory ? t('seller_save_changes_button') : t('admin_category_add_button')}
                           </button>
                           {editingCategory && (
                                <button type="button" onClick={cancelEditing} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                    {t('cancel')}
                                </button>
                           )}
                        </div>
                    </form>
                </div>
            </div>
            <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">{t('admin_categories_title')} ({categories.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_category_order')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_category_name')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map((cat, index) => (
                                    <tr key={cat.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <button onClick={() => moveCategory(cat.id, 'up')} disabled={index === 0} className="disabled:opacity-20 text-gray-500 hover:text-blue-600"><UpArrowIcon/></button>
                                                <button onClick={() => moveCategory(cat.id, 'down')} disabled={index === categories.length - 1} className="disabled:opacity-20 text-gray-500 hover:text-blue-600"><DownArrowIcon /></button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                           {cat.iconUrl && <img src={cat.iconUrl} alt="" className="h-5 w-5 mr-3" />}
                                           {cat.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                            <button onClick={() => startEditing(cat)} className="text-blue-600 hover:text-blue-900">{t('seller_edit_product_button')}</button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:text-red-900">{t('admin_delete_button')}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
