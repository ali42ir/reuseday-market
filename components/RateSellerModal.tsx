
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import StarRating from './StarRating.tsx';

interface RateSellerModalProps {
    sellerName: string;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
}

const InteractiveStarRating: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map(star => (
                <div 
                    key={star} 
                    onMouseEnter={() => setHoverRating(star)} 
                    onClick={() => setRating(star)}
                    className="cursor-pointer"
                >
                    <svg className={`w-8 h-8 ${hoverRating >= star || rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
            ))}
        </div>
    );
};


const RateSellerModal: React.FC<RateSellerModalProps> = ({ sellerName, onClose, onSubmit }) => {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0) {
            onSubmit(rating, comment);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">{t('rate_seller_modal_title', { sellerName })}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('rate_seller_your_rating')}</label>
                            <InteractiveStarRating rating={rating} setRating={setRating} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('rate_seller_your_comment')}</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        <button type="submit" disabled={rating === 0} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg disabled:bg-gray-300">
                            {t('rate_seller_submit_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RateSellerModal;