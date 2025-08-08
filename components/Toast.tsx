
import React, { useEffect, useState } from 'react';
import type { ToastMessage } from '../context/ToastContext.tsx';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgClass: 'bg-green-500',
  },
  error: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgClass: 'bg-red-500',
  },
  info: {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    bgClass: 'bg-blue-500',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRemove();
    }, 4500); // Start exit animation slightly before removal
    return () => clearTimeout(timer);
  }, []);
  
  const handleRemove = () => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 500); // Match animation duration
  };

  const config = toastConfig[toast.type];

  return (
    <div
      className={`
        w-full max-w-sm rounded-lg shadow-lg pointer-events-auto my-2
        transform transition-all duration-500 ease-in-out
        ${config.bgClass}
        ${isExiting ? 'opacity-0 ltr:translate-x-full rtl:-translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className="rounded-lg shadow-xs overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{config.icon}</div>
            <div className="ms-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-white">{toast.message}</p>
            </div>
            <div className="ms-4 flex-shrink-0 flex">
              <button
                onClick={handleRemove}
                className="inline-flex text-white rounded-md hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;