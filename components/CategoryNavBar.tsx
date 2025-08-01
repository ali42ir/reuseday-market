
import React from 'react';
import { Link } from 'react-router-dom';
import { useCategory } from '../context/CategoryContext.tsx';

const DefaultIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-80" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" />
        <path d="M5 12a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" />
    </svg>
);


const CategoryNavBar: React.FC = () => {
  const { categories, loading } = useCategory();

  if (loading) {
    return (
      <nav className="bg-amazon-blue-light h-[44px] sticky top-16 z-40" style={{top: '4rem'}}></nav>
    );
  }

  return (
    <nav className="bg-amazon-blue-light text-white shadow-sm sticky top-16 z-40" style={{top: '4rem'}}>
      <div className="container mx-auto px-4">
        {/* Basic scrollbar styling for webkit browsers */}
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto whitespace-nowrap py-2 text-sm font-medium no-scrollbar">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/search?q=${encodeURIComponent(category.name)}`}
              className="flex items-center px-3 py-1 hover:outline outline-1 outline-white rounded-sm transition-all duration-200"
            >
              {category.iconUrl ? (
                <img src={category.iconUrl} alt="" className="h-4 w-4 mr-1.5" />
              ) : <DefaultIcon />}
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNavBar;
