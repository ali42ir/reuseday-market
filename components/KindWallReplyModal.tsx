
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useSupport } from '../context/SupportContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import type { KindWallPost } from '../types.ts';
import { Link } from 'react-router-dom';

interface KindWallReplyModalProps {
    post: KindWallPost;
    onClose: () => void;
}

const KindWallReplyModal: React.FC<KindWallReplyModalProps> = ({ post, onClose }) => {
    const { t } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const { addTicket } = useSupport();
    const { addToast } = useToast();

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        const subject = t('kindwall_reply_subject', { title: post.title, id: post.id });
        const fullMessage = `${t('kindwall_reply_message_body', { userName: user.name, postId: post.id, postTitle: post.title, posterName: post.userName })}\n\n---\n\n${message}`;

        addTicket({
            name: user.name,
            email: user.email,
            subject: subject,
            message: fullMessage,
        });

        setTimeout(() => {
            setLoading(false);
            addToast(t('kindwall_reply_sent_toast'), 'success');
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                 <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">{t('kindwall_reply_modal_title', { title: post.title })}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl" aria-label={t('close')}>&times;</button>
                </div>

                {!isAuthenticated ? (
                    <div className="p-8 text-center">
                        <p className="text-lg text-gray-700">{t('kindwall_reply_login_prompt')}</p>
                        <Link to="/login" state={{ from: { pathname: '/kindwall' } }} className="mt-4 inline-block bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg">
                            {t('header_sign_in')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">{t('kindwall_reply_disclaimer')}</p>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">{t('form_message')}</label>
                                <textarea
                                    name="message"
                                    id="message"
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-gray-200 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                            <button type="submit" disabled={loading} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400">
                                {loading ? t('ai_generating') : t('form_send_message_button')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default KindWallReplyModal;