
import React from 'react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import ProductGrid from '../components/ProductGrid.tsx';
import Spinner from '../components/Spinner.tsx';
import { Link } from 'react-router-dom';

const WishlistPage: React.FC = () => {
  const { wishlistItems, loading } = useWishlist();
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('wishlist_title')}</h1>
      {loading ? (
        <Spinner />
      ) : wishlistItems.length > 0 ? (
        <ProductGrid products={wishlistItems} />
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-600">{t('wishlist_empty')}</p>
          <Link to="/" className="mt-4 inline-block bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg hover:bg-amazon-yellow-light transition-colors">
            {t('cart_continue_shopping')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;