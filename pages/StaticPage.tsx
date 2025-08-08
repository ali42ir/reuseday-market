import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.tsx';
import Spinner from '../components/Spinner.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import DOMPurify from 'dompurify';

// A very basic markdown to HTML converter for demonstration
const markdownToHtml = (markdown: string) => {
    return markdown
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 border-b pb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/(\r\n|\n\r|\r|\n){2,}/g, '</p><p>') // Handle paragraphs
        .replace(/^\* (.*$)/gim, '<ul class="list-disc list-inside space-y-2"><li>$1</li></ul>') // Basic lists
        .replace(/<\/ul>\n<ul class="list-disc list-inside space-y-2">/g, ''); // Fix multiple UL tags
};

const StaticPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { getPageBySlug, loading } = useContent();
    const { t } = useLanguage();

    if (loading) {
        return <Spinner />;
    }

    const page = getPageBySlug(slug || '');

    if (!page) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                <p className="text-gray-600 mt-4">The page you are looking for does not exist.</p>
                <Link to="/" className="mt-6 inline-block bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg hover:bg-amazon-yellow-light transition-colors">
                    {t('product_go_home')}
                </Link>
            </div>
        );
    }

    const pageTitleKey = `pages.${page.slug}.title`;
    const pageContentKey = `pages.${page.slug}.content`;

    const translatedTitle = t(pageTitleKey);
    const translatedContent = t(pageContentKey);
    
    // Fallback to CMS content if translation is missing (i.e., t() returns the key)
    const finalTitle = translatedTitle !== pageTitleKey ? translatedTitle : page.title;
    const finalContent = translatedContent !== pageContentKey ? translatedContent : page.content;

    const sanitizedHtml = DOMPurify.sanitize(`<p>${markdownToHtml(finalContent)}</p>`);

    return (
        <div className="bg-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        {finalTitle}
                    </h1>
                </div>
                <div 
                    className="mt-10 prose prose-indigo text-gray-700 mx-auto"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            </div>
        </div>
    );
};

export default StaticPage;