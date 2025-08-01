
import React, { useState, useEffect } from 'react';
import type { ProductCondition } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface SearchFiltersProps {
    onFilterChange: (filters: { condition: ProductCondition | 'all'; priceRange: { min: number; max: number; } }) => void;
    maxPrice: number;
}

const conditions: (ProductCondition | 'all')[] = ['all', 'new', 'used_like_new', 'used_good', 'used_acceptable'];

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange, maxPrice }) => {
    const { t } = useLanguage();
    const [condition, setCondition] = useState<ProductCondition | 'all'>('all');
    const [price, setPrice] = useState(maxPrice);
    
    useEffect(() => {
        setPrice(maxPrice); // Reset price when maxPrice changes (e.g., new search results)
    }, [maxPrice]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            onFilterChange({
                condition,
                priceRange: { min: 0, max: price }
            });
        }, 300); // Debounce filter changes

        return () => clearTimeout(handler);
    }, [condition, price, onFilterChange]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="condition-filter" className="block text-sm font-medium text-gray-700 mb-1">{t('filter_by_condition')}</label>
                    <select
                        id="condition-filter"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as ProductCondition | 'all')}
                        className="w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"
                    >
                        {conditions.map(cond => (
                            <option key={cond} value={cond}>
                                {cond === 'all' ? t('filter_all_conditions') : t(`product_condition_${cond}`)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('filter_by_price_range')} (€0 - €{price.toFixed(0)})
                    </label>
                    <input
                        id="price-range"
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;