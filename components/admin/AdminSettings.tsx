

import React, { useState, useEffect } from 'react';
import type { BankInfo, FooterLinkLabels } from '../../types.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useSystemSettings } from '../../context/SystemSettingsContext.tsx';

// Basic IBAN validation (structure check, not checksum)
const isValidIBAN = (iban: string): boolean => {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/;
    return ibanRegex.test(iban.replace(/\s/g, ''));
};

const footerLabelKeys: (keyof FooterLinkLabels)[] = [
    'get_to_know_us', 'about', 'contact_us', 'make_money', 'sell_products', 'affiliate',
    'advertise', 'let_us_help', 'your_account', 'your_orders', 'shipping', 'help',
    'payment_products', 'business_card', 'shop_with_points', 'terms', 'privacy'
];

const AdminSettings: React.FC = () => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const { systemSettings, setSystemSettings } = useSystemSettings();

    const [bankInfo, setBankInfo] = useState<BankInfo>({ accountHolder: '', iban: '', swift: '', internalCode: '' });
    const [currentBankInfo, setCurrentBankInfo] = useState<BankInfo | null>(null);
    const [localSettings, setLocalSettings] = useState(systemSettings);
    const [ibanError, setIbanError] = useState<string>('');

    useEffect(() => {
        const storedBankInfo = localStorage.getItem('reuseday_bank_info');
        if (storedBankInfo) {
            setCurrentBankInfo(JSON.parse(storedBankInfo));
        }
    }, []);
    
    useEffect(() => {
        setLocalSettings(systemSettings);
    }, [systemSettings]);
    
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const keys = name.split('.');
        if (keys.length > 1) {
             setLocalSettings(prev => ({
                ...prev,
                [keys[0]]: {
                    // @ts-ignore
                    ...prev[keys[0]],
                    [keys[1]]: value,
                }
            }));
        } else {
             setLocalSettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };


    const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'iban') {
            if (value && !isValidIBAN(value)) {
                setIbanError(t('admin_bank_iban_invalid'));
            } else {
                setIbanError('');
            }
        }
        setBankInfo({ ...bankInfo, [name]: value });
    };

    const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (bankInfo.iban && !isValidIBAN(bankInfo.iban)) {
            addToast(t('admin_bank_iban_invalid'), 'error');
            return;
        }

        const newBankInfoToSave: BankInfo = {
            accountHolder: bankInfo.accountHolder || currentBankInfo?.accountHolder || '',
            iban: bankInfo.iban || currentBankInfo?.iban || '',
            swift: bankInfo.swift || currentBankInfo?.swift || '',
            internalCode: bankInfo.internalCode || currentBankInfo?.internalCode || '',
        };

        localStorage.setItem('reuseday_bank_info', JSON.stringify(newBankInfoToSave));
        setCurrentBankInfo(newBankInfoToSave);
        setBankInfo({ accountHolder: '', iban: '', swift: '', internalCode: '' });

        setSystemSettings({
            ...localSettings,
            commissionRate: Number(localSettings.commissionRate),
            dailyAdRate: Number(localSettings.dailyAdRate) || 0,
            weeklyAdRate: Number(localSettings.weeklyAdRate) || 0,
            enablePaidListings: localSettings.enablePaidListings || false,
            freeListingThreshold: Number(localSettings.freeListingThreshold) || 0,
            listingFee: Number(localSettings.listingFee) || 0,
        });
        
        addToast(t('admin_settings_saved_toast'), 'success');
    };

    return (
        <form onSubmit={handleSaveSettings} className="space-y-8">
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">{t('admin_branding_title')}</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_system_site_title')}</label>
                            <input type="text" name="siteTitle" value={localSettings.siteTitle} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_logo_url')}</label>
                            <input type="url" name="logoUrl" value={localSettings.logoUrl || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="https://example.com/logo.png" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold mb-4">{t('admin_platform_settings')}</h2>
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_system_commission_rate')}</label>
                            <input type="number" name="commissionRate" value={localSettings.commissionRate} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" min="0" max="100" step="0.1" inputMode="decimal" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_default_language')}</label>
                             <select name="defaultLanguage" value={localSettings.defaultLanguage || 'en'} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3">
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="fa">فارسی</option>
                                <option value="ar">العربية</option>
                                <option value="nl">Nederlands</option>
                            </select>
                        </div>
                    </div>
                     <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="maintenanceMode" name="maintenanceMode" type="checkbox" checked={localSettings.maintenanceMode} onChange={handleSettingsChange} className="focus:ring-amazon-yellow h-4 w-4 text-amazon-yellow border-gray-300 rounded"/>
                        </div>
                        <div className="ms-3 text-sm">
                            <label htmlFor="maintenanceMode" className="font-medium text-gray-700">{t('admin_system_maintenance_mode')}</label>
                            <p className="text-gray-500">{t('admin_system_maintenance_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>

             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">{t('admin_advertising_settings')}</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_daily_ad_rate')}</label>
                            <input type="number" name="dailyAdRate" value={localSettings.dailyAdRate || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" min="0" step="0.01" inputMode="decimal" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_weekly_ad_rate')}</label>
                            <input type="number" name="weeklyAdRate" value={localSettings.weeklyAdRate || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" min="0" step="0.01" inputMode="decimal" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">{t('admin_ad_listing_settings')}</h2>
                <p className="text-sm text-gray-600 mb-4">{t('admin_ad_listing_settings_desc')}</p>
                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="enablePaidListings" name="enablePaidListings" type="checkbox" checked={localSettings.enablePaidListings || false} onChange={handleSettingsChange} className="focus:ring-amazon-yellow h-4 w-4 text-amazon-yellow border-gray-300 rounded"/>
                        </div>
                        <div className="ms-3 text-sm">
                            <label htmlFor="enablePaidListings" className="font-medium text-gray-700">{t('admin_enable_paid_listings')}</label>
                            <p className="text-gray-500">{t('admin_enable_paid_listings_desc')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_free_below_price')}</label>
                            <input type="number" name="freeListingThreshold" value={localSettings.freeListingThreshold || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" min="0" step="0.01" inputMode="decimal" />
                             <p className="mt-1 text-xs text-gray-500">{t('admin_free_below_price_desc')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_listing_fee')}</label>
                            <input type="number" name="listingFee" value={localSettings.listingFee || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" min="0" step="0.01" inputMode="decimal" />
                             <p className="mt-1 text-xs text-gray-500">{t('admin_listing_fee_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">{t('admin_footer_labels_title')}</h2>
                <p className="text-sm text-gray-600 mb-4">{t('admin_footer_labels_desc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {footerLabelKeys.map(key => {
                        const translationKeyMap: { [K in keyof FooterLinkLabels]: string } = {
                            get_to_know_us: 'footer_get_to_know_us',
                            about: 'footer_about',
                            contact_us: 'contact_us_title',
                            make_money: 'footer_make_money',
                            sell_products: 'footer_sell_products',
                            affiliate: 'footer_affiliate',
                            advertise: 'footer_advertise',
                            let_us_help: 'footer_let_us_help',
                            your_account: 'footer_your_account',
                            your_orders: 'footer_your_orders',
                            shipping: 'footer_shipping',
                            help: 'footer_help',
                            payment_products: 'footer_payment_products',
                            business_card: 'footer_business_card',
                            shop_with_points: 'footer_shop_with_points',
                            terms: 'footer_terms',
                            privacy: 'footer_privacy'
                        };
                        return (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</label>
                                <input
                                    type="text"
                                    name={`footerLinkLabels.${key}`}
                                    value={localSettings.footerLinkLabels?.[key] || ''}
                                    onChange={handleSettingsChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3"
                                    placeholder={t(translationKeyMap[key])}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">{t('admin_contact_details_title')}</h2>
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_contact_email')}</label>
                            <input type="email" name="contactInfo.supportEmail" value={localSettings.contactInfo?.supportEmail || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="support@example.com"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_contact_phone')}</label>
                            <input type="tel" name="contactInfo.phone" value={localSettings.contactInfo?.phone || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_contact_address')}</label>
                        <input type="text" name="contactInfo.address" value={localSettings.contactInfo?.address || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" />
                    </div>
                 </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">{t('admin_external_links_title')}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_terms_url')}</label>
                        <input type="url" name="links.termsUrl" value={localSettings.links?.termsUrl || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="https://example.com/terms"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin_privacy_url')}</label>
                        <input type="url" name="links.privacyUrl" value={localSettings.links?.privacyUrl || ''} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="https://example.com/privacy"/>
                    </div>
                 </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold mb-2">{t('admin_bank_info')}</h2>
                <p className="text-sm text-gray-600 mb-4">{t('admin_bank_info_desc')}</p>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_bank_account_holder')}</label>
                            <input type="text" name="accountHolder" value={bankInfo.accountHolder} onChange={handleBankInfoChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder={currentBankInfo?.accountHolder ? 'Current value is set' : 'Account Holder'} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin_bank_internal_code')}</label>
                            <input type="text" name="internalCode" value={bankInfo.internalCode || ''} onChange={handleBankInfoChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder={currentBankInfo?.internalCode ? 'Current value is set' : 'Optional Code'} />
                        </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700">{t('admin_bank_iban')}</label>
                       <input type="text" name="iban" value={bankInfo.iban} onChange={handleBankInfoChange} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 ${ibanError ? 'border-red-500' : ''}`} placeholder={currentBankInfo?.iban ? `Current: •••• ${currentBankInfo.iban.slice(-4)}` : t('admin_bank_iban_placeholder')} />
                       {ibanError && <p className="mt-1 text-xs text-red-600">{ibanError}</p>}
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700">{t('admin_bank_swift')}</label>
                       <input type="text" name="swift" value={bankInfo.swift} onChange={handleBankInfoChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder={currentBankInfo?.swift ? `Current: ••••${currentBankInfo.swift.slice(-3)}` : 'SWIFT / BIC Code'} />
                    </div>
                </div>
            </div>

             <div className="flex justify-end sticky bottom-4">
                 <button type="submit" className="bg-amazon-yellow text-amazon-blue font-bold py-3 px-8 rounded-lg hover:bg-amazon-yellow-light transition-colors shadow-lg text-lg">
                    {t('admin_save_button')}
                </button>
            </div>
        </form>
    );
};

export default AdminSettings;