import React, { useMemo, useState } from 'react';
import { useComplaint } from '../../context/ComplaintContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import type { Complaint } from '../../types.ts';

const ComplaintDetailsModal: React.FC<{ complaint: Complaint; onClose: () => void; }> = ({ complaint, onClose }) => {
    const { t, language } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold">{t('admin_complaint_details_title', { orderId: complaint.orderId.slice(-6) })}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p><strong>{t('admin_complaints_subject')}:</strong> {complaint.subject}</p>
                    <p><strong>{t('admin_complaints_user')}:</strong> {complaint.userName} (ID: {complaint.userId})</p>
                    <p><strong>{t('admin_complaints_seller')}:</strong> (ID: {complaint.sellerId})</p>
                    <p><strong>{t('admin_complaints_date')}:</strong> {new Date(complaint.createdAt).toLocaleString(language)}</p>
                    <div className="border-t pt-4">
                        <p className="font-semibold">{t('complaint_description')}:</p>
                        <p className="whitespace-pre-wrap text-gray-700">{complaint.description}</p>
                    </div>
                    {complaint.imageUrl && (
                         <div>
                             <p className="font-semibold">{t('admin_complaint_image_evidence')}:</p>
                             <img src={complaint.imageUrl} alt="Evidence" className="mt-2 max-w-sm rounded-md shadow-md" />
                         </div>
                    )}
                    {!complaint.imageUrl && <p className="text-sm text-gray-500">{t('admin_complaint_no_image')}</p>}
                </div>
                 <div className="p-4 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('close')}</button>
                </div>
            </div>
        </div>
    );
};

const AdminComplaints: React.FC = () => {
    const { getComplaintsForAdmin } = useComplaint();
    const { t } = useLanguage();
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
    const complaints = getComplaintsForAdmin();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {viewingComplaint && <ComplaintDetailsModal complaint={viewingComplaint} onClose={() => setViewingComplaint(null)} />}
            <h2 className="text-xl font-bold mb-4">{t('admin_complaints_title')} ({complaints.length})</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_complaints_order_id')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_complaints_user')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_complaints_subject')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_order_status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {complaints.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">#{c.orderId.slice(-6)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{c.userName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{c.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{c.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => setViewingComplaint(c)} className="text-blue-600 hover:text-blue-900">{t('admin_complaints_view_details')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {complaints.length === 0 && <p className="text-center py-4 text-gray-500">{t('admin_complaints_no_complaints')}</p>}
            </div>
        </div>
    );
};
export default AdminComplaints;
