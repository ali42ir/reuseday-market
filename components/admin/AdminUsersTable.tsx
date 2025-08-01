import React, { useState } from 'react';
import type { StoredUser, User, UserRole } from '../../types.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminUsersTableProps {
    users: StoredUser[];
    currentUser: User | null;
    isSuperAdmin: boolean;
    onDeleteUser: (userId: number) => void;
    onUpdateRole: (userId: number, role: UserRole) => boolean;
    onCreateUser: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
    onUserCreated: () => void;
}

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    const { t } = useLanguage();
    const roleKey = `admin_role_${role}`;
    const roleText = t(roleKey);

    const roleStyle = {
        super_admin: 'bg-red-200 text-red-800',
        admin: 'bg-blue-200 text-blue-800',
        user: 'bg-gray-200 text-gray-800',
    }[role];

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyle}`}>
            {roleText}
        </span>
    );
};


const AdminUsersTable: React.FC<AdminUsersTableProps> = ({ users, currentUser, isSuperAdmin, onDeleteUser, onUpdateRole, onCreateUser, onUserCreated }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' as UserRole });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newUser.password !== newUser.confirmPassword) {
            setError(t('admin_user_create_password_mismatch'));
            return;
        }
        if (newUser.password.length < 6) {
            setError(t('register_password_length_error'));
            return;
        }
        
        setLoading(true);
        const success = await onCreateUser(newUser.name, newUser.email, newUser.password, newUser.role);
        setLoading(false);
        
        if (success) {
            addToast(t('admin_user_created_toast'), 'success');
            onUserCreated();
            setShowCreateForm(false);
            setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
        } else {
            setError(t('admin_user_create_email_exists_toast'));
        }
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, userId: number) => {
        const newRole = e.target.value as UserRole;
        if(currentUser?.id === userId) {
            addToast(t('admin_cannot_change_own_role'), 'error');
            e.target.value = currentUser.role; // Reset select
            return;
        }
        onUpdateRole(userId, newRole);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold">{t('admin_users_title')} ({users.length})</h2>
                 {isSuperAdmin && (
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg hover:bg-amazon-yellow-light transition-colors text-sm">
                        {showCreateForm ? t('cancel') : t('admin_create_user_button')}
                    </button>
                )}
            </div>
             {isSuperAdmin && showCreateForm && (
                 <div className="my-6 p-4 border rounded-lg bg-gray-50 transition-all duration-300 ease-in-out">
                    <h3 className="text-lg font-bold mb-4">{t('admin_create_user_title')}</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        {error && <p className="text-red-600 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_full_name')}</label>
                                <input type="text" name="name" value={newUser.name} onChange={handleInputChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_email')}</label>
                                <input type="email" name="email" value={newUser.email} onChange={handleInputChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_password')}</label>
                                <input type="password" name="password" value={newUser.password} onChange={handleInputChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_confirm_password')}</label>
                                <input type="password" name="confirmPassword" value={newUser.confirmPassword} onChange={handleInputChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">{t('admin_user_role')}</label>
                           <select name="role" value={newUser.role} onChange={handleInputChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md">
                               <option value="user">{t('admin_role_user')}</option>
                               <option value="admin">{t('admin_role_admin')}</option>
                               <option value="super_admin">{t('admin_role_super_admin')}</option>
                           </select>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                                {loading ? t('register_creating_account') : t('admin_create_user_button')}
                            </button>
                        </div>
                    </form>
                 </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_user_id')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_user_name')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_user_email')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_user_role')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                            const canBeModified = user.id !== 1 && user.id !== currentUser?.id;

                            return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {isSuperAdmin && canBeModified ? (
                                             <select
                                                defaultValue={user.role}
                                                onChange={(e) => handleRoleChange(e, user.id)}
                                                className="p-1 border-gray-300 rounded-md shadow-sm text-xs focus:ring-amazon-yellow focus:border-amazon-yellow"
                                                aria-label={`Role for ${user.name}`}
                                            >
                                                <option value="user">{t('admin_role_user')}</option>
                                                <option value="admin">{t('admin_role_admin')}</option>
                                                {user.role === 'super_admin' && <option value="super_admin">{t('admin_role_super_admin')}</option>}
                                            </select>
                                        ) : (
                                            <RoleBadge role={user.role} />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => onDeleteUser(user.id)} 
                                            disabled={!isSuperAdmin || !canBeModified} 
                                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {t('admin_delete_button')}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersTable;