
import React, { useState, useMemo } from 'react';
import { useProductContext } from '../context/ProductContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useMarketing } from '../context/MarketingContext.tsx';
import ProductGrid from '../components/ProductGrid.tsx';
import Spinner from '../components/Spinner.tsx';
import Pagination from '../components/Pagination.tsx';
import BannerSlider from '../components/BannerSlider.tsx';

const HomePage: React.FC = () => {
  const { products, loading, getPaginatedProducts } = useProductContext();
  const { featuredProductIds } = useMarketing();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  
  const featuredProducts = useMemo(() => {
    return products.filter(p => featuredProductIds.includes(p.id));
  }, [products, featuredProductIds]);

  const regularProducts = useMemo(() => {
    return products.filter(p => !featuredProductIds.includes(p.id));
  }, [products, featuredProductIds]);

  const { products: paginatedProducts, totalPages } = useMemo(() => {
    return getPaginatedProducts(regularProducts, currentPage);
  }, [regularProducts, currentPage, getPaginatedProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <BannerSlider />
      <div className="bg-white p-8 rounded-lg shadow-md text-center my-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('home_welcome')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('home_tagline')}
        </p>
      </div>

      {loading ? <Spinner /> : (
        <>
          {featuredProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('home_featured_products')}</h2>
              <ProductGrid products={featuredProducts} />
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('header_home')}</h2>
          <ProductGrid products={paginatedProducts} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;