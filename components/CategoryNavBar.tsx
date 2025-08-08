import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategory } from '../context/CategoryContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

const CategoryNavBar: React.FC = () => {
  const { categories, loading } = useCategory();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleMouseEnter = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.subcategories.length > 0) {
      setActiveCategory(categoryId);
    } else {
      // If a category without a dropdown is hovered, close any open dropdown.
      setActiveCategory(null);
    }
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  if (loading) {
    return <nav className="bg-amazon-blue-light h-[44px] sticky top-16 z-40" style={{top: '4rem'}}></nav>;
  }

  return (
    <nav 
      className="bg-amazon-blue-light text-white shadow-sm sticky top-16 z-40" 
      style={{top: '4rem'}} 
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto px-4">
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-down { animation: fade-in-down 0.2s ease-out; }
        `}</style>
        <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto whitespace-nowrap py-2 text-sm font-medium no-scrollbar">
          {categories.map((category) => (
            <div 
              key={category.id} 
              onMouseEnter={() => handleMouseEnter(category.id)}
              className="py-1" // Creates a larger hover target area
            >
              <Link
                to={`/search?categoryId=${category.id}`}
                className="flex items-center px-3 py-1 hover:outline outline-1 outline-white rounded-sm transition-all duration-200"
              >
                {t(category.nameKey)}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {activeCategoryData && (
        <div
          className="absolute left-0 w-full bg-white text-gray-800 shadow-lg z-30 animate-fade-in-down"
          onMouseEnter={() => handleMouseEnter(activeCategoryData.id)} // Keep menu open when hovering over it
        >
          <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main category link */}
                <div className="col-span-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 border-b-2 border-amazon-yellow pb-2">{t(activeCategoryData.nameKey)}</h3>
                    <Link
                        to={`/search?categoryId=${activeCategoryData.id}`}
                        onClick={handleMouseLeave} // Close menu on click
                        className="block text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {t('filter_all_in_category', { categoryName: t(activeCategoryData.nameKey) })}
                    </Link>
                </div>
                {/* Subcategories */}
                <div className="col-span-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
                    {activeCategoryData.subcategories.map(sub => (
                      <Link
                        key={sub.id}
                        to={`/search?categoryId=${sub.id}`}
                        onClick={handleMouseLeave} // Close menu on click
                        className="block text-sm hover:text-amazon-yellow transition-colors py-1"
                      >
                        {t(sub.nameKey)}
                      </Link>
                    ))}
                </div>
              </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default CategoryNavBar;
