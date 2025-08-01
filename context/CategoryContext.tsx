
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Category } from '../types.ts';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  addCategory: (name: string, iconUrl?: string) => void;
  updateCategory: (id: number, updatedData: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: number) => void;
  moveCategory: (id: number, direction: 'up' | 'down') => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const STORAGE_KEY = 'reuseday_categories';

const initialMockCategories: Omit<Category, 'id'>[] = [
    { name: 'Electronics', order: 1 },
    { name: 'Fashion', order: 2 },
    { name: 'Home & Garden', order: 3 },
    { name: 'Books', order: 4 },
    { name: 'Toys & Games', order: 5 },
    { name: 'Sports', order: 6 },
    { name: 'Appliances', order: 7 },
];


const getInitialCategories = (): Category[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                 return parsed.sort((a, b) => a.order - b.order);
            }
        }
    } catch (e) {
        console.error("Failed to parse categories from localStorage", e);
    }
    const categoriesWithIds = initialMockCategories.map((c, i) => ({ ...c, id: i + 1 }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categoriesWithIds));
    return categoriesWithIds;
}

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCategories(getInitialCategories());
        setLoading(false);
    }, []);
    
    const saveCategories = (cats: Category[]) => {
        const sorted = cats.sort((a,b) => a.order - b.order);
        setCategories(sorted);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    }

    const addCategory = useCallback((name: string, iconUrl?: string) => {
        const newCategory: Category = {
            id: Date.now(),
            name,
            iconUrl: iconUrl || undefined,
            order: categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 1,
        };
        saveCategories([...categories, newCategory]);
    }, [categories]);

    const updateCategory = useCallback((id: number, updatedData: Partial<Omit<Category, 'id'>>) => {
        const updatedCategories = categories.map(c => c.id === id ? { ...c, ...updatedData } : c);
        saveCategories(updatedCategories);
    }, [categories]);
    
    const deleteCategory = useCallback((id: number) => {
        const updatedCategories = categories.filter(c => c.id !== id);
        saveCategories(updatedCategories);
    }, [categories]);
    
    const moveCategory = useCallback((id: number, direction: 'up' | 'down') => {
       const cats = [...categories];
       const index = cats.findIndex(c => c.id === id);
       if (index === -1) return;

       const swapIndex = direction === 'up' ? index - 1 : index + 1;
       if (swapIndex < 0 || swapIndex >= cats.length) return;

       // Swap order values
       const tempOrder = cats[index].order;
       cats[index].order = cats[swapIndex].order;
       cats[swapIndex].order = tempOrder;

       saveCategories(cats);
    }, [categories]);


    const value = { categories, loading, addCategory, updateCategory, deleteCategory, moveCategory };

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
