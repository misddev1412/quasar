import React from 'react';
import { Dialog, DialogContent } from './Dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    fullscreen: 'w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none border-none translate-x-0 translate-y-0 left-0 top-0',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} ${size === 'fullscreen' ? '' : 'max-h-[90vh] overflow-y-auto'}`}>
        {children}
      </DialogContent>
    </Dialog>
  );
};