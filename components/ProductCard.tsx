
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <Link to={`/product/${product.id}`} className="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl flex flex-col">
        <div className="relative">
            <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
            />
            {isAuthenticated && (
            <button
                onClick={handleWishlistClick}
                className={`absolute top-2 end-2 p-2 rounded-full transition-colors duration-300 ${isWishlisted ? 'text-red-500 bg-white/80' : 'text-gray-500 bg-white/70 hover:text-red-500'}`}
                aria-label={t(isWishlisted ? 'product_in_wishlist' : 'product_add_to_wishlist')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
            </button>
            )}
        </div>
        <div className="p-2 flex flex-col flex-grow">
            <h3 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-amazon-blue line-clamp-2 h-10">
                {product.name}
            </h3>
            <div className="flex items-center mb-2">
                <StarRating rating={product.rating} size={4}/>
                <span className="text-xs text-gray-500 ms-1.5">{product.reviewCount} {t('reviews')}</span>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
                <p className="text-sm font-bold text-gray-900">€{product.price.toFixed(2)}</p>
                <button
                onClick={handleAddToCart}
                className={`p-2 rounded-full transition-colors duration-300 ${
                    isAdded
                    ? 'bg-green-500 text-white'
                    : 'bg-amazon-yellow hover:bg-amazon-yellow-light text-amazon-blue'
                }`}
                aria-label={t('product_add_to_cart')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
            </div>
        </div>
    </Link>
  );
};

export default ProductCard;