
import React, { useRef } from 'react';
import type { Product } from '../types.ts';
import SliderProductCard from './SliderProductCard.tsx';

const FeaturedProductSlider: React.FC<{ products: Product[] }> = ({ products }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (products.length === 0) {
        return null;
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group w-full">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <button
                onClick={() => scroll('left')}
                className="absolute top-1/2 -start-4 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-10 transition-opacity opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center"
                aria-label="Scroll left"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-4 p-2 no-scrollbar scroll-smooth">
                {products.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-64 h-40">
                        <SliderProductCard product={product} />
                    </div>
                ))}
            </div>
            <button
                onClick={() => scroll('right')}
                className="absolute top-1/2 -end-4 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-10 transition-opacity opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center"
                aria-label="Scroll right"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

export default FeaturedProductSlider;