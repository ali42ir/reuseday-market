import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useLanguage } from '../context/LanguageContext.tsx';

// A simple markdown-to-JSX converter for bolding text
const formatMessage = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const Chatbot: React.FC = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ author: 'user' | 'ai'; text: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const [hasStarted, setHasStarted] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            try {
                if (process.env.API_KEY) {
                    const systemInstruction = t('ai_chatbot_system_instruction');
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    chatRef.current = ai.chats.create({
                        model: 'gemini-2.5-flash',
                        config: { systemInstruction: systemInstruction },
                    });
                    setMessages([{ author: 'ai', text: t('ai_chatbot_welcome_message') }]);
                    setHasStarted(false);
                }
            } catch (e) {
                console.error("Failed to initialize Gemini Chat", e);
                setMessages([{ author: 'ai', text: t('ai_chatbot_error') }]);
            }
        } else {
            // Cleanup when modal is closed
            chatRef.current = null;
            setMessages([]);
        }
    }, [isOpen, language, t]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleStarterClick = async (question: string) => {
        if (isLoading || !chatRef.current) return;

        setHasStarted(true);
        const userMessage = { author: 'user' as const, text: question };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: question });
            const aiMessage = { author: 'ai' as const, text: response.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage = { author: 'ai' as const, text: t('ai_chatbot_error') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        setHasStarted(true);
        const userMessage = { author: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: input });
            const aiMessage = { author: 'ai' as const, text: response.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage = { author: 'ai' as const, text: t('ai_chatbot_error') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-5 end-5 z-50 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-amazon-blue text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-amazon-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazon-yellow"
                    aria-label={t('ai_chatbot_aria_open')}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            </div>

            <div className={`fixed bottom-5 end-5 z-50 w-[calc(100%-2.5rem)] max-w-sm h-[70vh] max-h-[500px] bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-3 bg-[#1a2b4c] text-white rounded-t-lg">
                    <div className="flex items-center space-x-2">
                         <svg
                            className="h-6 w-6 text-green-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <polyline points="17 1 21 5 17 9"></polyline>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                            <polyline points="7 23 3 19 7 15"></polyline>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                        </svg>
                        <h3 className="font-bold">{t('ai_chatbot_title')}</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 text-2xl" aria-label={t('close')}>&times;</button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-[#1a2b4c] space-y-3">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-xl ${
                                msg.author === 'user' 
                                ? 'max-w-[80%] bg-blue-600 text-white rounded-br-none' 
                                : 'w-full bg-gray-700 text-white rounded-bl-none'
                            }`}>
                                <p className={`text-sm ${msg.author === 'ai' ? 'text-justify' : ''}`}>
                                    {formatMessage(msg.text)}
                                </p>
                            </div>
                        </div>
                    ))}
                     {!isLoading && !hasStarted && messages.length === 1 && (
                        <div className="pt-2">
                            <div className="flex flex-col items-start gap-2">
                                {[t('ai_chatbot_starter1'), t('ai_chatbot_starter2'), t('ai_chatbot_starter3')].map((starter, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleStarterClick(starter)}
                                        className="bg-gray-700 text-white text-sm text-left p-2 rounded-lg hover:bg-gray-600 transition-colors max-w-full truncate"
                                    >
                                        {starter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="max-w-[80%] p-3 rounded-xl bg-gray-700 text-white rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}></div>
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-[#1a2b4c]">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('ai_chatbot_input_placeholder')}
                            className="flex-1 p-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-yellow bg-gray-800 text-white"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-[#28a745] hover:bg-[#218838] text-white p-3 rounded-lg font-bold disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isLoading || !input.trim()}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Chatbot;