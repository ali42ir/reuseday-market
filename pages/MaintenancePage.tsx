
import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

const MaintenancePage: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-center px-4">
            <div>
                 <svg className="h-20 w-20 text-amazon-yellow mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h1 className="text-4xl font-bold text-gray-800 mb-3">
                    {t('maintenance_title')}
                </h1>
                <p className="text-gray-600 text-lg">
                    {t('maintenance_text')}
                </p>
            </div>
        </div>
    );
};

export default MaintenancePage;
