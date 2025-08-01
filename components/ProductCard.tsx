import React, { useState } from 'react';
import type { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from './StarRating.tsx';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [isAdded, setIsAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };
  
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl">
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        {isAuthenticated && (
          <button
            onClick={handleWishlistClick}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors duration-300 ${isWishlisted ? 'text-red-500 bg-white/70' : 'text-gray-500 bg-white/70 hover:text-red-500'}`}
            aria-label={t(isWishlisted ? 'product_in_wishlist' : 'product_add_to_wishlist')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-gray-800 mb-1 truncate group-hover:text-amazon-blue">
            <Link to={`/product/${product.id}`} className="hover:underline">{product.name}</Link>
        </h3>
        <div className="flex items-center mb-2">
          <StarRating rating={product.rating} />
          <span className="text-sm text-gray-500 ml-2">{product.reviewCount} {t('reviews')}</span>
        </div>
        <p className="text-lg font-bold text-gray-900 mb-3 mt-auto">€{product.price.toFixed(2)}</p>
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 px-3 text-sm rounded-md font-semibold transition-colors duration-300 ${
            isAdded
              ? 'bg-green-500 text-white'
              : 'bg-amazon-yellow hover:bg-amazon-yellow-light text-amazon-blue'
          }`}
        >
          {isAdded ? t('product_added') : t('product_add_to_cart')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;