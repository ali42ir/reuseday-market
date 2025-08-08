
import React from 'react';
import { useCategory } from '../../context/CategoryContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

const AdminCategories: React.FC = () => {
    const { categories } = useCategory();
    const { t } = useLanguage();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{t('admin_categories_title')} ({categories.length})</h2>
            <p className="text-sm text-gray-600 mb-6">Categories are now managed statically within the application code to ensure a consistent structure.</p>
            <div className="space-y-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="border p-4 rounded-lg bg-gray-50">
                        <h3 className="font-bold text-gray-800">{t(cat.nameKey)}</h3>
                        {cat.subcategories.length > 0 && (
                            <ul className="mt-2 pl-6 list-disc text-sm text-gray-700 space-y-1">
                                {cat.subcategories.map(sub => (
                                    <li key={sub.id}>{t(sub.nameKey)}</li>
                                ))}
                            </ul>
                        )}
                         {cat.subcategories.length === 0 && (
                             <p className="mt-2 pl-6 text-sm text-gray-500 italic">No subcategories.</p>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCategories;
