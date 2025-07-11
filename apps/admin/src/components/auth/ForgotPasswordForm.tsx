import React, { useState, FormEvent } from 'react';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { MailIcon, AlertIcon, CheckCircleIcon } from '../common/Icons';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useTheme } from '../../context/ThemeContext';

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

  // 获取按钮样式类名
  const getButtonClassName = () => {
    return `mt-2 btn-primary ${isDarkMode 
      ? 'bg-gradient-to-r from-primary-500 to-primary-700' 
      : 'bg-gradient-to-r from-primary-700 to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40'}`;
  };

  // 显示成功提交信息
  if (isSubmitted) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary text-center">{t('auth.reset_link_sent')}</h2>
        </div>
        
        <div className="p-6 rounded-lg bg-green-50 border-l-4 border-green-500 text-green-800 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
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
      
      {/* 错误信息 - 使用更醒目的样式 */}
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
      
      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 邮箱输入 */}
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
        
        {/* 提交按钮 */}
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
      
      {/* 支持链接 */}
      <div className="mt-8">
        <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          {t('common.need_help')} <a href="#" className={`font-medium ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-primary-700 hover:text-primary-800'} transition-colors duration-200`}>{t('common.contact_admin')}</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm; 