
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import PasswordInput from '../components/PasswordInput.tsx';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [error, setError] = useState('');
  const [emailExistsError, setEmailExistsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setEmailExistsError(false);

    if (password !== confirmPassword) {
      setError(t('register_password_mismatch_error'));
      return;
    }
    if (!policyAccepted) {
      setError(t('register_agreement_error'));
      return;
    }
    if (password.length < 6) {
        setError(t('register_password_length_error'));
        return;
    }
    setLoading(true);

    const success = await register(name, email, password, isSeller);

    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setEmailExistsError(true);
    }
  };

  const renderAgreementText = () => {
    const agreementText = t('register_agreement');
    const privacyText = t('register_privacy_link');
    const termsText = t('register_terms_link');

    const privacyParts = agreementText.split(privacyText);
    if (privacyParts.length !== 2) {
      return <span>{agreementText}</span>;
    }

    const termsParts = privacyParts[1].split(termsText);
    if (termsParts.length !== 2) {
      return (
        <span className="text-gray-700">
          {privacyParts[0]}
          <Link to="/pages/privacy-policy" className="font-medium text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">
            {privacyText}
          </Link>
          {privacyParts[1]}
        </span>
      );
    }

    return (
      <span className="text-gray-700">
        {privacyParts[0]}
        <Link to="/pages/privacy-policy" className="font-medium text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">
          {privacyText}
        </Link>
        {termsParts[0]}
        <Link to="/pages/terms-of-service" className="font-medium text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">
          {termsText}
        </Link>
        {termsParts[1]}
      </span>
    );
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">{t('register_title')}</h2>
        <form className="mt-6" onSubmit={handleSubmit}>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm" role="alert">{error}</p>}
          {emailExistsError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm" role="alert">
                <span>{t('register_error_email_exists')} </span>
                <Link
                    to="/login"
                    state={{ email: email }}
                    className="font-bold underline hover:text-red-900"
                >
                    {t('register_try_logging_in')}
                </Link>
              </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {t('form_name')}
            </label>
            <div className="mt-1">
              <input id="name" name="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amazon-yellow focus:border-amazon-yellow sm:text-sm" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('form_email')}
            </label>
            <div className="mt-1">
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amazon-yellow focus:border-amazon-yellow sm:text-sm" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
              {t('form_password')}
            </label>
            <div className="mt-1">
              <PasswordInput id="password" name="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amazon-yellow focus:border-amazon-yellow sm:text-sm ${error && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder={t('register_password_placeholder')} />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700">
              {t('form_confirm_password')}
            </label>
            <div className="mt-1">
              <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amazon-yellow focus:border-amazon-yellow sm:text-sm ${error && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
             <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="isSeller" name="isSeller" type="checkbox" checked={isSeller} onChange={(e) => setIsSeller(e.target.checked)} className="focus:ring-amazon-yellow h-4 w-4 text-amazon-yellow border-gray-300 rounded" />
                </div>
                <div className="ms-3 text-sm">
                    <label htmlFor="isSeller" className="font-light text-gray-700">
                        {t('register_i_want_to_sell')}
                    </label>
                </div>
            </div>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="terms" name="terms" type="checkbox" checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} className="focus:ring-amazon-yellow h-4 w-4 text-amazon-yellow border-gray-300 rounded" />
                </div>
                <div className="ms-3 text-sm">
                    <label htmlFor="terms" className="font-light">
                        {renderAgreementText()}
                    </label>
                </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button type="submit" disabled={loading || !policyAccepted} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-amazon-blue bg-amazon-yellow hover:bg-amazon-yellow-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazon-yellow disabled:bg-gray-400 disabled:cursor-not-allowed">
              {loading ? t('register_creating_account') : t('register_title')}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            {t('register_already_have_account')}{' '}
            <Link to="/login" state={{ email: email }} className="font-medium text-blue-600 hover:text-blue-500">
              {t('header_sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;