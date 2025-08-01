import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import type { Product, User, SellingMode, ProductCondition, Question } from '../types.ts';
import { useUserNotification } from './UserNotificationContext.tsx';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  getProductById: (id: number) => Product | undefined;
  searchProducts: (query: string) => Product[];
  getPaginatedProducts: (sourceProducts: Product[], page: number) => { products: Product[]; totalPages: number; };
  addProduct: (productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'sellerId' | 'sellerName' | 'questions'>, user: User) => Product;
  deleteProduct: (productId: number, userId: number) => boolean;
  updateProduct: (productId: number, updatedData: Partial<Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewCount' | 'reviews' | 'questions'>>, userId: number) => boolean;
  deleteProductAsAdmin: (productId: number) => boolean;
  deleteProductsByUserId: (userId: number) => boolean;
  addQuestionToProduct: (productId: number, questionText: string, asker: User) => void;
  addAnswerToQuestion: (productId: number, questionId: number, answerText: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialMockProducts: Omit<Product, 'id' | 'questions'>[] = [
  {
    name: 'Modern Wireless Headphones', price: 199.99, description: 'High-fidelity sound with noise cancellation.',
    longDescription: 'Experience immersive sound with these state-of-the-art wireless headphones. Featuring active noise cancellation, a 20-hour battery life, and a comfortable, lightweight design for all-day wear. Connects seamlessly via Bluetooth 5.0.',
    category: 'Electronics', rating: 4.5, reviewCount: 1250, imageUrl: 'https://picsum.photos/seed/product1/400/400',
    reviews: [
      { id: 1, author: 'Alex', rating: 5, title: 'Amazing Sound!', text: 'Best headphones I have ever owned. The noise cancellation is a game changer.', date: '2023-10-15' },
      { id: 2, author: 'Maria', rating: 4, title: 'Great, but...', text: 'Sound is fantastic, but they feel a bit tight after a few hours.', date: '2023-10-12' },
    ],
    sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'used_like_new'
  },
  {
    name: 'Classic Leather Watch', price: 350.00, description: 'Elegant timepiece with a genuine leather strap.',
    longDescription: 'A timeless accessory for any occasion. This classic watch boasts a stainless steel case, sapphire crystal glass, and a precision quartz movement. The genuine leather strap adds a touch of sophistication and comfort.',
    category: 'Fashion', rating: 4.8, reviewCount: 850, imageUrl: 'https://picsum.photos/seed/product2/400/400',
    reviews: [{ id: 3, author: 'John D.', rating: 5, title: 'Pure Elegance', text: 'This watch is stunning. Looks even better in person. I get compliments all the time.', date: '2023-09-20' }],
    sellerId: 2, sellerName: 'John Doe', sellingMode: 'secure', condition: 'used_good'
  },
  {
    name: 'Smart Home Hub', price: 99.50, description: 'Control your smart devices with your voice.',
    longDescription: 'The central hub for your smart home. Control lights, thermostats, locks, and more with simple voice commands. Compatible with Alexa, Google Assistant, and Apple HomeKit. Easy setup and a user-friendly app.',
    category: 'Home & Garden', rating: 4.3, reviewCount: 2300, imageUrl: 'https://picsum.photos/seed/product3/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'new'
  },
  {
    name: 'Ergonomic Office Chair', price: 275.00, description: 'Stay comfortable and productive all day long.',
    longDescription: 'Designed for maximum comfort and support, this ergonomic office chair features adjustable lumbar support, armrests, and height. The breathable mesh back keeps you cool, while the durable casters roll smoothly on any surface.',
    category: 'Home & Garden', rating: 4.6, reviewCount: 980, imageUrl: 'https://picsum.photos/seed/product4/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'direct', condition: 'used_acceptable'
  },
];

const PRODUCTS_PER_PAGE = 8;
const STORAGE_KEY = 'reuseday_products_v2';

const getInitialProducts = (): Product[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.length > 0 && parsed[0].condition) {
                 return parsed;
            }
        }
    } catch (e) { console.error("Failed to parse products from localStorage", e); }
    const productsWithIds = initialMockProducts.map((p, i) => ({...p, id: i + 1, questions: []}));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productsWithIds));
    return productsWithIds;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useUserNotification();

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(getInitialProducts());
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
      setProducts(updatedProducts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  };

  const getProductById = useCallback((id: number) => {
    return products.find(p => p.id === id);
  }, [products]);
  
  const searchProducts = useCallback((query: string) => {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(lowerCaseQuery) || 
        p.description.toLowerCase().includes(lowerCaseQuery) ||
        p.category.toLowerCase().includes(lowerCaseQuery)
    );
  }, [products]);

  const getPaginatedProducts = useCallback((sourceProducts: Product[], page: number) => {
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return {
      products: sourceProducts.slice(startIndex, endIndex),
      totalPages: Math.ceil(sourceProducts.length / PRODUCTS_PER_PAGE),
    };
  }, []);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'sellerId' | 'sellerName' | 'questions'>, user: User) => {
      const newProduct: Product = {
          ...productData,
          id: Date.now(),
          rating: 0,
          reviewCount: 0,
          reviews: [],
          sellerId: user.id,
          sellerName: user.name,
          questions: [],
          condition: 'used_good' // default
      };
      
      saveProducts([...products, newProduct]);
      return newProduct;
  }, [products]);

  const deleteProduct = useCallback((productId: number, userId: number) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete || productToDelete.sellerId !== userId) {
        console.error("Unauthorized or product not found");
        return false;
    }
    saveProducts(products.filter(p => p.id !== productId));
    return true;
  }, [products]);

  const updateProduct = useCallback((
      productId: number,
      updatedData: Partial<Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewCount' | 'reviews' | 'questions'>>,
      userId: number
    ): boolean => {
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1 || products[productIndex].sellerId !== userId) return false;

        const newUpdatedProduct = { ...products[productIndex], ...updatedData };
        const updatedProductsList = [...products];
        updatedProductsList[productIndex] = newUpdatedProduct;

        saveProducts(updatedProductsList);
        return true;
    }, [products]);

  const deleteProductAsAdmin = useCallback((productId: number) => {
      saveProducts(products.filter(p => p.id !== productId));
      return true;
  }, [products]);

  const deleteProductsByUserId = useCallback((userId: number) => {
      saveProducts(products.filter(p => p.sellerId !== userId));
      return true;
  }, [products]);
  
  const addQuestionToProduct = useCallback((productId: number, questionText: string, asker: User) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newQuestion: Question = {
        id: Date.now(),
        text: questionText,
        askerName: asker.name,
        askerId: asker.id,
        createdAt: new Date().toISOString(),
    };
    const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, questions: [...p.questions, newQuestion] } : p
    );
    saveProducts(updatedProducts);

    // Notify the seller
    if (product.sellerId !== asker.id) {
        addNotification(product.sellerId, {
            type: 'new_question_answer',
            message: `You have a new question on "{{productName}}".`,
            replacements: { productName: product.name },
            link: `/profile/questions`
        });
    }

  }, [products, addNotification]);
  
  const addAnswerToQuestion = useCallback((productId: number, questionId: number, answerText: string) => {
      let askerId: number | null = null;
      let productName: string | null = null;

      const updatedProducts = products.map(p => {
          if (p.id === productId) {
              const updatedQuestions = p.questions.map(q => {
                  if (q.id === questionId) {
                      askerId = q.askerId;
                      productName = p.name;
                      return { ...q, answer: answerText };
                  }
                  return q;
              });
              return { ...p, questions: updatedQuestions };
          }
          return p;
      });
      saveProducts(updatedProducts);

      // Notify the asker
      if (askerId && productName) {
          addNotification(askerId, {
              type: 'new_question_answer',
              message: 'notification_new_question_answer',
              replacements: { productName },
              link: `/product/${productId}`
          });
      }
  }, [products, addNotification]);

  const value = { products, loading, getProductById, searchProducts, getPaginatedProducts, addProduct, deleteProduct, updateProduct, deleteProductAsAdmin, deleteProductsByUserId, addQuestionToProduct, addAnswerToQuestion };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};