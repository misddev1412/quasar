import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalContextType {
  modalStack: string[];
  pushModal: (modalId: string) => void;
  popModal: (modalId: string) => void;
  isTopModal: (modalId: string) => boolean;
  hasActiveModals: () => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalStack, setModalStack] = useState<string[]>([]);

  const pushModal = useCallback((modalId: string) => {
    setModalStack(prev => {
      // Only add if not already in stack
      if (!prev.includes(modalId)) {
        return [...prev, modalId];
      }
      return prev;
    });
  }, []);

  const popModal = useCallback((modalId: string) => {
    setModalStack(prev => prev.filter(id => id !== modalId));
  }, []);

  const isTopModal = useCallback((modalId: string) => {
    return modalStack[modalStack.length - 1] === modalId;
  }, [modalStack]);

  const hasActiveModals = useCallback(() => {
    return modalStack.length > 0;
  }, [modalStack]);

  return (
    <ModalContext.Provider value={{
      modalStack,
      pushModal,
      popModal,
      isTopModal,
      hasActiveModals,
    }}>
      {children}
    </ModalContext.Provider>
  );
};