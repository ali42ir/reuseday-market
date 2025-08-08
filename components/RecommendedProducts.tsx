import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useProductContext } from '../context/ProductContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import type { Product } from '../types.ts';
import ProductGrid from './ProductGrid.tsx';
import Spinner from './Spinner.tsx';

interface RecommendedProductsProps {
  currentProduct: Product;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ currentProduct }) => {
  const { products: allProducts } = useProductContext();
  const { t } = useLanguage();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableProductsForRecommendation = useMemo(() => {
    return allProducts
        .filter(p => p.id !== currentProduct.id)
        .map(({ id, name, categoryId, description }) => ({ id, name, categoryId, description }));
  }, [allProducts, currentProduct.id]);


  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!process.env.API_KEY) {
        console.warn("Gemini API key not found. Skipping recommendations.");
        return;
      }
      if (availableProductsForRecommendation.length < 1) {
          return;
      }

      setLoading(true);
      setError(null);
      setRecommendedProducts([]);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are an expert e-commerce recommendation engine for a second-hand marketplace called 'Reuseday'.
        
        The user is currently viewing this product:
        - Name: ${currentProduct.name}
        - Category ID: ${currentProduct.categoryId}
        - Description: ${currentProduct.description}
        
        Here is a list of other available products in JSON format:
        ${JSON.stringify(availableProductsForRecommendation, null, 2)}
        
        Based on the user's current product, identify the top 4 most relevant products from the list. Consider items in the same category, with similar functions, or that complement the current item.
        
        Return a JSON object with a single key "recommended_ids" which is an array of the product IDs (as numbers) for your recommendations. Do not include the current product's ID (${currentProduct.id}).
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommended_ids: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER }
                }
              },
              required: ['recommended_ids']
            }
          }
        });

        const result = JSON.parse(response.text);
        const recommendedIds = result.recommended_ids as number[];
        
        if (recommendedIds && recommendedIds.length > 0) {
            const finalRecommendations = allProducts.filter(p => recommendedIds.includes(p.id));
            setRecommendedProducts(finalRecommendations);
        }

      } catch (err) {
        console.error("Failed to fetch AI recommendations:", err);
        setError("Could not load recommendations at this time.");
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
        fetchRecommendations();
    }, 500);

    return () => {
        clearTimeout(handler);
    };

  }, [currentProduct.id, currentProduct.name, currentProduct.categoryId, currentProduct.description, allProducts, availableProductsForRecommendation, t]);

  if (!process.env.API_KEY) return null;
  
  if (loading) {
    return (
        <div className="mt-12 pt-6 border-t">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{t('product_recommendations_title')}</h3>
            <Spinner />
        </div>
    );
  }
  
  if (error || recommendedProducts.length === 0) {
      return null;
  }

  return (
    <div className="mt-12 pt-6 border-t">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">{t('product_recommendations_title')}</h3>
      <ProductGrid products={recommendedProducts} />
    </div>
  );
};

export default RecommendedProducts;
