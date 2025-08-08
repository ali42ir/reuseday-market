
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const ForgotPasswordPage: React.FC = () => {
    const { t } = useLanguage();
    const { requestPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await requestPasswordReset(email);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 py-12">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800">{t('forgot_password_success_title')}</h2>
                    <p className="mt-4 text-gray-600">{t('forgot_password_success_desc')}</p>
                    <Link to="/login" className="mt-6 inline-block text-blue-600 hover:text-blue-500">
                        &larr; {t('forgot_password_back_to_login')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 py-12">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('forgot_password_title')}</h2>
                <p className="text-center text-gray-600 mb-6">{t('forgot_password_desc')}</p>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('form_email')}</label>
                        <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-amazon-blue bg-amazon-yellow hover:bg-amazon-yellow-light">
                            {t('forgot_password_send_link')}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
                        {t('forgot_password_back_to_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
