import React, { useState } from 'react';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { MailIcon } from '../common/Icons';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';

interface FirebaseEmailLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (email: string) => Promise<void>;
  isLoading: boolean;
}

export const FirebaseEmailLoginModal: React.FC<FirebaseEmailLoginModalProps> = ({
  isOpen,
  onClose,
  onSendEmail,
  isLoading
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    
    try {
      await onSendEmail(email);
      addToast({
        type: 'success',
        title: 'Email Sent',
        description: 'Check your email for the login link'
      });
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to Send Email',
        description: error.message || 'Unable to send login email'
      });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError && e.target.value.trim()) {
      setEmailError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-6 py-8 shadow-xl transition-all sm:w-full sm:max-w-md">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <MailIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white">
              Firebase Email Login
            </h3>
            <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              Enter your email address to receive a login link
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="firebase-email"
              type="email"
              label="Email Address"
              placeholder="your.email@example.com"
              value={email}
              onChange={handleEmailChange}
              icon={<MailIcon className="h-5 w-5" />}
              required
              autoComplete="email"
              autoFocus
              error={emailError}
            />

            {/* Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                fullWidth
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                fullWidth
              >
                Send Login Link
              </Button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
            A secure login link will be sent to your email address
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseEmailLoginModal;