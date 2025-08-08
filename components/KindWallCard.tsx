
import React, { useState } from 'react';
import type { KindWallPost } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import KindWallReplyModal from './KindWallReplyModal.tsx';

interface KindWallCardProps {
    post: KindWallPost;
}

const KindWallCard: React.FC<KindWallCardProps> = ({ post }) => {
    const { t, language } = useLanguage();
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

    const typeLabel = post.type === 'giving' ? t('kindwall_label_free') : t('kindwall_label_wanted');
    const typeIcon = post.type === 'giving' ? '🎁' : '🔍';
    const typeBgColor = post.type === 'giving' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';

    return (
        <>
        {isReplyModalOpen && <KindWallReplyModal post={post} onClose={() => setIsReplyModalOpen(false)} />}
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            {post.imageUrl && (
                <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                />
            )}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBgColor}`}>
                        {typeIcon} <span className="ms-1.5">{typeLabel}</span>
                    </span>
                    <span className="text-xs text-gray-400 uppercase font-semibold">{post.language}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mt-2">{post.title}</h3>
                <p className="text-sm text-gray-600 mt-1 flex-grow">{post.description}</p>
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 me-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {post.location}
                    </div>
                     {post.contactInfo && (
                        <div className="mt-2 text-sm text-gray-800 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                           <strong>{t('kindwall_contact_info_label')}:</strong> {post.contactInfo}
                        </div>
                    )}
                </div>
            </div>
             <div className="p-4 bg-gray-50">
                <button 
                    onClick={() => setIsReplyModalOpen(true)}
                    className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                    {t('kindwall_reply_button')}
                </button>
            </div>
        </div>
        </>
    );
};

export default KindWallCard;