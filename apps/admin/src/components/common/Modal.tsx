import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent } from './Dialog';
import { useModalContext } from '../../contexts/ModalContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  modalId?: string;
  preventCloseWhenChildActive?: boolean;
  hideCloseButton?: boolean;
  closeButtonClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  modalId: providedModalId,
  preventCloseWhenChildActive = true,
  hideCloseButton = false,
  closeButtonClassName,
}) => {
  const { pushModal, popModal, modalStack } = useModalContext();
  const wasOpenRef = useRef(false);

  // Generate a unique modal ID if not provided
  const modalId = React.useMemo(() => {
    if (providedModalId) return providedModalId;

    const stack = new Error().stack || '';
    const callerLine = stack.split('\n')[3] || '';
    const match = callerLine.match(/at\s+(.+?)(?:\s+\([^)]+\))?$/);
    const caller = match ? match[1] : 'unknown';
    return `modal-${caller.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
  }, [providedModalId]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    fullscreen: 'w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none border-none translate-x-0 translate-y-0 left-0 top-0',
  };

  // Manage modal stack
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      pushModal(modalId);
      wasOpenRef.current = true;
    } else if (!isOpen && wasOpenRef.current) {
      popModal(modalId);
      wasOpenRef.current = false;
    }

    return () => {
      if (wasOpenRef.current) {
        popModal(modalId);
      }
    };
  }, [isOpen, modalId, pushModal, popModal]);

  // Custom close handler that respects modal hierarchy
  const handleClose = () => {
    if (preventCloseWhenChildActive) {
      // Find if there are any modals above this one in the stack
      const currentIndex = modalStack.indexOf(modalId);
      const hasChildModals = currentIndex !== -1 && currentIndex < modalStack.length - 1;

      if (hasChildModals) {
        // Don't close this modal if there are child modals active
        return;
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`${sizeClasses[size]} ${size === 'fullscreen' ? '' : 'max-h-[90vh] overflow-y-auto'}`}
        style={{
          zIndex: 9999 + modalStack.indexOf(modalId),
        }}
        hideCloseButton={hideCloseButton}
        closeButtonClassName={closeButtonClassName}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};
