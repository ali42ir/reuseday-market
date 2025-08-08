import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import PasswordInput from '../PasswordInput.tsx';

const AdminBackup: React.FC = () => {
    const { t, language } = useLanguage();
    const { isSuperAdmin, verifyCurrentUserPassword } = useAuth();
    
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [downloadCallback, setDownloadCallback] = useState<(() => void) | null>(null);
    const [lastBackupTimestamp, setLastBackupTimestamp] = useState<string | null>(null);

    useEffect(() => {
        setLastBackupTimestamp(localStorage.getItem('lastBackupTimestamp'));
    }, []);
    
    const updateLastBackupTimestamp = () => {
        const timestamp = new Date().toISOString();
        localStorage.setItem('lastBackupTimestamp', timestamp);
        setLastBackupTimestamp(timestamp);
    };

    const downloadFile = (content: string, fileName: string, contentType: string) => {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
        updateLastBackupTimestamp();
    };

    const convertToCSV = (data: any[]) => {
        if (!data || data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map(header => {
                let cellData = row[header];
                if (cellData === null || cellData === undefined) {
                    cellData = '';
                } else if (typeof cellData === 'object') {
                    cellData = JSON.stringify(cellData);
                }
                const escaped = ('' + cellData).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    };

    const handleDownloadData = (key: string, fileName: string, format: 'json' | 'csv') => {
        let data;
        if (key === 'all_orders') {
            const allUsers: { id: number }[] = JSON.parse(localStorage.getItem('users') || '[]');
            const allOrdersData = allUsers.flatMap(u => {
                const ordersRaw = localStorage.getItem(`orders_${u.id}`);
                return ordersRaw ? JSON.parse(ordersRaw) : [];
            });
            data = Array.from(new Map(allOrdersData.map((o: {id: string}) => [o.id, o])).values());
        } else {
             data = JSON.parse(localStorage.getItem(key) || '[]');
        }

        if (format === 'json') {
            downloadFile(JSON.stringify(data, null, 2), `${fileName}.json`, 'application/json');
        } else {
            downloadFile(convertToCSV(data), `${fileName}.csv`, 'text/csv;charset=utf-8;');
        }
    };
    
    const handleProjectDownload = () => {
        // This is a simulation. In a real app, this would be a server-side process.
        // We will create a dummy text file to represent the ZIP.
        const zipContent = "This is a simulated ZIP file containing the project's full source code and assets.";
        downloadFile(zipContent, 'reuseday-final.zip', 'application/zip');
    };

    const requestDownload = (callback: () => void) => {
        setDownloadCallback(() => callback);
        setIsPasswordModalOpen(true);
    };

    const handlePasswordConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        const isCorrect = await verifyCurrentUserPassword(password);
        if (isCorrect) {
            if (downloadCallback) {
                downloadCallback();
            }
            setIsPasswordModalOpen(false);
            setPassword('');
            setDownloadCallback(null);
        } else {
            setPasswordError(t('login_error'));
        }
    };
    
    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPassword('');
        setPasswordError('');
        setDownloadCallback(null);
    }
    
    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div className="space-y-8">
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={closePasswordModal}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handlePasswordConfirm}>
                            <div className="p-6">
                                <h3 className="text-lg font-bold">{t('admin_backup_password_prompt')}</h3>
                                {passwordError && <p className="text-red-600 text-sm bg-red-100 p-2 rounded-md mt-2">{passwordError}</p>}
                                <div className="mt-4">
                                     <PasswordInput value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md" autoFocus required />
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end space-x-3">
                                <button type="button" onClick={closePasswordModal} className="bg-gray-200 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                                <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg">{t('admin_backup_confirm_button')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
             <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md">
                <p className="font-bold">{t('admin_backup_reminder_title')}</p>
                <p className="text-sm">
                    {lastBackupTimestamp 
                        ? t('admin_backup_last_backup_date', { date: new Date(lastBackupTimestamp).toLocaleString(language) }) 
                        : t('admin_backup_no_backup_yet')}
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">{t('admin_data_backup')}</h2>
                <p className="text-sm text-gray-600 mb-6">{t('admin_backup_desc')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Users */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <h3 className="font-bold text-gray-800">{t('admin_tab_users')}</h3>
                        <div className="flex space-x-2 mt-2">
                             <button onClick={() => requestDownload(() => handleDownloadData('users', 'reuseday_users', 'json'))} className="text-sm bg-blue-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-blue-600">JSON</button>
                             <button onClick={() => requestDownload(() => handleDownloadData('users', 'reuseday_users', 'csv'))} className="text-sm bg-green-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-600">{t('admin_backup_export_csv')}</button>
                        </div>
                    </div>
                    {/* Products */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <h3 className="font-bold text-gray-800">{t('admin_tab_products')}</h3>
                         <div className="flex space-x-2 mt-2">
                             <button onClick={() => requestDownload(() => handleDownloadData('reuseday_products_v2', 'reuseday_products', 'json'))} className="text-sm bg-blue-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-blue-600">JSON</button>
                             <button onClick={() => requestDownload(() => handleDownloadData('reuseday_products_v2', 'reuseday_products', 'csv'))} className="text-sm bg-green-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-600">{t('admin_backup_export_csv')}</button>
                        </div>
                    </div>
                    {/* Orders */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <h3 className="font-bold text-gray-800">{t('admin_tab_orders')}</h3>
                         <div className="flex space-x-2 mt-2">
                             <button onClick={() => requestDownload(() => handleDownloadData('all_orders', 'reuseday_orders', 'json'))} className="text-sm bg-blue-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-blue-600">JSON</button>
                             <button onClick={() => requestDownload(() => handleDownloadData('all_orders', 'reuseday_orders', 'csv'))} className="text-sm bg-green-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-600">{t('admin_backup_export_csv')}</button>
                        </div>
                    </div>
                </div>
            </div>

             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">{t('admin_project_archive_title')}</h2>
                <p className="text-sm text-gray-600 mb-6">{t('admin_project_archive_desc')}</p>
                <button
                    onClick={() => requestDownload(handleProjectDownload)}
                    className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-800 transition-colors flex justify-center items-center text-lg"
                >
                    {t('admin_project_archive_button_zip')}
                </button>
            </div>
        </div>
    );
};

export default AdminBackup;
