
import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';

const AdminContentPlaceholder: React.FC = () => {
    const { t } = useLanguage();
    
    return (
        <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center justify-center min-h-[40vh]">
            <svg className="h-16 w-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700">{t('admin_tab_coming_soon')}</h2>
            <p className="text-gray-500 mt-2">This feature is currently under development.</p>
        </div>
    );
};

export default AdminContentPlaceholder;
