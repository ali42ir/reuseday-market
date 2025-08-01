import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import ProductGrid from '../components/ProductGrid.tsx';
import Spinner from '../components/Spinner.tsx';
import Pagination from '../components/Pagination.tsx';
import SearchFilters from '../components/SearchFilters.tsx';
import type { Product, ProductCondition } from '../types.ts';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage: React.FC = () => {
  const query = useQuery();
  const searchQuery = query.get('q') || '';
  const { searchProducts, getPaginatedProducts, loading } = useProductContext();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<{
    condition: ProductCondition | 'all';
    priceRange: { min: number, max: number };
  }>({
    condition: 'all',
    priceRange: { min: 0, max: 10000 }
  });
  
  const allResults = useMemo(() => searchProducts(searchQuery), [searchQuery, searchProducts]);
  
  const maxPrice = useMemo(() => {
    if (allResults.length === 0) return 1000;
    return Math.ceil(Math.max(...allResults.map(p => p.price)));
  }, [allResults]);

  const processedResults = useMemo(() => {
    let results = allResults.filter(product => {
      const conditionMatch = filters.condition === 'all' || product.condition === filters.condition;
      const priceMatch = product.price >= filters.priceRange.min && product.price <= filters.priceRange.max;
      return conditionMatch && priceMatch;
    });

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
            // The initial search already provides relevance-based ordering
            break;
    }
    
    return results;

  }, [allResults, filters, sortOption]);


  const { products: paginatedResults, totalPages } = useMemo(() => {
    return getPaginatedProducts(processedResults, currentPage);
  }, [processedResults, currentPage, getPaginatedProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {loading 
              ? t('search_searching')
              : t('search_results_for', { count: processedResults.length, query: '' })
          }
          {!loading && <span className="text-gray-900">"{searchQuery}"</span>}
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
      ) : allResults.length > 0 ? (
        <>
            <SearchFilters onFilterChange={setFilters} maxPrice={maxPrice} />
            <ProductGrid products={paginatedResults} />
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-600">{t('search_no_products')}</p>
            <p className="text-gray-500 mt-2">{t('search_try_something_else')}</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;