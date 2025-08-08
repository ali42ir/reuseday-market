
import React from 'react';
import type { Product } from '../types.ts';
import { Link } from 'react-router-dom';

interface SliderProductCardProps {
  product: Product;
}

const SliderProductCard: React.FC<SliderProductCardProps> = ({ product }) => {
  return (
    <Link 
      to={`/product/${product.id}`} 
      className="relative bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl block h-full"
      aria-label={product.name}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
        <div className="p-3">
            <h3 className="text-white text-sm font-bold line-clamp-2">{product.name}</h3>
            <p className="text-amazon-yellow-light text-xs font-semibold mt-1">€{product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
};

export default SliderProductCard;
