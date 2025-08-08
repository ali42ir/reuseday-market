
import React, { useState, useMemo } from 'react';
import { useProductContext } from '../context/ProductContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useMarketing } from '../context/MarketingContext.tsx';
import ProductGrid from '../components/ProductGrid.tsx';
import Spinner from '../components/Spinner.tsx';
import Pagination from '../components/Pagination.tsx';
import FeaturedProductSlider from '../components/FeaturedProductSlider.tsx';
import BannerSlider from '../components/BannerSlider.tsx';

const HomePage: React.FC = () => {
  const { products, loading } = useProductContext();
  const { featuredProductIds } = useMarketing();
  const { t } = useLanguage();

  const featuredProducts = useMemo(() => {
    return products.filter(p => featuredProductIds.includes(p.id));
  }, [products, featuredProductIds]);

  const topElectronics = useMemo(() => {
    return products
      .filter(p => p.categoryId.startsWith('electronics'))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [products]);
  
  const recentFurniture = useMemo(() => {
    return products
      .filter(p => p.categoryId.startsWith('furniture'))
      .sort((a, b) => b.id - a.id) // Assuming higher ID is newer
      .slice(0, 6);
  }, [products]);


  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <BannerSlider />
      
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('home_welcome')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('home_tagline')}
        </p>
      </div>

      {featuredProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('home_featured_products')}</h2>
          <FeaturedProductSlider products={featuredProducts} />
        </div>
      )}

      {loading ? <Spinner /> : (
        <div className="space-y-12">
          {topElectronics.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('home_top_in_electronics')}</h2>
              <ProductGrid products={topElectronics} />
            </section>
          )}

          {recentFurniture.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('home_recent_in_furniture')}</h2>
              <ProductGrid products={recentFurniture} />
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
