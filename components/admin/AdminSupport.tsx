
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSupport } from '../../context/SupportContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import type { SupportTicket, SupportTicketStatus } from '../../types.ts';

const statusColors: { [key in SupportTicketStatus]: string } = {
    New: 'bg-blue-100 text-blue-800',
    Read: 'bg-gray-100 text-gray-800',
    Archived: 'bg-yellow-100 text-yellow-800',
};

const allStatuses: SupportTicketStatus[] = ['New', 'Read', 'Archived'];

const ConversationModal: React.FC<{ 
    ticket: SupportTicket, 
    onClose: () => void,
    onReply: (ticketId: number, replyText: string) => void,
}> = ({ ticket, onClose, onReply }) => {
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    const [replyText, setReplyText] = useState('');
    const conversationEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket.replies]);

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim()) {
            onReply(ticket.id, replyText.trim());
            setReplyText('');
            addToast(t('admin_support_reply_sent_toast'), 'success');
        }
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(language, { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="font-bold text-lg">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600">From: {ticket.name} &lt;{ticket.email}&gt;</p>
                </div>
                <div className="p-4 flex-grow overflow-y-auto bg-gray-50 space-y-4">
                    {/* Original Message */}
                    <div className="flex flex-col items-start">
                        <div className="bg-blue-100 p-3 rounded-lg max-w-lg">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{t('admin_support_user')} - {formatDate(ticket.createdAt)}</span>
                    </div>

                    {/* Replies */}
                    {ticket.replies?.map(reply => (
                        <div key={reply.id} className="flex flex-col items-end">
                            <div className="bg-green-100 p-3 rounded-lg max-w-lg">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{reply.text}</p>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{reply.author} - {formatDate(reply.createdAt)}</span>
                        </div>
                    ))}
                    <div ref={conversationEndRef} />
                </div>
                <div className="p-4 bg-white border-t">
                    <form onSubmit={handleReplySubmit} className="flex items-start space-x-3">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t('admin_support_type_your_reply')}
                            className="flex-grow border-gray-300 rounded-md shadow-sm p-2 text-sm"
                            rows={3}
                            required
                        />
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg hover:bg-amazon-yellow-light transition-colors self-end">
                            {t('admin_support_send_reply')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

interface AdminSupportProps {
    replyToTicket: (ticketId: number, replyText: string) => void;
    deleteTicket: (ticketId: number) => void;
}

const AdminSupport: React.FC<AdminSupportProps> = ({ replyToTicket, deleteTicket }) => {
    const { tickets, updateTicketStatus } = useSupport();
    const { t, language } = useLanguage();
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>('all');

    const sortedTickets = useMemo(() => {
        return [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        if (statusFilter === 'all') return sortedTickets;
        return sortedTickets.filter(ticket => ticket.status === statusFilter);
    }, [sortedTickets, statusFilter]);

    const handleViewMessage = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        if (ticket.status === 'New') {
            updateTicketStatus(ticket.id, 'Read');
        }
    };
    
    const handleDelete = (ticketId: number) => {
        if (window.confirm("Are you sure you want to permanently delete this ticket?")) {
            deleteTicket(ticketId);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(language, { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <>
            {selectedTicket && <ConversationModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onReply={replyToTicket} />}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold">{t('admin_support_title')} ({filteredTickets.length})</h2>
                     <div>
                        <label htmlFor="status-filter" className="sr-only">{t('admin_support_filter_by_status')}</label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as SupportTicketStatus | 'all')}
                            className="p-2 border-gray-300 rounded-md shadow-sm text-sm"
                        >
                            <option value="all">{t('admin_support_all_statuses')}</option>
                            {allStatuses.map(status => (
                                <option key={status} value={status}>{t(`admin_support_status_${status.toLowerCase()}`)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_support_status_new')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_support_subject')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_support_from')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_support_date')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className={ticket.status === 'New' ? 'bg-blue-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}>
                                            {t(`admin_support_status_${ticket.status.toLowerCase()}`)}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${ticket.status === 'New' ? 'font-bold' : 'font-medium'} text-gray-900`}>{ticket.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(ticket.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                        <button onClick={() => handleViewMessage(ticket)} className="text-blue-600 hover:text-blue-900">{t('admin_support_view_message')}</button>
                                        {ticket.status !== 'Archived' && (
                                            <button onClick={() => updateTicketStatus(ticket.id, 'Archived')} className="text-yellow-600 hover:text-yellow-900">{t('admin_support_archive_button')}</button>
                                        )}
                                         <button onClick={() => handleDelete(ticket.id)} className="text-red-600 hover:text-red-900">{t('admin_delete_button')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTickets.length === 0 && (
                        <p className="text-center py-8 text-gray-500">{t('admin_support_no_tickets')}</p>
                    )}
                 </div>
            </div>
        </>
    );
};

export default AdminSupport;