
import React, { useMemo, useState } from 'react';
import { useKindWall } from '../../context/KindWallContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import type { KindWallPost, KindWallPostStatus } from '../../types.ts';
import { useToast } from '../../context/ToastContext.tsx';

const statusColors: { [key in KindWallPostStatus]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

const allStatuses: KindWallPostStatus[] = ['pending', 'approved', 'rejected'];

const AdminKindWall: React.FC = () => {
    const { posts, updatePostStatus, deletePost } = useKindWall();
    const { t, language } = useLanguage();
    const { addToast } = useToast();

    const [statusFilter, setStatusFilter] = useState<KindWallPostStatus | 'all'>('all');

    const sortedPosts = useMemo(() => {
        return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [posts]);

    const filteredPosts = useMemo(() => {
        if (statusFilter === 'all') return sortedPosts;
        return sortedPosts.filter(post => post.status === statusFilter);
    }, [sortedPosts, statusFilter]);

    const handleDelete = (postId: number) => {
        if (window.confirm(t('kindwall_admin_delete_confirm'))) {
            deletePost(postId);
            addToast(t('kindwall_admin_deleted_toast'), 'success');
        }
    };
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(language);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h2 className="text-xl font-bold">{t('kindwall_title')} ({filteredPosts.length})</h2>
                 <div>
                    <label htmlFor="status-filter" className="sr-only">{t('admin_order_filter_by_status')}</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as KindWallPostStatus | 'all')}
                        className="p-2 border-gray-300 rounded-md shadow-sm text-sm"
                    >
                        <option value="all">{t('admin_order_all_statuses')}</option>
                        {allStatuses.map(status => (
                            <option key={status} value={status}>{t(`kindwall_admin_status_${status}`)}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('kindwall_admin_table_title')}</th>
                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_user_name')}</th>
                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('kindwall_admin_table_type')}</th>
                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_status')}</th>
                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_date')}</th>
                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPosts.map(post => (
                             <tr key={post.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{post.userName}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{t(`kindwall_label_${post.type === 'giving' ? 'free' : 'wanted'}`)}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[post.status]}`}>
                                        {t(`kindwall_admin_status_${post.status}`)}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    {post.status === 'pending' && (
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => updatePostStatus(post.id, 'approved')} className="text-green-600 hover:text-green-900">{t('ad_action_approve')}</button>
                                            <button onClick={() => updatePostStatus(post.id, 'rejected')} className="text-red-600 hover:text-red-900">{t('ad_action_reject')}</button>
                                        </div>
                                    )}
                                    {post.status !== 'pending' && (
                                         <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">{t('admin_delete_button')}</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredPosts.length === 0 && (
                    <p className="text-center py-4 text-gray-500">{t('admin_complaints_no_complaints')}</p>
                )}
            </div>
        </div>
    );
};

export default AdminKindWall;