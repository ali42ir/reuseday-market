
import React, { createContext, useContext, useCallback } from 'react';
import type { Category as CategoryType, SubCategory } from '../types.ts';
import { categoryData } from '../data/categories.ts';

interface CategoryContextType {
  categories: CategoryType[];
  loading: boolean;
  getCategoryById: (id: string) => CategoryType | undefined;
  getSubCategoryById: (subCategoryId: string) => { subcategory: SubCategory; parent: CategoryType } | undefined;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const categories = categoryData;
    const loading = false; // It's static now.

    const getCategoryById = useCallback((id: string) => {
      return categories.find(c => c.id === id);
    }, [categories]);

    const getSubCategoryById = useCallback((subCategoryId: string) => {
        for (const category of categories) {
            const sub = category.subcategories.find(s => s.id === subCategoryId);
            if (sub) return { subcategory: sub, parent: category };
        }
        return undefined;
    }, [categories]);

    const value = { categories, loading, getCategoryById, getSubCategoryById };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
}

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategory must be used within a CategoryProvider');
    }
    return context;
}