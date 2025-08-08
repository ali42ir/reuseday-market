import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import Spinner from './Spinner.tsx';

const MAX_DIMENSION = 1024; // Max width/height for the compressed image
const TARGET_QUALITY = 0.8; // JPEG quality

const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height = Math.round((height * MAX_DIMENSION) / width);
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width = Math.round((width * MAX_DIMENSION) / height);
                        height = MAX_DIMENSION;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', TARGET_QUALITY));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const VisualSearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            const compressedDataUrl = await compressImage(file);
            setImagePreview(compressedDataUrl);
        } catch (error) {
            console.error("Image processing error:", error);
            addToast(t('visual_search_error_compress'), 'error');
        } finally {
            setIsProcessing(false);
            // Clear the input value to allow selecting the same file again
            event.target.value = '';
        }
    };

    const handleSearch = async () => {
        if (!imagePreview) return;
        
        setIsProcessing(true);
        try {
            if (!process.env.API_KEY) {
                throw new Error('API key not configured');
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = imagePreview.split(',')[1];
            
            const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Data } };
            const textPart = { text: 'Identify the main object in this image. Provide 3-5 concise, relevant search terms for finding similar items in a second-hand marketplace. Respond with only the search terms, separated by commas.' };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });

            const searchTerms = response.text.trim();
            if (searchTerms) {
                navigate(`/search?q=${encodeURIComponent(searchTerms)}`);
                onClose();
            } else {
                addToast(t('visual_search_error_ai'), 'error');
            }
        } catch (err) {
            console.error('AI search failed:', err);
            addToast(t('visual_search_error_ai'), 'error');
        } finally {
            // Privacy: Clear image from memory immediately after search
            setImagePreview(null);
            setIsProcessing(false);
        }
    };
    
    const handleReset = () => {
        setImagePreview(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100]" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">{t('visual_search_title')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl" aria-label={t('close')}>&times;</button>
                </div>

                <div className="p-6 relative min-h-[250px] flex flex-col justify-center items-center">
                    {isProcessing && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col justify-center items-center rounded-b-lg">
                            <Spinner />
                            <p className="mt-2 text-gray-600">{imagePreview ? t('visual_search_searching_with_ai') : t('visual_search_compressing')}</p>
                        </div>
                    )}

                    {!imagePreview && (
                        <div className="w-full text-center">
                            <p className="text-gray-600 mb-6">{t('visual_search_description')}</p>
                            <div className="flex justify-center">
                                <button onClick={() => uploadInputRef.current?.click()} className="p-6 border-2 border-dashed rounded-lg hover:bg-gray-50 hover:border-amazon-yellow transition w-full sm:w-2/3">
                                    <h4 className="font-bold">{t('visual_search_upload')}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{t('visual_search_upload_desc')}</p>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {imagePreview && (
                        <div className="w-full flex flex-col items-center">
                             <img src={imagePreview} alt="Image preview" className="max-h-64 w-auto rounded-md shadow-md mb-4" />
                             <div className="flex items-center space-x-4">
                                <button onClick={handleReset} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">{t('visual_search_choose_another')}</button>
                                <button onClick={handleSearch} className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg hover:bg-amazon-yellow-light">{t('visual_search_use_image')}</button>
                             </div>
                        </div>
                    )}
                </div>

                {/* Hidden file inputs */}
                <input type="file" accept="image/*" ref={uploadInputRef} onChange={handleFileSelect} className="hidden" />
            </div>
        </div>
    );
};

export default VisualSearchModal;
