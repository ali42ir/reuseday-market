import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

// Eye icon for showing password
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C3.732 4.943 7.523 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.523 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

// Eye-off icon for hiding password
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.477 4 12 4c-1.268 0-2.49.231-3.633.668l-1.178-1.178z" clipRule="evenodd" />
        <path d="M2 4.293l1.293 1.293A10.062 10.062 0 00.458 10C3.732 15.057 7.523 17 10 17a9.97 9.97 0 005.18-1.562l1.423 1.423a1 1 0 001.414-1.414L2 4.293zM8 10a2 2 0 114 0 2 2 0 01-4 0z" />
    </svg>
);


interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    // We can extend standard input props
}

const PasswordInput: React.FC<PasswordInputProps> = (props) => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useLanguage();

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <div className="relative">
            <input
                {...props}
                type={isVisible ? 'text' : 'password'}
                className={`${props.className || ''} pr-10`}
            />
            <button
                type="button"
                onClick={toggleVisibility}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={t(isVisible ? 'aria_hide_password' : 'aria_show_password')}
            >
                {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );
};

export default PasswordInput;
