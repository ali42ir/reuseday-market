
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import PasswordInput from '../components/PasswordInput.tsx';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const fromPath = location.state?.from?.pathname;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated) {
      const targetPath = fromPath || '/';
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, fromPath, navigate]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);

    setLoading(false);
    if (!success) {
      setError(t('login_error'));
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        
        {fromPath && (
           <div className="bg-blue-100 border-s-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md" role="alert">
              <p className="font-bold">{t('login_required_title')}</p>
              <p>{t('login_required_text', { path: fromPath })}</p>
           </div>
        )}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">{t('login_title')}</h2>
        <form className="mt-6" onSubmit={handleSubmit}>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('form_email')}
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amazon-yellow focus:border-amazon-yellow sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center">
                <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                  {t('form_password')}
                </label>
                 <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                        {t('login_forgot_password')}
                    </Link>
                </div>
            </div>
            <div className="mt-1">
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? t('login_signing_in') : t('login_title')}
            </button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('login_new_to_reuseday')}</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('login_create_account_button')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;