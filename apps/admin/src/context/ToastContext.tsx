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
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg text-white ${typeClasses[type]} radix-state-open:animate-slide-in radix-state-closed:animate-hide radix-swipe-end:animate-swipe-out`}
          onOpenChange={() => removeToast(id)}
          duration={5000}
        >
          <Toast.Title className="font-bold">{title}</Toast.Title>
          {description && <Toast.Description>{description}</Toast.Description>}
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-0 right-0 p-4 flex flex-col gap-2 w-80 max-w-full z-[2147483647]" />
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