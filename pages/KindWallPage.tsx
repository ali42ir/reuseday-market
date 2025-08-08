
import React, { useState, useMemo, useEffect } from 'react';
import { useKindWall } from '../context/KindWallContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import KindWallCard from '../components/KindWallCard.tsx';
import Spinner from '../components/Spinner.tsx';
import type { KindWallPostType } from '../types.ts';
import { Link } from 'react-router-dom';


const KindWallForm: React.FC<{
    formType: KindWallPostType;
    onClose: () => void;
}> = ({ formType, onClose }) => {
    const { t } = useLanguage();
    const { addPost } = useKindWall();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        location: '',
        contactInfo: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, type } = e.target;
        if (type === 'file') {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setFormData(p => ({ ...p, imageUrl: reader.result as string }));
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(p => ({ ...p, [name]: e.target.value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addPost({
            ...formData,
            type: formType,
        });
        addToast(t('kindwall_form_submit_toast'), 'success');
        onClose();
    };

    return (
        <div className="my-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {formType === 'giving' ? t('kindwall_give_title') : t('kindwall_request_title')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder={t('kindwall_form_title_placeholder')} className="w-full p-2 border rounded-md" required />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder={t('kindwall_form_desc_placeholder')} rows={4} className="w-full p-2 border rounded-md" required />
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder={t('kindwall_form_location_placeholder')} className="w-full p-2 border rounded-md" required />
                <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} placeholder={t('kindwall_form_contact_placeholder')} className="w-full p-2 border rounded-md" />
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form_product_image')} ({t('optional')})</label>
                    <input type="file" name="imageUrl" accept="image/*" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"/>
                </div>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                    <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg">{t('kindwall_form_submit_button')}</button>
                </div>
            </form>
        </div>
    );
};

const LegalPopup: React.FC = () => {
    const { t, language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const popupShown = localStorage.getItem('kindwallPopupShown');
        if (!popupShown) {
            localStorage.setItem('kindwallPopupShown', 'true');
            setIsVisible(true);

            const fadeTimer = setTimeout(() => {
                setIsFadingOut(true);
            }, 9500); // Start fade out before removing

            const hideTimer = setTimeout(() => {
                setIsVisible(false);
            }, 10000); // Hide after 10s

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(hideTimer);
            };
        }
    }, []);
    
    const handleClose = () => {
        setIsFadingOut(true);
        setTimeout(() => setIsVisible(false), 500);
    };

    if (!isVisible) {
        return null;
    }

    const isRtl = ['fa', 'ar'].includes(language);

    return (
        <div className={`fixed top-24 end-5 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className={`w-0 flex-1 pt-0.5 ${isRtl ? 'me-3' : 'ms-3'}`}>
                        <p className="text-sm text-gray-600">{t('kindwall_legal_popup')}</p>
                    </div>
                    <div className={`flex-shrink-0 flex ${isRtl ? 'me-4' : 'ms-4'}`}>
                        <button onClick={handleClose} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazon-yellow">
                            <span className="sr-only">{t('close')}</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const KindWallPage: React.FC = () => {
    const { t } = useLanguage();
    const { posts, loading } = useKindWall();
    const { isAuthenticated } = useAuth();
    const [formType, setFormType] = useState<KindWallPostType | null>(null);

    const approvedPosts = useMemo(() => {
        return posts
            .filter(p => p.status === 'approved')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [posts]);
    
    return (
        <div className="py-8">
            <div className="container mx-auto px-4">
                <LegalPopup />
                <div className="text-center bg-[#D5E8D4] p-8 rounded-lg shadow-md">
                     <h1 className="text-4xl font-extrabold text-gray-800">🤝 {t('kindwall_title')}</h1>
                     <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">{t('kindwall_tagline')}</p>
                </div>

                <div className="my-8">
                    {formType ? (
                        <KindWallForm formType={formType} onClose={() => setFormType(null)} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button onClick={() => setFormType('giving')} className="bg-green-500 text-white p-8 rounded-lg shadow-lg hover:bg-green-600 transition text-center">
                                <h2 className="text-2xl font-bold">{t('kindwall_give_title')}</h2>
                                <p className="mt-2">{t('kindwall_give_desc')}</p>
                            </button>
                            <button onClick={() => setFormType('requesting')} className="bg-blue-500 text-white p-8 rounded-lg shadow-lg hover:bg-blue-600 transition text-center">
                                <h2 className="text-2xl font-bold">{t('kindwall_request_title')}</h2>
                                <p className="mt-2">{t('kindwall_request_desc')}</p>
                            </button>
                        </div>
                    )}
                </div>

                {loading ? <Spinner /> : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {approvedPosts.map(post => (
                            <KindWallCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
                {approvedPosts.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        <p>{t('kindwall_no_posts')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KindWallPage;