import React, { useState, FormEvent } from 'react';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { MailIcon, AlertIcon } from '../common/Icons';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useTheme } from '../../contexts/ThemeContext';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  isSubmitting = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslationWithBackend();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitted(false);
    await onSubmit(email);
    setIsSubmitted(true);
  };

  const loginLink = (
    <a href="/auth/login" className={`text-sm font-medium ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-primary-700 hover:text-primary-800'} transition-colors duration-200`}>
      {t('auth.back_to_login')}
    </a>
  );

  const getButtonClassName = () => {
    return `mt-2 btn-primary ${isDarkMode 
      ? 'bg-gradient-to-r from-primary-500 to-primary-700' 
      : 'bg-gradient-to-r from-primary-700 to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40'}`;
  };

  if (isSubmitted) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary text-center">{t('auth.reset_link_sent')}</h2>
        </div>
        
        <div className="p-6 rounded-lg bg-green-50 border-l-4 border-green-500 text-green-800 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-lg font-medium">{t('auth.check_email')}</p>
              <p className="text-sm mt-2">{t('auth.reset_instructions')}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a href="/auth/login" className={`inline-block px-6 py-2 rounded-md font-medium ${isDarkMode 
            ? 'bg-primary-600 text-white hover:bg-primary-700' 
            : 'bg-primary-700 text-white hover:bg-primary-800'} transition-all duration-300 shadow-md`}
          >
            {t('auth.back_to_login')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-theme-primary text-center">{t('auth.forgot_password')}</h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mt-2 text-center`}>{t('auth.enter_email')}</p>
      </div>
      
      {}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-600 text-red-800 shadow-lg animate-pulse-slow transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-base font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {}
      <form onSubmit={handleSubmit} className="space-y-6">
        {}
        <FormInput 
          id="email"
          type="email"
          label={t('auth.email')}
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<MailIcon className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />}
          rightElement={loginLink}
          required
          autoComplete="email"
          className="form-input"
        />
        
        {}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          fullWidth
          className={getButtonClassName()}
        >
          {t('auth.send_reset_link')}
        </Button>
      </form>
      
      {}
      <div className="mt-8">
        <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          {t('common.need_help')} <a href="#" className={`font-medium ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-primary-700 hover:text-primary-800'} transition-colors duration-200`}>{t('common.contact_admin')}</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm; 