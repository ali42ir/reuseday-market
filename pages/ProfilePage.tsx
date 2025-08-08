import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useOrders } from '../context/OrderContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useConversations } from '../context/ConversationContext.tsx';
import { useProductContext } from '../context/ProductContext.tsx';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import type { BankInfo, Order, OrderStatus, Conversation, Message, StoredUser, Question, SellerRating, Address, OrderItem, Review, TwoFactorMethod } from '../types.ts';
import StarRating from '../components/StarRating.tsx';
import RateSellerModal from '../components/RateSellerModal.tsx';
import ReviewModal from '../components/ReviewModal.tsx';
import { useToast } from '../context/ToastContext.tsx';
import SellerDashboard from '../components/SellerDashboard.tsx';
import { useComplaint } from '../context/ComplaintContext.tsx';

const statusColors: { [key in OrderStatus]: string } = {
    Pending: 'bg-yellow-100 text-yellow-800',
    AwaitingPayment: 'bg-orange-100 text-orange-800',
    AwaitingShipment: 'bg-blue-100 text-blue-800',
    PaymentHeld: 'bg-purple-100 text-purple-800',
    Shipped: 'bg-indigo-100 text-indigo-800',
    Delivered: 'bg-green-100 text-green-800',
    Completed: 'bg-teal-100 text-teal-800',
    Cancelled: 'bg-red-100 text-red-800',
};

const ComplaintModal: React.FC<{ order: Order; onClose: () => void; }> = ({ order, onClose }) => {
    const { t } = useLanguage();
    const { addComplaint } = useComplaint();
    const { addToast } = useToast();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addComplaint({ orderId: order.id, subject, description, imageUrl });
        addToast(t('complaint_submitted_toast'), 'success');
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold p-6 border-b">{t('complaint_file_a_complaint', { orderId: order.id.slice(-6) })}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">{t('complaint_subject')}</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('complaint_description')}</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('complaint_upload_evidence')}</label>
                            <input type="file" onChange={handleFileChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"/>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        <button type="submit" className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg">{t('complaint_submit')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const { tab } = useParams<{ tab: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user, isSeller } = useAuth();
    const { products } = useProductContext();
    const { getAllOrdersForAdmin } = useOrders();
    
    const userProducts = useMemo(() => {
        if (!user) return [];
        return products.filter(p => p.sellerId === user.id);
    }, [products, user]);

    const allOrders = useMemo(() => {
        return getAllOrdersForAdmin();
    }, [getAllOrdersForAdmin]);
    
    const [activeTab, setActiveTab] = useState('settings');

    useEffect(() => {
        const validTabs = ['settings', 'orders', 'conversations', 'ratings', 'questions', 'dashboard'];
        const targetTab = tab && validTabs.includes(tab) ? tab : 'settings';

        // Redirect to 'settings' if a seller-only tab is accessed by a non-seller
        if (!isSeller && ['dashboard', 'ratings', 'questions'].includes(targetTab)) {
             navigate('/profile/settings', { replace: true });
             setActiveTab('settings');
        } else {
            setActiveTab(targetTab);
        }

    }, [tab, navigate, isSeller]);

    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
        navigate(`/profile/${tabName}`);
    };

    const tabs = useMemo(() => [
        { id: 'settings', labelKey: 'profile_settings', visible: true },
        { id: 'dashboard', labelKey: 'profile_seller_dashboard_tab', visible: isSeller },
        { id: 'orders', labelKey: 'profile_order_history', visible: true },
        { id: 'conversations', labelKey: 'profile_conversations', visible: true }, 
        { id: 'ratings', labelKey: 'profile_my_ratings_tab', visible: isSeller }, 
        { id: 'questions', labelKey: 'profile_listings_qa_tab', visible: isSeller },
    ], [isSeller]);
    
    const visibleTabs = tabs.filter(t => t.visible);

    const renderContent = () => {
        switch (activeTab) {
            case 'settings': return <Settings />;
            case 'dashboard': return <SellerDashboard userProducts={userProducts} allOrders={allOrders} />;
            case 'orders': return <OrderHistory />;
            case 'conversations': return <Conversations />;
            case 'ratings': return <MyRatings />; 
            case 'questions': return <ListingsQA />;
            default: return <Settings />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-white p-4 rounded-lg shadow-md sticky top-24">
                        <nav className="flex flex-col space-y-1">
                            {visibleTabs.map(tabItem => (
                                <button key={tabItem.id} onClick={() => handleTabClick(tabItem.id)}
                                    className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tabItem.id ? 'bg-amazon-yellow text-amazon-blue' : 'text-gray-700 hover:bg-gray-100'}`}>
                                    {t(tabItem.labelKey)}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
                <div className="md:col-span-3"><div className="bg-white p-6 rounded-lg shadow-md min-h-[60vh]">{renderContent()}</div></div>
            </div>
        </div>
    );
};

const OrderHistory = () => {
    const { orders, markAsShipped, confirmReceipt, addRatingToOrder, markItemAsReviewed } = useOrders();
    const { user, addSellerRating } = useAuth();
    const { addProductReview } = useProductContext();
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
    const [reviewingItem, setReviewingItem] = useState<{ product: OrderItem; orderId: string } | null>(null);
    const [complaintOrder, setComplaintOrder] = useState<Order | null>(null);

    const handleRatingSubmit = (rating: number, comment: string) => {
        if (!ratingOrder || !user) return;
        const sellerId = ratingOrder.items[0].sellerId;
        const newRating: SellerRating = { rating, comment, buyerName: user.name, buyerId: user.id, createdAt: new Date().toISOString() };
        
        if (addSellerRating(sellerId, newRating)) {
            addRatingToOrder(ratingOrder.id);
        }
        setRatingOrder(null);
    };

    const handleReviewSubmit = ({ rating, title, text }: { rating: number; title: string; text: string }) => {
        if (!reviewingItem || !user) return;

        const reviewData: Omit<Review, 'id' | 'date'> = {
            userId: user.id,
            author: user.name,
            rating,
            title,
            text,
        };
        
        addProductReview(reviewingItem.product.id, reviewData);
        markItemAsReviewed(reviewingItem.orderId, reviewingItem.product.id);
        
        addToast(t('review_submitted_toast'), 'success');
        setReviewingItem(null);
    };

    const sortedOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [orders]);
    
    return (
        <div>
            {ratingOrder && <RateSellerModal sellerName={ratingOrder.items[0].sellerName} onClose={() => setRatingOrder(null)} onSubmit={handleRatingSubmit} />}
            {reviewingItem && <ReviewModal productName={reviewingItem.product.name} onClose={() => setReviewingItem(null)} onSubmit={handleReviewSubmit} />}
            {complaintOrder && <ComplaintModal order={complaintOrder} onClose={() => setComplaintOrder(null)} />}
            <h2 className="text-2xl font-bold mb-4">{t('profile_order_history')}</h2>
            {sortedOrders.length === 0 ? <p className="text-gray-600">{t('profile_no_orders')}</p> : <div className="space-y-6">
                {sortedOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                            <div>
                                <p className="text-sm text-gray-800"><strong className="font-semibold">{t('order_id')}:</strong> #{order.id.slice(-6)}</p>
                                <p className="text-sm text-gray-800"><strong className="font-semibold">{t('order_date')}:</strong> {new Date(order.date).toLocaleDateString(language)}</p>
                                <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>{t(`order_status_${order.status.toLowerCase()}`)}</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">€{order.total.toFixed(2)}</p>
                        </div>
                         <div className="border-t pt-2 mt-2 text-sm text-gray-600">
                            <p><strong>{t('delivery_method')}:</strong> {t(`delivery_option_${order.deliveryMethod}`)}</p>
                            {order.deliveryMethod === 'shipping' && <p><strong>{t('cart_shipping')}:</strong> €{order.shippingCost.toFixed(2)}</p>}
                            {order.deliveryMethod === 'local_pickup' && <p className="text-xs italic">{t('delivery_local_pickup_contact_seller')}</p>}
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <h4 className="font-semibold mb-2 text-gray-800">{t('order_items')}:</h4>
                            {order.items.map(item => <div key={item.id} className="flex justify-between items-center text-sm mb-1 text-gray-800">
                                <div>
                                    <Link to={`/product/${item.id}`} className="hover:underline">{item.name} (x{item.quantity})</Link>
                                     {order.status === 'Completed' && order.userId === user?.id && !order.reviewedItems?.[item.id] && (
                                        <button 
                                            onClick={() => setReviewingItem({ product: item, orderId: order.id })} 
                                            className="ml-4 text-xs font-semibold text-blue-600 hover:underline"
                                        >
                                            ({t('order_action_write_review')})
                                        </button>
                                    )}
                                </div>
                                <span>€{(item.price * item.quantity).toFixed(2)}</span>
                            </div>)}
                        </div>
                        <div className="border-t pt-3 mt-3 flex justify-end space-x-2">
                            {user && order.items[0].sellerId === user.id && order.status === 'PaymentHeld' && <button onClick={() => markAsShipped(order.id)} className="bg-blue-600 text-white font-semibold py-1 px-3 rounded-md text-sm">{t('order_action_mark_shipped')}</button>}
                            {user && order.userId === user.id && order.status === 'Shipped' && <button onClick={() => confirmReceipt(order.id)} className="bg-green-600 text-white font-semibold py-1 px-3 rounded-md text-sm">{t('order_action_confirm_receipt')}</button>}
                            {user && order.userId === user.id && order.status === 'Completed' && !order.buyerRating.rated && <button onClick={() => setRatingOrder(order)} className="bg-yellow-500 text-white font-semibold py-1 px-3 rounded-md text-sm">{t('order_action_rate_seller')}</button>}
                             {user && order.userId === user.id && order.status === 'Completed' && <button onClick={() => setComplaintOrder(order)} className="bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-sm">{t('order_action_report_issue')}</button>}
                        </div>
                    </div>
                ))}
            </div>}
        </div>
    );
};

const Conversations = () => { 
    const { conversations, getConversationById, sendMessage } = useConversations();
    const { user } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const convoIdFromUrl = searchParams.get('convo');
    
    const [activeConversationId, setActiveConversationId] = useState<string | null>(convoIdFromUrl);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = useMemo(() => {
        return activeConversationId ? getConversationById(activeConversationId) : null;
    }, [activeConversationId, getConversationById]);
    
    useEffect(() => {
        if (convoIdFromUrl) {
            setActiveConversationId(convoIdFromUrl);
        } else if (conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        }
    }, [convoIdFromUrl, conversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeConversationId && messageText.trim()) {
            sendMessage(activeConversationId, messageText.trim());
            setMessageText('');
        }
    };
    
    if (conversations.length === 0) {
        return <div><h2 className="text-2xl font-bold mb-4">{t('profile_conversations')}</h2><p className="text-gray-600">{t('profile_no_conversations')}</p></div>;
    }

    return (
        <div>
             <h2 className="text-2xl font-bold mb-4">{t('profile_conversations')}</h2>
             <div className="border rounded-lg grid grid-cols-1 md:grid-cols-3 h-[65vh]">
                 <div className="md:col-span-1 border-r overflow-y-auto">
                    {conversations.map(convo => (
                        <button key={convo.id} onClick={() => setActiveConversationId(convo.id)} className={`w-full text-left p-3 flex items-center space-x-3 border-b ${activeConversationId === convo.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                           <img src={convo.productImageUrl} alt={convo.productName} className="w-12 h-12 rounded-md object-cover"/>
                           <div>
                               <p className="font-semibold text-sm truncate">{convo.productName}</p>
                               <p className="text-xs text-gray-500 truncate">{t('conversation_with_user', { name: user?.id === convo.buyerId ? convo.sellerName : convo.buyerName })}</p>
                           </div>
                        </button>
                    ))}
                 </div>
                 <div className="md:col-span-2 flex flex-col">
                    {activeConversation ? (
                        <>
                            <div className="p-3 border-b flex justify-between items-center">
                                <p className="font-bold">{activeConversation.productName}</p>
                                <Link to={`/product/${activeConversation.productId}`} className="text-sm text-blue-600 hover:underline">{t('profile_view_product')}</Link>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                                {activeConversation.messages.map(msg => (
                                     <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-3 rounded-lg max-w-sm ${msg.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 mt-1">{msg.senderName}</span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-3 border-t bg-white">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} placeholder={t('profile_type_message')} className="flex-grow p-2 border rounded-md" />
                                    <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold p-2 rounded-md">{t('profile_send_button')}</button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">{t('profile_select_conversation')}</div>
                    )}
                 </div>
             </div>
        </div>
    );
};

const Settings = () => {
    const { t } = useLanguage();
    const { user, isSeller, isAdmin, getStoredUser, updateUserProfile, updateUserBankInfo, enableSelling } = useAuth();
    const { addToast } = useToast();
    const location = useLocation();
    
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: ''});
    const [addressData, setAddressData] = useState<Address>({ fullName: '', street: '', city: '', zipCode: '', country: ''});
    const [bankData, setBankData] = useState<BankInfo>({ accountHolder: '', iban: '', swift: '' });
    const [vatNumber, setVatNumber] = useState('');
    const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod>('none');

    useEffect(() => {
        if(user) {
            const storedUser = getStoredUser(user.id);
            if (storedUser) {
                setProfileData({ name: storedUser.name, email: storedUser.email, phone: storedUser.phone || '' });
                setAddressData(storedUser.address || { fullName: '', street: '', city: '', zipCode: '', country: ''});
                setBankData(storedUser.bankInfo || { accountHolder: '', iban: '', swift: '' });
                setVatNumber(storedUser.vatNumber || '');
                setTwoFactorMethod(storedUser.twoFactorMethod || 'none');
            }
        }
    }, [user, getStoredUser]);
    
     useEffect(() => {
        if (location.state?.needsSellerUpgrade) {
            addToast(t('seller_protected_route_desc'), 'info');
        }
    }, [location.state, addToast, t]);
    
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(user) updateUserProfile(user.id, { ...profileData, address: addressData, twoFactorMethod });
    };

    const handleBusinessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(user && isSeller) {
            updateUserBankInfo(user.id, bankData);
            updateUserProfile(user.id, { vatNumber });
        }
    };
    
    if (!user) {
        return null; // Or a spinner
    }

    if (!isSeller) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">{t('profile_settings')}</h2>
                <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <h3 className="text-xl font-bold text-yellow-900">{t('profile_become_a_seller')}</h3>
                    <p className="text-yellow-800 my-3">{t('profile_become_seller_desc')}</p>
                    <button onClick={enableSelling} className="bg-amazon-yellow text-amazon-blue font-bold py-3 px-8 rounded-lg hover:bg-amazon-yellow-light transition-colors text-lg">
                        {t('profile_become_a_seller')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">{t('profile_settings')}</h2>

            {/* Personal Info Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-2">{t('profile_account_info_title')}</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form_name')}</label>
                    <input type="text" value={profileData.name} onChange={e => setProfileData(p => ({...p, name: e.target.value}))} className="mt-1 block w-full p-2 border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form_email')}</label>
                    <input type="email" value={profileData.email} onChange={e => setProfileData(p => ({...p, email: e.target.value}))} className="mt-1 block w-full p-2 border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form_phone')}</label>
                    <input type="tel" value={profileData.phone} onChange={e => setProfileData(p => ({...p, phone: e.target.value}))} className="mt-1 block w-full p-2 border-gray-300 rounded-md" />
                </div>
                <h3 className="text-lg font-bold border-b pb-2 mt-6">{t('profile_address_info_title')}</h3>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form_street_address')}</label>
                    <input type="text" value={addressData.street} onChange={e => setAddressData(a => ({...a, street: e.target.value, fullName: profileData.name}))} className="mt-1 block w-full p-2 border-gray-300 rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder={t('form_city')} value={addressData.city} onChange={e => setAddressData(a => ({...a, city: e.target.value}))} className="p-2 border-gray-300 rounded-md" />
                    <input type="text" placeholder={t('form_zip_code')} value={addressData.zipCode} onChange={e => setAddressData(a => ({...a, zipCode: e.target.value}))} className="p-2 border-gray-300 rounded-md" />
                    <input type="text" placeholder={t('form_country')} value={addressData.country} onChange={e => setAddressData(a => ({...a, country: e.target.value}))} className="p-2 border-gray-300 rounded-md" />
                </div>

                {isAdmin && (
                    <>
                        <h3 className="text-lg font-bold border-b pb-2 mt-6">{t('profile_2fa_title')}</h3>
                        <p className="text-sm text-gray-600">{t('profile_2fa_desc')}</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('profile_2fa_method')}</label>
                            <select value={twoFactorMethod} onChange={e => setTwoFactorMethod(e.target.value as TwoFactorMethod)} className="mt-1 block w-full p-2 border-gray-300 rounded-md">
                                <option value="none">{t('profile_2fa_method_none')}</option>
                                <option value="sms">{t('profile_2fa_method_sms')}</option>
                                <option value="email">{t('profile_2fa_method_email')}</option>
                            </select>
                            {twoFactorMethod === 'sms' && <p className="text-xs text-gray-500 mt-1">{t('profile_2fa_info_sms', { phone: profileData.phone || 'N/A' })}</p>}
                            {twoFactorMethod === 'email' && <p className="text-xs text-gray-500 mt-1">{t('profile_2fa_info_email', { email: profileData.email || 'N/A' })}</p>}
                        </div>
                    </>
                )}
                 <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg">{t('seller_save_changes_button')}</button>
                </div>
            </form>
            
            {/* Business Info Form */}
            {isSeller && (
                 <form onSubmit={handleBusinessSubmit} className="space-y-4 pt-8 border-t">
                    <h3 className="text-lg font-bold border-b pb-2">{t('profile_business_info_title')}</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('form_vat_number')}</label>
                        <input type="text" value={vatNumber} onChange={e => setVatNumber(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md" />
                    </div>
                    <h3 className="text-lg font-bold pt-4">{t('profile_bank_info_title')}</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_bank_account_holder')}</label>
                        <input type="text" value={bankData.accountHolder} onChange={e => setBankData(b => ({...b, accountHolder: e.target.value}))} className="mt-1 block w-full p-2 border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_bank_iban')}</label>
                        <input type="text" value={bankData.iban} onChange={e => setBankData(b => ({...b, iban: e.target.value}))} className="mt-1 block w-full p-2 border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_bank_swift')}</label>
                        <input type="text" value={bankData.swift} onChange={e => setBankData(b => ({...b, swift: e.target.value}))} className="mt-1 block w-full p-2 border-gray-300 rounded-md" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg">{t('seller_save_changes_button')}</button>
                    </div>
                </form>
            )}
        </div>
    );
};

const MyRatings = () => {
    const { user, getStoredUser } = useAuth();
    const { t, language } = useLanguage();
    const sellerRatings = useMemo(() => getStoredUser(user?.id || 0)?.sellerRatings || [], [user, getStoredUser]);
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('profile_my_ratings_tab')}</h2>
            {sellerRatings.length === 0 ? <p className="text-gray-600">{t('profile_no_ratings')}</p> : <div className="space-y-4">
                {sellerRatings.map((rating) => <div key={rating.createdAt} className="border p-4 rounded-lg"><div className="flex items-center mb-2"><StarRating rating={rating.rating} /><p className="ml-4 font-semibold text-gray-800">{rating.buyerName}</p><p className="ml-auto text-sm text-gray-500">{new Date(rating.createdAt).toLocaleDateString(language)}</p></div><p className="text-gray-700 italic">"{rating.comment}"</p></div>)}
            </div>}
        </div>
    );
};

const ListingsQA = () => {
    const { user } = useAuth();
    const { products, addAnswerToQuestion } = useProductContext();
    const { t } = useLanguage();
    const [answerText, setAnswerText] = useState<{ [key: number]: string }>({});
    const { addToast } = useToast();

    const questionsToAnswer = useMemo(() => {
        if (!user) return [];
        const myQuestions: (Question & { productId: number; productName: string })[] = [];
        products.forEach(p => {
            if (p.sellerId === user.id) {
                p.questions.forEach(q => {
                    if (!q.answer) {
                        myQuestions.push({ ...q, productId: p.id, productName: p.name });
                    }
                });
            }
        });
        return myQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [products, user]);
    
    const handleAnswerSubmit = (e: React.FormEvent, productId: number, questionId: number) => {
        e.preventDefault();
        const answer = answerText[questionId];
        if (answer && answer.trim()) {
            addAnswerToQuestion(productId, questionId, answer.trim());
            addToast(t('seller_answer_sent_toast'), 'success');
            setAnswerText(prev => {
                const newState = {...prev};
                delete newState[questionId];
                return newState;
            });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('profile_listings_qa_tab')}</h2>
            {questionsToAnswer.length === 0 ? (
                <p className="text-gray-600">{t('profile_no_questions_to_answer')}</p>
            ) : (
                <div className="space-y-6">
                    {questionsToAnswer.map(q => (
                        <div key={q.id} className="border p-4 rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-500">
                                {t('product_category')}: <Link to={`/product/${q.productId}`} className="text-blue-600 hover:underline">{q.productName}</Link>
                            </p>
                            <p className="font-semibold text-gray-800 mt-2">{t('qa_question_prefix')} {q.text}</p>
                            <form onSubmit={(e) => handleAnswerSubmit(e, q.productId, q.id)} className="mt-3 flex items-start space-x-2">
                                <textarea
                                    value={answerText[q.id] || ''}
                                    onChange={e => setAnswerText(prev => ({...prev, [q.id]: e.target.value}))}
                                    placeholder={t('qa_answer_placeholder')}
                                    rows={2}
                                    className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
                                    required
                                />
                                <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg hover:bg-amazon-yellow-light text-sm self-stretch">
                                    {t('seller_answer_question')}
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;