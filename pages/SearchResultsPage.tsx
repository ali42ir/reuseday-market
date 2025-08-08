

import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useCategory } from '../context/CategoryContext.tsx';
import ProductGrid from '../components/ProductGrid.tsx';
import Spinner from '../components/Spinner.tsx';
import Pagination from '../components/Pagination.tsx';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const NoResults: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-md">
      <div className="mx-auto h-24 w-24 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l6 6" />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-gray-800">{t('search_no_results_title')}</h2>
      <p className="mt-2 text-gray-500">{t('search_try_something_else')}</p>
      <div className="mt-6 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-700">{t('search_no_results_suggestions_title')}</h3>
        <ul className="list-disc list-inside text-gray-500 mt-2 space-y-1">
          <li>{t('search_no_results_suggestion1')}</li>
          <li>{t('search_no_results_suggestion2')}</li>
          <li>{t('search_no_results_suggestion3')}</li>
        </ul>
      </div>
      <Link to="/" className="mt-8 inline-block bg-amazon-yellow text-amazon-blue font-bold py-3 px-8 rounded-lg hover:bg-amazon-yellow-light transition-colors text-lg">
        {t('search_browse_categories')}
      </Link>
    </div>
  );
};


const SearchResultsPage: React.FC = () => {
  const query = useQuery();
  const searchQuery = query.get('q') || '';
  const categoryIdFromUrl = query.get('categoryId');
  const sellerIdFromUrl = query.get('sellerId');

  const { products: allProducts, searchProducts, getPaginatedProducts, loading } = useProductContext();
  const { t } = useLanguage();
  const { categories, getSubCategoryById } = useCategory();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  
  const allResults = useMemo(() => {
    if (sellerIdFromUrl) {
        return allProducts.filter(p => p.sellerId === Number(sellerIdFromUrl));
    }
    if (categoryIdFromUrl) {
        const mainCat = categories.find(c => c.id === categoryIdFromUrl);
        if (mainCat && mainCat.subcategories.length > 0) {
            const subCategoryIds = mainCat.subcategories.map(s => s.id);
            return allProducts.filter(p => subCategoryIds.includes(p.categoryId));
        } else {
            return allProducts.filter(p => p.categoryId === categoryIdFromUrl);
        }
    }
    return searchProducts(searchQuery);
  }, [searchQuery, categoryIdFromUrl, sellerIdFromUrl, categories, allProducts, searchProducts]);
  

  const processedResults = useMemo(() => {
    let results = [...allResults];

    switch (sortOption) {
        case 'price_asc':
            results.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            results.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            results.sort((a, b) => b.id - a.id);
            break;
        case 'relevance':
        default:
            break;
    }
    
    return results;

  }, [allResults, sortOption]);

  const { products: paginatedResults, totalPages } = useMemo(() => {
    return getPaginatedProducts(processedResults, currentPage);
  }, [processedResults, currentPage, getPaginatedProducts]);

  const pageTitle = useMemo(() => {
      if (loading) return t('search_searching');
      if (sellerIdFromUrl) {
          const sellerName = allResults.length > 0 ? allResults[0].sellerName : '';
          return t('search_results_for_seller', { name: sellerName });
      }
      if (categoryIdFromUrl) {
          const catInfo = getSubCategoryById(categoryIdFromUrl);
          if (catInfo) {
              return t(catInfo.subcategory.nameKey);
          }
          const mainCat = categories.find(c => c.id === categoryIdFromUrl);
          if (mainCat) {
              return t(mainCat.nameKey);
          }
      }
      if (searchQuery) {
          return <>
            {t('search_results_for', { count: processedResults.length, query: '' })}
            <span className="text-gray-900">"{searchQuery}"</span>
          </>;
      }
      return t('search_results_for', { count: processedResults.length, query: '' });
  }, [loading, categoryIdFromUrl, searchQuery, sellerIdFromUrl, processedResults.length, getSubCategoryById, categories, t, allResults]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {pageTitle}
        </h1>
        <div>
            <label htmlFor="sort-options" className="sr-only">{t('sort_by')}</label>
            <select
                id="sort-options"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="p-2 border-gray-300 rounded-md shadow-sm"
            >
                <option value="relevance">{t('sort_relevance')}</option>
                <option value="price_asc">{t('sort_price_low_high')}</option>
                <option value="price_desc">{t('sort_price_high_low')}</option>
                <option value="newest">{t('sort_newest')}</option>
            </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
            {paginatedResults.length > 0 ? (
                <>
                    <ProductGrid products={paginatedResults} />
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
             ) : (
                <NoResults />
            )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
