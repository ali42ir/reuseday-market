
import React from 'react';

interface StarRatingProps {
  rating: number;
  size?: number;
}

const StarIcon: React.FC<{ fill: string, size: number }> = ({ fill, size }) => (
  <svg
    className={`w-${size} h-${size} ${fill}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 5 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} fill="text-yellow-400" size={size} />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <StarIcon key="half" fill="text-gray-300" size={size} />
          <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: '50%' }}>
            <StarIcon key="half-fill" fill="text-yellow-400" size={size} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} fill="text-gray-300" size={size} />
      ))}
    </div>
  );
};

export default StarRating;