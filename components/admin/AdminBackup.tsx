import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';

const AdminBackup: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{t('admin_backup_title')}</h2>
            <p className="text-sm text-gray-600 mb-6">{t('admin_project_archive_desc')}</p>
            <a
                href="/backups/reuseday-final.zip"
                download="reuseday-final.zip"
                className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-800 transition-colors flex justify-center items-center text-lg"
            >
                {t('admin_backup_button')}
            </a>
        </div>
    );
};

export default AdminBackup;