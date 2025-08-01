import React, { useState, useEffect, useCallback } from 'react';
import { useMarketing } from '../context/MarketingContext.tsx';
import { Link } from 'react-router-dom';

const BannerSlider: React.FC = () => {
    const { banners } = useMarketing();
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
    }, [banners.length]);

    const prevSlide = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + banners.length) % banners.length);
    };
    
    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
            return () => clearInterval(interval);
        }
    }, [banners.length, nextSlide]);


    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full overflow-hidden rounded-lg shadow-lg" style={{ height: '300px' }}>
            <div
                className="flex transition-transform ease-out duration-500 h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    <Link to={banner.linkUrl} key={banner.id} className="w-full flex-shrink-0 h-full">
                        <img src={banner.imageUrl} alt="Promotional Banner" className="w-full h-full object-cover" loading="lazy" />
                    </Link>
                ))}
            </div>
            
            {banners.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 focus:outline-none">
                        &#10094;
                    </button>
                    <button onClick={nextSlide} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 focus:outline-none">
                        &#10095;
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {banners.map((_, index) => (
                            <div
                                key={index}
                                className={`w-3 h-3 rounded-full cursor-pointer ${currentIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                                onClick={() => setCurrentIndex(index)}
                            ></div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerSlider;