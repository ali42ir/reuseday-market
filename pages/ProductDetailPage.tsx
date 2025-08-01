import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useConversations } from '../context/ConversationContext.tsx';
import StarRating from '../components/StarRating.tsx';
import Spinner from '../components/Spinner.tsx';
import RecommendedProducts from '../components/RecommendedProducts.tsx';
import type { StoredUser } from '../types.ts';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, addQuestionToProduct, loading: productLoading } = useProductContext();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const { isAuthenticated, user, getStoredUser } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const { startConversation } = useConversations();
  const navigate = useNavigate();
  
  const [isAdded, setIsAdded] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [seller, setSeller] = useState<StoredUser | null>(null);

  const product = getProductById(Number(id));
  const isWishlisted = product ? isInWishlist(product.id) : false;
  
  useEffect(() => {
    if (product) {
        setSeller(getStoredUser(product.sellerId));
        // SEO: Update title and meta description
        document.title = `${product.name} - ${t('brand_name')}`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', product.description);
        }
    }
    // Cleanup function to reset title
    return () => {
        document.title = t('brand_name');
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', t('home_tagline'));
        }
    };
  }, [product, getStoredUser, t]);

  const sellerAvgRating = useMemo(() => {
    if (!seller || !seller.sellerRatings || seller.sellerRatings.length === 0) return 0;
    const total = seller.sellerRatings.reduce((sum, r) => sum + r.rating, 0);
    return total / seller.sellerRatings.length;
  }, [seller]);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) return navigate('/login');
    if (product) {
      toggleWishlist(product);
      addToast(isInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist', 'info');
    }
  };

  const handleMessageSeller = () => {
    if (!product || !isAuthenticated) return navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } });
    if (product.sellerId === user?.id) return addToast("You cannot message yourself.", "error");
    const conversationId = startConversation(product);
    navigate(`/profile/conversations?convo=${conversationId}`);
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (product && user && questionText.trim()) {
      addQuestionToProduct(product.id, questionText.trim(), user);
      addToast(t('product_qa_question_sent_toast'), 'success');
      setQuestionText('');
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });

  if (productLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!product) return <div className="container mx-auto px-4 py-8 text-center"><h2 className="text-2xl font-bold text-red-600">{t('product_not_found')}</h2><Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">{t('product_go_home')}</Link></div>;

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    addToast(t('product_added'), 'success');
    setTimeout(() => setIsAdded(false), 2000);
  };
  
  const renderActionButton = () => product.sellingMode === 'direct' ?
    <button onClick={handleMessageSeller} className="w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300 bg-blue-600 hover:bg-blue-700 text-white">{t('seller_message_button')}</button> :
    <button onClick={handleAddToCart} className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300 ${isAdded ? 'bg-green-600 text-white' : 'bg-amazon-yellow hover:bg-amazon-yellow-light text-amazon-blue'}`}>{isAdded ? t('product_added') : t('product_add_to_cart')}</button>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><img src={product.imageUrl} alt={product.name} className="w-full rounded-lg object-cover" /></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <StarRating rating={product.rating} />
              <a href="#reviews" className="text-sm text-blue-600 hover:underline ml-3">{product.reviewCount} {t('ratings')}</a>
            </div>
            <div className="text-sm text-gray-500 mb-4">{t('seller_sold_by')} <span className="font-semibold text-blue-700">{product.sellerName}</span>
                {sellerAvgRating > 0 && <span className="ml-2 flex items-center">(<StarRating rating={sellerAvgRating} size={4}/> <span className="ml-1">{sellerAvgRating.toFixed(1)}</span>)</span>}
            </div>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-sm"><strong className="font-semibold">{t('product_condition')}:</strong> {t(`product_condition_${product.condition}`)}</p>
            <hr className="my-4" />
            <p className="text-3xl font-bold text-gray-900 my-4">€{product.price.toFixed(2)}</p>
            {product.price > 0 && <p className="text-green-600 font-semibold mb-6">{t('product_in_stock')}</p>}
            <div className="flex items-center space-x-4 mb-6">{renderActionButton()}<button onClick={handleWishlistToggle} className={`p-3 rounded-full transition-colors duration-300 border ${isWishlisted ? 'text-red-500 bg-red-100 border-red-200' : 'text-gray-500 bg-white border-gray-300 hover:text-red-500 hover:border-red-300'}`} aria-label={t(isWishlisted ? 'product_in_wishlist' : 'product_add_to_wishlist')}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg></button></div>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-900">{product.sellingMode === 'secure' ? t('site_disclaimer_secure') : t('site_disclaimer_direct')}</p></div>
            <div className="mt-8"><h3 className="text-xl font-semibold text-gray-800 mb-2">{t('product_description')}</h3><p className="text-gray-600 leading-relaxed">{product.longDescription}</p></div>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="mt-12 pt-6 border-t" id="questions">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{t('product_qa_title')}</h3>
            <div className="space-y-6">
                {product.questions.map(q => <div key={q.id}><p className="font-semibold text-gray-800">Q: {q.text}</p><p className="text-gray-600 mt-1 ml-4">{q.answer ? `A: ${q.answer}` : <span className="text-sm italic">Awaiting answer...</span>}</p></div>)}
                {product.questions.length === 0 && <p className="text-gray-600">{t('product_qa_no_questions')}</p>}
            </div>
             <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-4">{t('product_qa_ask_button')}</h4>
                {!isAuthenticated ? <p>{t('product_qa_login_prompt')} <Link to="/login" className="text-blue-600 hover:underline">{t('header_sign_in')}</Link></p> : (
                    <form onSubmit={handleAskQuestion}>
                        <div className="mb-4"><label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-2">{t('product_qa_your_question')}</label><textarea id="questionText" rows={3} value={questionText} onChange={e => setQuestionText(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required></textarea></div>
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg hover:bg-amazon-yellow-light">{t('product_qa_submit_question')}</button>
                    </form>
                )}
            </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-12 pt-6 border-t" id="reviews">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{t('reviews_title')}</h3>
            {product.reviews.length > 0 ? <div className="space-y-6">{product.reviews.map(review => <div key={review.id} className="border-b pb-4 last:border-b-0"><div className="flex items-center mb-2"><StarRating rating={review.rating} size={4}/><p className="ml-3 font-bold text-gray-800">{review.title}</p></div><p className="text-gray-600 text-sm mb-2">by {review.author} on {formatDate(review.date)}</p><p className="text-gray-700">{review.text}</p></div>)}</div> : <p className="text-gray-600">{t('reviews_no_reviews')}</p>}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg"><h4 className="font-bold text-lg mb-4">{t('reviews_write_review')}</h4>{!isAuthenticated ? <p>{t('reviews_login_prompt')} <Link to="/login" className="text-blue-600 hover:underline">{t('header_sign_in')}</Link></p> : <form onSubmit={(e) => { e.preventDefault(); addToast('Review submitted (simulation)!', 'success'); }}><div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">{t('reviews_your_rating')}</label><StarRating rating={0} size={5} /> </div><div className="mb-4"><label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">{t('reviews_your_review')}</label><textarea id="reviewText" rows={4} className="w-full p-2 border border-gray-300 rounded-md" required></textarea></div><button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg hover:bg-amazon-yellow-light">{t('reviews_submit')}</button></form>}</div>
        </div>

        <RecommendedProducts currentProduct={product} />
      </div>
    </div>
  );
};

export default ProductDetailPage;