import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import Spinner from '../components/Spinner.tsx';
import PasswordInput from '../components/PasswordInput.tsx';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { validateResetToken, resetPassword, getStoredUser } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);

    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    useEffect(() => {
        const checkToken = async () => {
            if (!token || !userId) {
                setIsTokenValid(false);
                setIsValidating(false);
                return;
            }
            const valid = await validateResetToken(token, Number(userId));
            setIsTokenValid(valid);
            setIsValidating(false);
        };
        checkToken();
    }, [token, userId, validateResetToken]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('register_password_mismatch_error'));
            return;
        }
        if (password.length < 6) {
            setError(t('register_password_length_error'));
            return;
        }
        
        if (token && userId) {
            setLoading(true);
            const success = await resetPassword(token, Number(userId), password);
            setLoading(false);

            if (success) {
                const user = getStoredUser(Number(userId));
                addToast(t('reset_password_success_toast'), 'success');
                navigate('/login', { state: { email: user?.email } });
            } else {
                setError(t('reset_password_invalid_link_error'));
            }
        }
    };

    if (isValidating) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Spinner /></div>;
    }

    if (!isTokenValid) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 py-12">
                 <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold text-red-600">{t('error_title')}</h2>
                    <p className="mt-4">{t('reset_password_invalid_link_error')}</p>
                    <Link to="/forgot-password" className="mt-6 inline-block bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg hover:bg-amazon-yellow-light">
                        {t('forgot_password_title')}
                    </Link>
                 </div>
            </div>
        );
    }


    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 py-12">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{t('reset_password_title')}</h2>
                <form className="mt-6" onSubmit={handleSubmit}>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    
                     <div className="mt-4">
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                          {t('reset_password_new_password')}
                        </label>
                        <div className="mt-1">
                          <PasswordInput
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amazon-yellow focus:border-amazon-yellow sm:text-sm"
                            placeholder={t('register_password_placeholder')}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700">
                          {t('reset_password_confirm_new')}
                        </label>
                        <div className="mt-1">
                          <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amazon-yellow focus:border-amazon-yellow sm:text-sm"
                          />
                        </div>
                      </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-amazon-blue bg-amazon-yellow hover:bg-amazon-yellow-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazon-yellow disabled:bg-gray-400"
                        >
                            {loading ? t('ai_generating') : t('reset_password_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;