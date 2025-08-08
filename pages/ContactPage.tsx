
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useSupport } from '../context/SupportContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

const ContactPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { addTicket } = useSupport();
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        addTicket({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
        });

        setTimeout(() => {
            setLoading(false);
            addToast(t('form_message_sent_toast'), 'success');
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                subject: '',
                message: '',
            });
        }, 1000); // Simulate network delay
    };

    return (
        <div className="bg-gray-100 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900">{t('contact_us_title')}</h1>
                        <p className="mt-2 text-gray-600">{t('contact_us_desc')}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('form_name')}</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('form_email')}</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">{t('form_subject')}</label>
                            <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">{t('form_message')}</label>
                            <textarea name="message" id="message" rows={5} value={formData.message} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-amazon-blue bg-amazon-yellow hover:bg-amazon-yellow-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazon-yellow disabled:bg-gray-400">
                                {loading ? t('ai_generating') : t('form_send_message_button')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
