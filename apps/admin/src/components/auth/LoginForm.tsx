import React from 'react';
import { Link } from 'react-router-dom';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { MailIcon, LockIcon, AlertIcon } from '../common/Icons';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useStyleUtils } from '../../utils/styleUtils';

// 仅表示UI所需的props
interface LoginFormUIProps {
  email: string;
  password: string;
  rememberMe: boolean;
  passwordError?: string;
  isSubmitting: boolean;
  error?: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRememberMeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

// 纯UI组件，不包含业务逻辑
export const LoginFormUI: React.FC<LoginFormUIProps> = ({
  email,
  password,
  rememberMe,
  passwordError,
  isSubmitting,
  error,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit
}) => {
  const { t } = useTranslationWithBackend();
  const { getTextColorClass, getButtonClass } = useStyleUtils();

  // 获取忘记密码链接
  const forgotPasswordLink = (
    <Link 
      to="/auth/forgot-password" 
      className={`text-sm font-medium ${getTextColorClass('text-slate-400 hover:text-slate-300', 'text-primary-700 hover:text-primary-800')} transition-colors duration-200`}
    >
      {t('common.forgot_password')}
    </Link>
  );

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-theme-primary text-center">{t('auth.admin_login')}</h2>
        <p className={`${getTextColorClass('text-gray-400', 'text-gray-700')} mt-2 text-center`}>
          {t('auth.enter_credentials')}
        </p>
      </div>
      
      {/* 错误信息 */}
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
      
      {/* 登录表单 */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* 邮箱输入 */}
        <FormInput 
          id="email"
          type="email"
          label={t('auth.email')}
          placeholder="your.email@example.com"
          value={email}
          onChange={onEmailChange}
          icon={<MailIcon className="h-5 w-5" />}
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
          onChange={onPasswordChange}
          icon={<LockIcon className="h-5 w-5" />}
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
            onChange={onRememberMeChange}
            className={`h-4 w-4 rounded border-slate-300 focus:ring-primary-500`}
          />
          <label 
            htmlFor="remember_me" 
            className={`ml-2 block text-sm ${getTextColorClass()}`}
          >
            {t('auth.remember_me')}
          </label>
        </div>
        
        {/* 登录按钮 */}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          fullWidth
          className={`mt-2 btn-primary ${getButtonClass('primary')}`}
        >
          {t('auth.login')}
        </Button>
      </form>
      
      {/* 支持链接 */}
      <div className="mt-8">
        <p className={`text-center text-sm ${getTextColorClass()}`}>
          {t('common.need_help')} <a href="#" className={`font-medium ${getTextColorClass('text-slate-400 hover:text-slate-300', 'text-primary-700 hover:text-primary-800')} transition-colors duration-200`}>{t('common.contact_admin')}</a>
        </p>
      </div>
    </div>
  );
};

// 业务逻辑组件props
interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

// 业务逻辑组件，连接UI和数据
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isSubmitting = false,
  error
}) => {
  const { t } = useTranslationWithBackend();
  
  // 使用表单状态管理
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 密码验证
    if (password.length < 6) {
      setPasswordError(t('auth.password_min_length') || '密码长度必须至少为6个字符');
      return;
    }
    
    setPasswordError('');
    await onSubmit(email, password);
  };

  // 处理密码变更，自动清除错误
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (e.target.value.length >= 6) {
      setPasswordError('');
    }
  };

  // 渲染UI组件
  return (
    <LoginFormUI
      email={email}
      password={password}
      rememberMe={rememberMe}
      passwordError={passwordError}
      isSubmitting={isSubmitting}
      error={error}
      onEmailChange={(e) => setEmail(e.target.value)}
      onPasswordChange={handlePasswordChange}
      onRememberMeChange={(e) => setRememberMe(e.target.checked)}
      onSubmit={handleSubmit}
    />
  );
};

export default LoginForm; 