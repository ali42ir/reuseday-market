import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

const MasqueradeBanner: React.FC = () => {
    const { masqueradeAdminId, user, returnToAdmin } = useAuth();
    const { t } = useLanguage();

    if (!masqueradeAdminId) {
        return null;
    }

    return (
        <div className="bg-yellow-500 text-black text-center p-2 fixed top-0 w-full z-[100] shadow-lg">
            <span className="font-semibold">
                {t('masquerade_banner_text', { name: user?.name || '' })}
            </span>
            <button 
                onClick={returnToAdmin}
                className="ml-4 bg-amazon-blue text-white font-bold py-1 px-3 rounded-md text-sm hover:bg-amazon-blue-light transition-colors"
            >
                {t('masquerade_banner_return')}
            </button>
        </div>
    );
};

export default MasqueradeBanner;
