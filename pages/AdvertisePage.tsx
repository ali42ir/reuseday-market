import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useSystemSettings } from '../context/SystemSettingsContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useMarketing } from '../context/MarketingContext.tsx';
import type { AdPackage } from '../types.ts';

const PaymentModal: React.FC<{ adPackage: AdPackage; price: number; onConfirm: () => void; onClose: () => void; }> = ({ adPackage, price, onConfirm, onClose }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold">{t('advertise_purchase_title')}</h3>
                    <p className="my-4 text-gray-600">{t('advertise_purchase_confirm', { package: t(`advertise_package_${adPackage}_title`), price: price.toFixed(2) })}</p>
                    <p className="text-xs text-gray-500 italic mb-6">{t('advertise_purchase_simulation')}</p>
                    <div className="flex justify-center space-x-4">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg">{t('cancel')}</button>
                        <button onClick={onConfirm} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg">{t('advertise_purchase_pay_button')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UploadAdModal: React.FC<{ adPackage: AdPackage; onSubmit: (data: any) => void; onClose: () => void; }> = ({ adPackage, onSubmit, onClose }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ companyName: '', imageUrl: '', linkUrl: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type } = e.target;
        if (type === 'file') {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, [name]: reader.result as string }));
                };
                reader.readAsDataURL(file);
            } else {
                 setFormData(prev => ({...prev, [name]: '' }));
            }
        } else {
             setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, adPackage });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold p-6 border-b">{t('advertise_upload_form_title')}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('form_company_name')}</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_marketing_banner_image')}</label>
                             <input
                                type="file"
                                name="imageUrl"
                                accept="image/*"
                                onChange={handleChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amazon-yellow-light file:text-amazon-blue hover:file:bg-amazon-yellow cursor-pointer"
                                required
                            />
                            {formData.imageUrl && (
                                <div className="mt-4">
                                    <img src={formData.imageUrl} alt="Banner preview" className="h-32 object-contain rounded-md shadow-sm" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_marketing_banner_link')}</label>
                            <input type="url" name="linkUrl" value={formData.linkUrl} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" placeholder="/your-product" required />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-4 rounded-lg">{t('advertise_submit_ad_button')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdvertisePage: React.FC = () => {
    const { t } = useLanguage();
    const { systemSettings } = useSystemSettings();
    const { addToast } = useToast();
    const { submitAdvertisement } = useMarketing();

    const [modalStep, setModalStep] = useState<'none' | 'payment' | 'upload'>('none');
    const [selectedPackage, setSelectedPackage] = useState<AdPackage | null>(null);

    const dailyRate = systemSettings.dailyAdRate || 25;
    const weeklyRate = systemSettings.weeklyAdRate || 150;

    const handlePackageSelect = (adPackage: AdPackage) => {
        setSelectedPackage(adPackage);
        setModalStep('payment');
    };

    const handlePaymentConfirm = () => {
        setModalStep('upload');
    };

    const handleAdSubmit = (data: any) => {
        submitAdvertisement(data);
        addToast(t('ad_submit_success_toast'), 'success');
        setModalStep('none');
        setSelectedPackage(null);
    };

    const handleCloseModal = () => {
        setModalStep('none');
        setSelectedPackage(null);
    };

    return (
        <div className="bg-gray-50 py-12">
            {modalStep === 'payment' && selectedPackage && (
                <PaymentModal
                    adPackage={selectedPackage}
                    price={selectedPackage === 'daily' ? dailyRate : weeklyRate}
                    onConfirm={handlePaymentConfirm}
                    onClose={handleCloseModal}
                />
            )}
             {modalStep === 'upload' && selectedPackage && (
                <UploadAdModal
                    adPackage={selectedPackage}
                    onSubmit={handleAdSubmit}
                    onClose={handleCloseModal}
                />
            )}
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">{t('advertise_page_title')}</h1>
                    <p className="mt-4 text-xl text-gray-600">{t('advertise_page_desc')}</p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('advertise_packages_title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Daily Package */}
                        <div className="border border-gray-200 rounded-lg p-6 flex flex-col text-center hover:shadow-xl transition-shadow">
                            <h3 className="text-2xl font-bold text-gray-900">{t('advertise_package_daily_title')}</h3>
                            <p className="mt-2 text-4xl font-extrabold text-gray-900">{t('advertise_package_daily_price', { price: dailyRate })}</p>
                            <ul className="mt-6 space-y-4 text-gray-600">
                                <li className="flex items-start"><span className="text-green-500 mr-2 flex-shrink-0 mt-1">&#10003;</span> {t('advertise_package_daily_feature1')}</li>
                                <li className="flex items-start"><span className="text-green-500 mr-2 flex-shrink-0 mt-1">&#10003;</span> {t('advertise_package_daily_feature2')}</li>
                            </ul>
                            <button onClick={() => handlePackageSelect('daily')} className="mt-auto w-full bg-amazon-yellow text-amazon-blue font-bold py-3 px-6 rounded-lg hover:bg-amazon-yellow-light transition-colors mt-8">
                                {t('advertise_select_package')}
                            </button>
                        </div>
                        {/* Weekly Package */}
                        <div className="border-2 border-yellow-400 rounded-lg p-6 flex flex-col text-center relative hover:shadow-xl transition-shadow">
                            <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase">{t('advertise_best_value')}</span>
                            <h3 className="text-2xl font-bold text-gray-900">{t('advertise_package_weekly_title')}</h3>
                            <p className="mt-2 text-4xl font-extrabold text-gray-900">{t('advertise_package_weekly_price', { price: weeklyRate })}</p>
                            <ul className="mt-6 space-y-4 text-gray-600">
                                <li className="flex items-start"><span className="text-green-500 mr-2 flex-shrink-0 mt-1">&#10003;</span> {t('advertise_package_weekly_feature1')}</li>
                                <li className="flex items-start"><span className="text-green-500 mr-2 flex-shrink-0 mt-1">&#10003;</span> {t('advertise_package_weekly_feature2')}</li>
                            </ul>
                             <button onClick={() => handlePackageSelect('weekly')} className="mt-auto w-full bg-amazon-yellow text-amazon-blue font-bold py-3 px-6 rounded-lg hover:bg-amazon-yellow-light transition-colors mt-8">
                                {t('advertise_select_package')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvertisePage;