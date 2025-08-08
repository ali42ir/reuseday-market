
import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useContent } from '../context/ContentContext.tsx';
import { useSystemSettings } from '../context/SystemSettingsContext.tsx';
import { Link } from 'react-router-dom';
import type { FooterLinkLabels } from '../types.ts';

const FooterLink: React.FC<{
  cmsPages: ReturnType<typeof useContent>['pages'];
  settingsLinks: ReturnType<typeof useSystemSettings>['systemSettings']['links'];
  linkKey: 'terms' | 'privacy';
  cmsSlug: string;
  label: string;
}> = ({ cmsPages, settingsLinks, linkKey, cmsSlug, label }) => {
  const url = settingsLinks?.[`${linkKey}Url`];
  const cmsPageExists = cmsPages.some(p => p.slug === cmsSlug);

  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">{label}</a>;
  }
  if (cmsPageExists) {
    return <Link to={`/pages/${cmsSlug}`} className="hover:underline">{label}</Link>;
  }
  return <span className="text-gray-400 cursor-not-allowed">{label}</span>;
};

const SocialIcon: React.FC<{ href: string; children: React.ReactNode, 'aria-label': string }> = ({ href, children, 'aria-label': ariaLabel }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className="text-gray-300 hover:text-white transition-colors p-2">
        {children}
    </a>
);


const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { pages } = useContent();
  const { systemSettings } = useSystemSettings();
  
  const aboutPage = pages.find(p => p.slug === 'about-us');

  const getLabel = (key: keyof FooterLinkLabels, fallbackKey: string) => {
    return systemSettings.footerLinkLabels?.[key] || t(fallbackKey);
  };

  return (
    <footer className="bg-amazon-blue-light text-white mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-start">
          
          {/* Column 1: Get to Know Us */}
          <div className="py-2">
            <h3 className="font-bold mb-4">{getLabel('get_to_know_us', 'footer_get_to_know_us')}</h3>
            <ul className="space-y-3 text-sm">
               {aboutPage && (
                 <li key={aboutPage.id}>
                   <Link to={`/pages/${aboutPage.slug}`} className="hover:underline">{getLabel('about', 'footer_about')}</Link>
                 </li>
               )}
               <li><Link to="/contact" className="hover:underline">{getLabel('contact_us', 'contact_us_title')}</Link></li>
            </ul>
          </div>

          {/* Column 2: Make Money with Us */}
          <div className="py-2">
            <h3 className="font-bold mb-4">{getLabel('make_money', 'footer_make_money')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/sell" className="hover:underline">{getLabel('sell_products', 'footer_sell_products')}</Link></li>
              <li><Link to="/pages/affiliate-program" className="hover:underline">{getLabel('affiliate', 'footer_affiliate')}</Link></li>
              <li><Link to="/advertise" className="hover:underline">{getLabel('advertise', 'footer_advertise')}</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Let Us Help You */}
          <div className="py-2">
            <h3 className="font-bold mb-4">{getLabel('let_us_help', 'footer_let_us_help')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/profile" className="hover:underline">{getLabel('your_account', 'footer_your_account')}</Link></li>
              <li><Link to="/profile/orders" className="hover:underline">{getLabel('your_orders', 'footer_your_orders')}</Link></li>
              <li><Link to="/pages/shipping-policy" className="hover:underline">{getLabel('shipping', 'footer_shipping')}</Link></li>
              <li><Link to="/pages/help-faq" className="hover:underline">{getLabel('help', 'footer_help')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Policies & Payment */}
          <div className="py-2">
            <h3 className="font-bold mb-4">{getLabel('payment_products', 'footer_payment_products')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/pages/business-card" className="hover:underline">{getLabel('business_card', 'footer_business_card')}</Link></li>
              <li><Link to="/pages/shop-with-points" className="hover:underline">{getLabel('shop_with_points', 'footer_shop_with_points')}</Link></li>
              <li>
                <FooterLink 
                  cmsPages={pages} 
                  settingsLinks={systemSettings.links} 
                  linkKey="terms" 
                  cmsSlug="terms-of-service"
                  label={getLabel('terms', 'footer_terms')}
                />
              </li>
              <li>
                <FooterLink 
                  cmsPages={pages} 
                  settingsLinks={systemSettings.links} 
                  linkKey="privacy" 
                  cmsSlug="privacy-policy"
                  label={getLabel('privacy', 'footer_privacy')}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-amazon-blue py-6">
        <div className="container mx-auto px-4 border-t border-gray-600 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 text-center sm:text-start max-w-lg">{t('footer_professional_disclaimer')}</p>
            <div className="flex justify-center sm:justify-end space-x-2">
                <SocialIcon href="#" aria-label={t('social_facebook_aria')}>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                </SocialIcon>
                <SocialIcon href="#" aria-label={t('social_instagram_aria')}>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.585.069-4.85c.149-3.225 1.664 4.771 4.919 4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z" /></svg>
                </SocialIcon>
                <SocialIcon href="#" aria-label={t('social_twitter_aria')}>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </SocialIcon>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;