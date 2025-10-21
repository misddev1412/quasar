'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { appEvents, ToastEvent } from '../utils/trpc-error-link';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: ToastEvent) => void;
  removeToast: (id: string) => void;
}

interface ToastMessage extends ToastEvent {
  id: string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: ToastEvent) => {
    const id = Date.now().toString();
    const description = toast.description ?? toast.message;
    const newToast: ToastMessage = { ...toast, id, description };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Listen for toast events from tRPC error link
  useEffect(() => {
    const unsubscribe = appEvents.on('show-toast', (data: ToastEvent) => {
      showToast(data);
    });

    return unsubscribe;
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  const getToastStyles = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end justify-end gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            relative w-full max-w-[80vw] sm:max-w-xs md:max-w-sm min-w-[240px] px-5 py-4 rounded-lg shadow-lg backdrop-blur-sm
            transform transition-all duration-300 ease-in-out hover:scale-[1.02]
            ${getToastStyles(toast.type)}
          `}
        >
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col items-center text-center gap-1">
            <h3 className="font-semibold text-sm leading-tight">{toast.title}</h3>
            {(toast.description || toast.message) && (
              <p className="text-xs opacity-90 leading-tight">
                {toast.description || toast.message}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastProvider;
