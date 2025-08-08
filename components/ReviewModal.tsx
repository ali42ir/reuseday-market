import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface InteractiveStarRatingProps {
    rating: number;
    setRating: (r: number) => void;
}

const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map(star => (
                <div 
                    key={star} 
                    onMouseEnter={() => setHoverRating(star)} 
                    onClick={() => setRating(star)}
                    className="cursor-pointer"
                    aria-label={`${star} stars`}
                >
                    <svg className={`w-8 h-8 ${hoverRating >= star || rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
            ))}
        </div>
    );
};


interface ReviewModalProps {
    productName: string;
    onClose: () => void;
    onSubmit: (reviewData: { rating: number; title: string; text: string }) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ productName, onClose, onSubmit }) => {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0 && title.trim() && text.trim()) {
            onSubmit({ rating, title, text });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">{t('review_modal_title', { productName })}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('reviews_your_rating')}</label>
                            <InteractiveStarRating rating={rating} setRating={setRating} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('review_your_review_title')}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('reviews_your_review')}</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={5}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        <button type="submit" disabled={rating === 0 || !title.trim() || !text.trim()} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg disabled:bg-gray-300">
                            {t('review_submit_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;