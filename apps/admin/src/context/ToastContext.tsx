import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { appEvents } from '../lib/event-emitter';

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
};

type ToastContextType = {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, ...toast }]);
  }, []);

  useEffect(() => {
    const handleShowToast = (toast: Omit<ToastMessage, 'id'>) => {
      addToast(toast);
    };

    appEvents.on('show-toast', handleShowToast);

    return () => {
      appEvents.off('show-toast', handleShowToast);
    };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <Toast.Provider swipeDirection="right">
      <ToastContext.Provider value={{ addToast }}>
        {children}
      </ToastContext.Provider>

      {toasts.map(({ id, title, description, type }) => (
        <Toast.Root
          key={id}
          className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg backdrop-blur-sm text-white ${typeClasses[type]} radix-state-open:animate-slide-in radix-state-closed:animate-hide radix-swipe-end:animate-swipe-out hover:scale-[1.02]`}
          onOpenChange={() => removeToast(id)}
          duration={5000}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <Toast.Title className="font-bold text-sm leading-tight block">{title}</Toast.Title>
              {description && <Toast.Description className="text-xs opacity-90 mt-1 leading-tight block">{description}</Toast.Description>}
            </div>
            <button
              onClick={() => removeToast(id)}
              className="ml-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-0 right-0 p-4 flex flex-col gap-2 w-auto max-w-[80vw] z-[2147483647]" />
    </Toast.Provider>
  );
};

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerHTML = `
  @keyframes hide {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slide-in {
    from {
      transform: translateX(calc(100% + 1rem));
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes swipe-out {
    from {
      transform: translateX(var(--radix-toast-swipe-end-x));
    }
    to {
      transform: translateX(calc(100% + 1rem));
    }
  }
`;
document.head.appendChild(styleSheet); 