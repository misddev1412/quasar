import { useEffect, useRef } from 'react';
import {
  Modal as HeroUIModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  closeButton?: boolean;
  backdrop?: 'transparent' | 'opaque' | 'blur';
}

// Track open modals to ensure scroll is only restored when all modals are closed
let openModalsCount = 0;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';
let originalHtmlOverflow = '';

// Function to forcefully restore scroll
const restoreBodyScroll = () => {
  // Restore original values or clear if not set
  document.body.style.overflow = originalBodyOverflow || '';
  document.body.style.paddingRight = originalBodyPaddingRight || '';
  document.documentElement.style.overflow = originalHtmlOverflow || '';
  
  // Remove any classes that might block scroll
  document.body.classList.remove('overflow-hidden');
  document.documentElement.classList.remove('overflow-hidden');
  
  // Also clear any inline styles that HeroUI might have added
  if (document.body.style.overflow === 'hidden') {
    document.body.style.overflow = '';
  }
  if (document.documentElement.style.overflow === 'hidden') {
    document.documentElement.style.overflow = '';
  }
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
  backdrop = 'opaque',
}) => {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      openModalsCount++;
      wasOpenRef.current = true;
      
      // Store original values when first modal opens
      if (openModalsCount === 1) {
        originalBodyOverflow = document.body.style.overflow || '';
        originalBodyPaddingRight = document.body.style.paddingRight || '';
        originalHtmlOverflow = document.documentElement.style.overflow || '';
      }
    } else if (!isOpen && wasOpenRef.current) {
      openModalsCount--;
      wasOpenRef.current = false;
      
      // Only restore scroll if no modals are open
      if (openModalsCount === 0) {
        // Use requestAnimationFrame to ensure DOM updates are complete
        requestAnimationFrame(() => {
          restoreBodyScroll();
          
          // Also check after a short delay to catch any late HeroUI cleanup
          setTimeout(() => {
            restoreBodyScroll();
          }, 50);
          
          // Final check after animation completes
          setTimeout(() => {
            restoreBodyScroll();
          }, 200);
        });
      }
    }

    return () => {
      if (wasOpenRef.current) {
        openModalsCount--;
        wasOpenRef.current = false;
        
        if (openModalsCount === 0) {
          requestAnimationFrame(() => {
            restoreBodyScroll();
            
            setTimeout(() => {
              restoreBodyScroll();
            }, 50);
            
            setTimeout(() => {
              restoreBodyScroll();
            }, 200);
          });
        }
      }
    };
  }, [isOpen]);

  // Watch for HeroUI trying to re-lock scroll after we restore it
  useEffect(() => {
    if (!isOpen && openModalsCount === 0) {
      const checkInterval = setInterval(() => {
        if (document.body.style.overflow === 'hidden' || 
            document.documentElement.style.overflow === 'hidden') {
          restoreBodyScroll();
        }
      }, 100);

      // Stop checking after 1 second
      const stopTimeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 1000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(stopTimeout);
        restoreBodyScroll();
      };
    }
  }, [isOpen]);

  return (
    <HeroUIModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      backdrop={backdrop}
      hideCloseButton={!closeButton}
      shouldBlockScroll={true}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {title && <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>}
            <ModalBody>{children}</ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </HeroUIModal>
  );
};

export default Modal;
