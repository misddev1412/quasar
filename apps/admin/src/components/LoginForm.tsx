import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormInput } from '@admin/components/common/FormInput';
import { Button } from '@admin/components/common/Button';
import { MailIcon, LockIcon, AlertIcon } from '@admin/components/common/Icons';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { useTheme } from '../context/ThemeContext';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isSubmitting = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useTranslationWithBackend();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 密码验证
    if (password.length < 6) {
      setPasswordError(t('auth.password_min_length') || '密码长度必须至少为6个字符');
      return;
    }
    
    setPasswordError('');
    await onSubmit(email, password);
  };

  const forgotPasswordLink = (
    <Link to="/auth/forgot-password" className={`text-sm font-medium ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-primary-700 hover:text-primary-800'} transition-colors duration-200`}>
      {t('common.forgot_password')}
    </Link>
  );

  // 获取按钮样式类名
  const getButtonClassName = () => {
    return `mt-2 btn-primary ${isDarkMode 
      ? 'bg-gradient-to-r from-primary-500 to-primary-700' 
      : 'bg-gradient-to-r from-primary-700 to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40'}`;
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-theme-primary text-center">{t('auth.admin_login')}</h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mt-2 text-center`}>{t('auth.enter_credentials')}</p>
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
              <p className="text-sm mt-1">{t('auth.check_credentials')}</p>
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
          required
          autoComplete="email"
          className="form-input"
        />
        
        {/* 密码输入 */}
        <FormInput 
          id="password"
          type="password"
          label={t('auth.password')}
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (e.target.value.length >= 6) {
              setPasswordError('');
            }
          }}
          icon={<LockIcon className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />}
          rightElement={forgotPasswordLink}
          required
          autoComplete="current-password"
          className="form-input"
          error={passwordError}
        />
        
        {/* 记住我 */}
        <div className="flex items-center">
          <input
            id="remember_me"
            name="remember_me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={`h-4 w-4 rounded border-slate-300 ${isDarkMode ? 'text-primary-500' : 'text-primary-600'} focus:ring-primary-500`}
          />
          <label htmlFor="remember_me" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('auth.remember_me')}
          </label>
        </div>
        
        {/* 登录按钮 */}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          fullWidth
          className={getButtonClassName()}
        >
          {t('auth.login')}
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

export default LoginForm; 