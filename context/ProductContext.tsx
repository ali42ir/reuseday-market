import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import type { Product, User, SellingMode, ProductCondition, Question, DeliveryOption, Review } from '../types.ts';
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
  updateProductAsAdmin: (productId: number, updatedData: Partial<Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewCount' | 'reviews' | 'questions'>>) => boolean;
  deleteProductAsAdmin: (productId: number) => boolean;
  deleteProductsByUserId: (userId: number) => boolean;
  addQuestionToProduct: (productId: number, questionText: string, asker: User) => void;
  addAnswerToQuestion: (productId: number, questionId: number, answerText: string) => void;
  addProductReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialMockProducts: Omit<Product, 'id' | 'questions'>[] = [
  {
    name: 'Modern Wireless Headphones', price: 199.99, description: 'High-fidelity sound with noise cancellation.',
    longDescription: 'Experience immersive sound with these state-of-the-art wireless headphones. Featuring active noise cancellation, a 20-hour battery life, and a comfortable, lightweight design for all-day wear. Connects seamlessly via Bluetooth 5.0.',
    categoryId: 'electronics-computers', rating: 4.5, reviewCount: 1250, imageUrl: 'https://picsum.photos/seed/product1/400/400',
    reviews: [
      { id: 1, userId: 1, author: 'Alex', rating: 5, title: 'Amazing Sound!', text: 'Best headphones I have ever owned. The noise cancellation is a game changer.', date: '2023-10-15' },
      { id: 2, userId: 2, author: 'Maria', rating: 4, title: 'Great, but...', text: 'Sound is fantastic, but they feel a bit tight after a few hours.', date: '2023-10-12' },
    ],
    sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'used_like_new',
    deliveryOptions: ['shipping', 'free_shipping'], shippingCost: 5.99
  },
  {
    name: 'Classic Leather Watch', price: 350.00, description: 'Elegant timepiece with a genuine leather strap.',
    longDescription: 'A timeless accessory for any occasion. This classic watch boasts a stainless steel case, sapphire crystal glass, and a precision quartz movement. The genuine leather strap adds a touch of sophistication and comfort.',
    categoryId: 'clothing-men', rating: 4.8, reviewCount: 850, imageUrl: 'https://picsum.photos/seed/product2/400/400',
    reviews: [{ id: 3, userId: 1, author: 'John D.', rating: 5, title: 'Pure Elegance', text: 'This watch is stunning. Looks even better in person. I get compliments all the time.', date: '2023-09-20' }],
    sellerId: 2, sellerName: 'John Doe', sellingMode: 'secure', condition: 'used_good',
    deliveryOptions: ['shipping', 'local_pickup'], shippingCost: 10.00
  },
  {
    name: 'Smart Home Hub', price: 99.50, description: 'Control your smart devices with your voice.',
    longDescription: 'The central hub for your smart home. Control lights, thermostats, locks, and more with simple voice commands. Compatible with Alexa, Google Assistant, and Apple HomeKit. Easy setup and a user-friendly app.',
    categoryId: 'electronics-appliances', rating: 4.3, reviewCount: 2300, imageUrl: 'https://picsum.photos/seed/product3/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'new',
    deliveryOptions: ['shipping'], shippingCost: 4.50
  },
  {
    name: 'Ergonomic Office Chair', price: 275.00, description: 'Stay comfortable and productive all day long.',
    longDescription: 'Designed for maximum comfort and support, this ergonomic office chair features adjustable lumbar support, armrests, and height. The breathable mesh back keeps you cool, while the durable casters roll smoothly on any surface.',
    categoryId: 'furniture-chairs', rating: 4.6, reviewCount: 980, imageUrl: 'https://picsum.photos/seed/product4/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'direct', condition: 'used_acceptable',
    deliveryOptions: ['local_pickup']
  },
  {
    name: 'Vintage Denim Jacket', price: 75.00, description: 'A timeless denim jacket with a classic fit.',
    longDescription: 'A must-have for any wardrobe, this vintage denim jacket features a classic button-front design, two chest pockets, and a perfectly worn-in feel. Ideal for layering in any season.',
    categoryId: 'clothing-women', rating: 4.9, reviewCount: 450, imageUrl: 'https://picsum.photos/seed/product5/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'secure', condition: 'used_good',
    deliveryOptions: ['shipping'], shippingCost: 8.00
  },
  {
    name: 'Wooden Dining Table', price: 450.00, description: 'Solid oak dining table, seats six comfortably.',
    longDescription: 'Gather your family and friends around this beautiful solid oak dining table. Its sturdy construction and timeless design make it a perfect centerpiece for any dining room. Seats up to six people.',
    categoryId: 'furniture-tables', rating: 4.7, reviewCount: 320, imageUrl: 'https://picsum.photos/seed/product6/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'direct', condition: 'used_like_new',
    deliveryOptions: ['local_pickup']
  },
  {
    name: 'Professional DSLR Camera', price: 850.00, description: 'Capture stunning photos with this 24MP DSLR.',
    longDescription: 'Take your photography to the next level with this professional-grade DSLR camera. It features a 24.2 MP sensor, full HD video recording, and a versatile 18-55mm kit lens. Perfect for both beginners and enthusiasts.',
    categoryId: 'electronics-computers', rating: 4.8, reviewCount: 650, imageUrl: 'https://picsum.photos/seed/product7/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'secure', condition: 'used_like_new',
    deliveryOptions: ['shipping', 'free_shipping'], shippingCost: 15.00
  },
  {
    name: '21-Speed Mountain Bike', price: 320.00, description: 'Durable mountain bike for all terrains.',
    longDescription: 'Conquer any trail with this durable 21-speed mountain bike. It features a lightweight aluminum frame, front suspension for a smooth ride, and powerful disc brakes for reliable stopping power.',
    categoryId: 'sports-outdoors-bicycles', rating: 4.4, reviewCount: 150, imageUrl: 'https://picsum.photos/seed/product8/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'direct', condition: 'used_good',
    deliveryOptions: ['local_pickup']
  },
  {
    name: 'Chef\'s Knife Set', price: 120.00, description: 'High-carbon stainless steel knife set.',
    longDescription: 'A complete set for any home chef. This 7-piece knife set is forged from high-carbon stainless steel for exceptional sharpness and durability. Includes a chef\'s knife, bread knife, santoku knife, and more, all housed in a stylish wooden block.',
    categoryId: 'home-kitchen-cookware', rating: 4.9, reviewCount: 880, imageUrl: 'https://picsum.photos/seed/product9/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'secure', condition: 'new',
    deliveryOptions: ['shipping', 'free_shipping'], shippingCost: 9.50
  },
  {
    name: 'Kids\' Wooden Building Blocks', price: 45.00, description: '100-piece set of colorful wooden blocks.',
    longDescription: 'Spark creativity and imagination with this 100-piece wooden building block set. Made from high-quality, non-toxic wood and painted with vibrant colors, these blocks are perfect for hours of creative play.',
    categoryId: 'toys-games', rating: 4.9, reviewCount: 1100, imageUrl: 'https://picsum.photos/seed/product10/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'used_like_new',
    deliveryOptions: ['shipping'], shippingCost: 7.00
  },
  {
    name: 'Bestselling Hardcover Novel', price: 15.00, description: 'A captivating mystery novel.',
    longDescription: 'Get lost in this gripping mystery novel that has topped bestseller lists worldwide. A thrilling plot with unforgettable characters that will keep you on the edge of your seat until the very last page.',
    categoryId: 'books-media', rating: 4.6, reviewCount: 3200, imageUrl: 'https://picsum.photos/seed/product11/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'secure', condition: 'used_good',
    deliveryOptions: ['shipping', 'free_shipping'], shippingCost: 3.50
  },
  {
    name: 'Cordless Power Drill Kit', price: 110.00, description: '18V cordless drill with two batteries.',
    longDescription: 'Tackle any DIY project with this powerful 18V cordless drill kit. It comes complete with two long-lasting lithium-ion batteries, a charger, and a variety of drill and driver bits, all in a convenient carrying case.',
    categoryId: 'tools-diy', rating: 4.7, reviewCount: 720, imageUrl: 'https://picsum.photos/seed/product12/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'used_like_new',
    deliveryOptions: ['shipping'], shippingCost: 12.00
  },
  {
    name: 'Comfortable Armchair', price: 0.00, description: 'Free armchair, perfect for a reading nook.',
    longDescription: 'A very comfortable armchair looking for a new home. It has some minor wear and tear but is structurally sound and incredibly cozy. Perfect for a student or anyone starting out. Must be picked up.',
    categoryId: 'free-stuff', rating: 4.5, reviewCount: 20, imageUrl: 'https://picsum.photos/seed/product13/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'direct', condition: 'used_acceptable',
    deliveryOptions: ['local_pickup']
  },
  {
    name: '55-Inch 4K Smart TV', price: 480.00, description: 'Immersive 4K visuals with smart features.',
    longDescription: 'Upgrade your home entertainment with this stunning 55-inch 4K Smart TV. Experience breathtaking picture quality with vibrant colors and sharp details. Built-in Wi-Fi and smart apps let you stream all your favorite content from Netflix, YouTube, and more.',
    categoryId: 'electronics-tvs', rating: 4.7, reviewCount: 1800, imageUrl: 'https://picsum.photos/seed/product14/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'used_like_new',
    deliveryOptions: ['shipping', 'local_pickup'], shippingCost: 25.00
  },
  {
    name: 'Mid-Century Modern Sofa', price: 750.00, description: 'Stylish and comfortable 3-seater sofa.',
    longDescription: 'Add a touch of retro charm to your living room with this mid-century modern sofa. It features a solid wood frame, elegant tapered legs, and comfortable, high-density foam cushions upholstered in a durable fabric.',
    categoryId: 'furniture-chairs', rating: 4.8, reviewCount: 210, imageUrl: 'https://picsum.photos/seed/product15/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'direct', condition: 'used_good',
    deliveryOptions: ['local_pickup']
  },
  {
    name: 'Men\'s Running Shoes', price: 85.00, description: 'Lightweight and breathable running shoes.',
    longDescription: 'Achieve your personal best with these lightweight running shoes. The breathable mesh upper keeps your feet cool and comfortable, while the cushioned midsole provides excellent shock absorption and energy return with every stride.',
    categoryId: 'clothing-shoes', rating: 4.6, reviewCount: 950, imageUrl: 'https://picsum.photos/seed/product16/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'new',
    deliveryOptions: ['shipping', 'free_shipping'], shippingCost: 6.50
  },
  {
    name: '12-Inch Cast Iron Skillet', price: 35.00, description: 'Pre-seasoned and ready to use.',
    longDescription: 'The most versatile pan in any kitchen. This pre-seasoned 12-inch cast iron skillet offers superior heat retention and even cooking. Perfect for searing, sautéing, baking, and frying. Built to last for generations.',
    categoryId: 'home-kitchen-cookware', rating: 4.9, reviewCount: 2500, imageUrl: 'https://picsum.photos/seed/product17/400/400',
    reviews: [], sellerId: 2, sellerName: 'John Doe', sellingMode: 'secure', condition: 'new',
    deliveryOptions: ['shipping'], shippingCost: 9.00
  },
  {
    name: 'Premium Yoga Mat', price: 40.00, description: 'Eco-friendly, non-slip yoga mat.',
    longDescription: 'Find your zen with this premium, eco-friendly yoga mat. Made from natural tree rubber, it provides excellent grip and cushioning for your practice. The non-slip surface ensures stability in any pose.',
    categoryId: 'sports-outdoors-fitness', rating: 4.8, reviewCount: 1300, imageUrl: 'https://picsum.photos/seed/product18/400/400',
    reviews: [], sellerId: 99, sellerName: 'Reuseday Official', sellingMode: 'secure', condition: 'new',
    deliveryOptions: ['shipping', 'free_shipping'], shippingCost: 5.00
  },
];


const PRODUCTS_PER_PAGE = 18;
const STORAGE_KEY = 'reuseday_products_v3'; // Incremented version key

const getInitialProducts = (): Product[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.length > 0 && parsed[0].categoryId) {
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
    if (!query) {
      return products;
    }
    const lowerCaseQuery = query.toLowerCase();
    // This search is simplified; in a real app, you'd also search translated category names.
    return products.filter(p => 
        p.name.toLowerCase().includes(lowerCaseQuery) || 
        p.description.toLowerCase().includes(lowerCaseQuery) ||
        p.categoryId.toLowerCase().includes(lowerCaseQuery)
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
    
    const updateProductAsAdmin = useCallback((
      productId: number,
      updatedData: Partial<Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewCount' | 'reviews' | 'questions'>>
    ): boolean => {
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) return false;

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

  const addProductReview = useCallback((productId: number, reviewData: Omit<Review, 'id' | 'date'>) => {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const newReview: Review = {
        ...reviewData,
        id: Date.now(),
        date: new Date().toISOString(),
    };

    const updatedProducts = [...products];
    const productToUpdate = { ...updatedProducts[productIndex] };
    
    productToUpdate.reviews = [newReview, ...productToUpdate.reviews];
    
    const totalRating = productToUpdate.reviews.reduce((sum, r) => sum + r.rating, 0);
    productToUpdate.rating = totalRating / productToUpdate.reviews.length;
    productToUpdate.reviewCount = productToUpdate.reviews.length;
    
    updatedProducts[productIndex] = productToUpdate;
    saveProducts(updatedProducts);
  }, [products]);

  const value = { products, loading, getProductById, searchProducts, getPaginatedProducts, addProduct, deleteProduct, updateProduct, updateProductAsAdmin, deleteProductAsAdmin, deleteProductsByUserId, addQuestionToProduct, addAnswerToQuestion, addProductReview };

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