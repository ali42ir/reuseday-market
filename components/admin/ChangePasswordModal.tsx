import React, { useState } from 'react';
import type { StoredUser } from '../../types.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import PasswordInput from '../PasswordInput.tsx';

interface ChangePasswordModalProps {
    user: StoredUser;
    onClose: () => void;
    onSubmit: (newPassword: string) => Promise<void>;
    secureChange: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ user, onClose, onSubmit, secureChange }) => {
    const { t } = useLanguage();
    const { verifyCurrentUserPassword } = useAuth();

    const [step, setStep] = useState<'verify_password' | 'set_password'>(
        secureChange ? 'verify_password' : 'set_password'
    );

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCurrentPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const isCorrect = await verifyCurrentUserPassword(currentPassword);
        if (isCorrect) {
            setStep('set_password');
        } else {
            setError(t('login_error'));
        }
        setLoading(false);
    };

    const handleNewPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmNewPassword) {
            setError(t('register_password_mismatch_error'));
            return;
        }
        if (newPassword.length < 6) {
            setError(t('register_password_length_error'));
            return;
        }
        setLoading(true);
        await onSubmit(newPassword);
        setLoading(false);
    };

    const renderContent = () => {
        switch (step) {
            case 'verify_password':
                return (
                    <form onSubmit={handleCurrentPasswordSubmit}>
                        <div className="p-6 space-y-4">
                            <h2 className="text-xl font-bold">{t('change_password_verify_identity')}</h2>
                            <p className="text-sm text-gray-600">{t('change_password_enter_current')}</p>
                            {error && <p className="text-red-600 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_password')}</label>
                                <PasswordInput value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md" autoFocus required />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-gray-200 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                            <button type="submit" disabled={loading} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">{loading ? t('ai_generating') : t('change_password_unlock')}</button>
                        </div>
                    </form>
                );
            case 'set_password':
                return (
                     <form onSubmit={handleNewPasswordSubmit}>
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">{t('admin_change_password_modal_title', { name: user.name })}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && <p className="text-red-600 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('reset_password_new_password')}</label>
                                <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required autoFocus/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('reset_password_confirm_new')}</label>
                                <PasswordInput value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-gray-200 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                            <button type="submit" disabled={loading} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">{loading ? t('ai_generating') : t('reset_password_button')}</button>
                        </div>
                    </form>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                {renderContent()}
            </div>
        </div>
    );
};

export default ChangePasswordModal;