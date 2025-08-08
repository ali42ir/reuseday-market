
import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import type { StaticPage } from '../../types.ts';

const AdminContent: React.FC = () => {
    const { pages, addPage, updatePage, deletePage } = useContent();
    const { t } = useLanguage();
    const { addToast } = useToast();

    const [editingPage, setEditingPage] = useState<Partial<StaticPage> | null>(null);

    const handleSavePage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPage || !editingPage.title || !editingPage.slug) return;

        if (editingPage.id) { // Update existing page
            updatePage(editingPage.id, editingPage);
        } else { // Add new page
            const success = addPage({
                title: editingPage.title,
                slug: editingPage.slug,
                content: editingPage.content || ''
            });
            if (!success) {
                addToast("A page with this slug already exists.", "error");
                return;
            }
        }
        addToast(t('admin_content_page_saved'), 'success');
        setEditingPage(null);
    };

    const handleDeletePage = (id: number) => {
        if (window.confirm(t('admin_content_delete_confirm'))) {
            deletePage(id);
            addToast(t('admin_content_page_deleted'), 'success');
        }
    };
    
    const startNewPage = () => {
        setEditingPage({ title: '', slug: '', content: '' });
    };

    if (editingPage) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">{editingPage.id ? 'Edit Page' : t('admin_content_add')}</h3>
                <form onSubmit={handleSavePage} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_content_form_title')}</label>
                        <input type="text" value={editingPage.title} onChange={e => setEditingPage(p => ({...p, title: e.target.value}))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_content_form_slug')}</label>
                        <input type="text" value={editingPage.slug} onChange={e => setEditingPage(p => ({...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')}))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" placeholder={t('admin_content_form_slug_placeholder')} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_content_form_content')}</label>
                        <textarea value={editingPage.content} onChange={e => setEditingPage(p => ({...p, content: e.target.value}))} rows={15} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm" />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => setEditingPage(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">{t('cancel')}</button>
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg hover:bg-amazon-yellow-light transition-colors">{t('seller_save_changes_button')}</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{t('admin_content_title')} ({pages.length})</h2>
                <button onClick={startNewPage} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg hover:bg-amazon-yellow-light transition-colors">{t('admin_content_add')}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_content_form_title')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_content_form_slug')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pages.map(page => (
                            <tr key={page.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">/pages/{page.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                    <button onClick={() => setEditingPage(page)} className="text-blue-600 hover:text-blue-900">{t('seller_edit_product_button')}</button>
                                    <button onClick={() => handleDeletePage(page.id)} className="text-red-600 hover:text-red-900">{t('admin_delete_button')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminContent;