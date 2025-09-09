import React from 'react';
import { Link } from 'react-router-dom';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { MailIcon, LockIcon } from '../common/Icons';
import { AlertBox } from '../common/AlertBox';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useStyleUtils } from '../../utils/styleUtils';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useToast } from '../../context/ToastContext';
import { firebaseService } from '../../services/firebase.service';
import FirebaseEmailLoginModal from './FirebaseEmailLoginModal';

// 仅表示UI所需的props
interface LoginFormUIProps {
  email: string;
  password: string;
  rememberMe: boolean;
  isSubmitting: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRememberMeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFirebaseEmailLogin?: () => Promise<void>;
  onGoogleLogin?: () => Promise<void>;
  onFacebookLogin?: () => Promise<void>;
  onTwitterLogin?: () => Promise<void>;
  onGithubLogin?: () => Promise<void>;
  firebaseInitialized?: boolean;
  isFirebaseSubmitting?: boolean;
}

// 纯UI组件，不包含业务逻辑
export const LoginFormUI: React.FC<LoginFormUIProps> = ({
  email,
  password,
  rememberMe,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
  onFirebaseEmailLogin,
  onGoogleLogin,
  onFacebookLogin,
  onTwitterLogin,
  onGithubLogin,
  firebaseInitialized = false,
  isFirebaseSubmitting = false
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
        />
        
        {/* 记住我 */}
        <div className="flex items-start space-x-3">
          <div className="relative inline-flex flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-9 h-5 cursor-pointer" 
               style={{ backgroundColor: rememberMe ? '#2563eb' : '#d1d5db' }}>
            <button
              type="button"
              role="switch"
              aria-checked={rememberMe}
              onClick={() => onRememberMeChange({ target: { checked: !rememberMe } } as any)}
              id="remember_me"
              className="w-full h-full rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="sr-only">{t('auth.remember_me')}</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out w-3.5 h-3.5 top-[2px] left-[2px]"
                style={{
                  transform: rememberMe ? 'translate(18px, 0)' : 'translate(2px, 0)'
                }}
              />
            </button>
          </div>
          <label 
            htmlFor="remember_me" 
            className={`text-sm cursor-pointer ${getTextColorClass()}`}
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
      {/* Firebase Authentication Options */}
      {(firebaseInitialized || process.env.NODE_ENV === 'development') && (
        <>
          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 bg-white ${getTextColorClass()}`}>
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Firebase Email Login */}
          {onFirebaseEmailLogin && (
            <Button
              type="button"
              variant="secondary"
              onClick={onFirebaseEmailLogin}
              isLoading={isFirebaseSubmitting}
              fullWidth
              className="mb-3"
            >
              <MailIcon className="h-5 w-5 mr-2" />
              Firebase Email Login
            </Button>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google Login */}
            {onGoogleLogin && (
              <Button
                type="button"
                variant="secondary"
                onClick={onGoogleLogin}
                isLoading={isFirebaseSubmitting}
                fullWidth
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            )}

            {/* Facebook Login */}
            {onFacebookLogin && (
              <Button
                type="button"
                variant="secondary"
                onClick={onFacebookLogin}
                isLoading={isFirebaseSubmitting}
                fullWidth
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Sign in with Facebook
              </Button>
            )}

            {/* Twitter Login */}
            {onTwitterLogin && (
              <Button
                type="button"
                variant="secondary"
                onClick={onTwitterLogin}
                isLoading={isFirebaseSubmitting}
                fullWidth
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#1DA1F2">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Sign in with X/Twitter
              </Button>
            )}

            {/* GitHub Login */}
            {onGithubLogin && (
              <Button
                type="button"
                variant="secondary"
                onClick={onGithubLogin}
                isLoading={isFirebaseSubmitting}
                fullWidth
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#181717">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Sign in with GitHub
              </Button>
            )}
          </div>
        </>
      )}
      
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
  onSubmit: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

// 业务逻辑组件，连接UI和数据
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isSubmitting = false
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const { 
    signInWithEmail: firebaseSignInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    initialized: firebaseInitialized 
  } = useFirebaseAuth();
  
  // 使用表单状态管理
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isFirebaseSubmitting, setIsFirebaseSubmitting] = React.useState(false);
  const [showFirebaseEmailModal, setShowFirebaseEmailModal] = React.useState(false);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 密码验证
    if (password.length < 6) {
      addToast({
        type: 'error',
        title: t('auth.login_failed'),
        description: t('auth.password_min_length') || '密码长度必须至少为6个字符'
      });
      return;
    }
    await onSubmit(email, password, rememberMe);
  };

  // 处理密码变更
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // 处理Firebase邮箱登录 - 打开模态框
  const handleFirebaseEmailLogin = async () => {
    setShowFirebaseEmailModal(true);
  };

  // 处理Firebase邮箱登录发送
  const handleSendFirebaseEmail = async (emailAddress: string) => {
    setIsFirebaseSubmitting(true);
    try {
      // Send email link directly using the Firebase service method
      await firebaseService.sendSignInLinkToEmail(emailAddress);
    } catch (error: any) {
      throw error; // Re-throw so modal can handle it
    } finally {
      setIsFirebaseSubmitting(false);
    }
  };

  // 处理Google登录
  const handleGoogleLogin = async () => {
    if (!firebaseInitialized) {
      addToast({
        type: 'error',
        title: 'Firebase Configuration Error',
        description: 'Firebase is not properly configured. Please contact your administrator.'
      });
      return;
    }
    
    setIsFirebaseSubmitting(true);
    try {
      await signInWithGoogle();
      // Firebase auth context will handle the token exchange
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Google Login Failed',
        description: error.message || 'Google login failed'
      });
    } finally {
      setIsFirebaseSubmitting(false);
    }
  };

  // 处理Facebook登录
  const handleFacebookLogin = async () => {
    if (!firebaseInitialized) {
      addToast({
        type: 'error',
        title: 'Firebase Configuration Error',
        description: 'Firebase is not properly configured. Please contact your administrator.'
      });
      return;
    }
    
    setIsFirebaseSubmitting(true);
    try {
      await signInWithFacebook();
      // Firebase auth context will handle the token exchange
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Facebook Login Failed',
        description: error.message || 'Facebook login failed'
      });
    } finally {
      setIsFirebaseSubmitting(false);
    }
  };

  // 处理Twitter登录
  const handleTwitterLogin = async () => {
    if (!firebaseInitialized) {
      addToast({
        type: 'error',
        title: 'Firebase Configuration Error',
        description: 'Firebase is not properly configured. Please contact your administrator.'
      });
      return;
    }
    
    setIsFirebaseSubmitting(true);
    try {
      await signInWithTwitter();
      // Firebase auth context will handle the token exchange
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Twitter Login Failed',
        description: error.message || 'Twitter login failed'
      });
    } finally {
      setIsFirebaseSubmitting(false);
    }
  };

  // 处理GitHub登录
  const handleGithubLogin = async () => {
    if (!firebaseInitialized) {
      addToast({
        type: 'error',
        title: 'Firebase Configuration Error',
        description: 'Firebase is not properly configured. Please contact your administrator.'
      });
      return;
    }
    
    setIsFirebaseSubmitting(true);
    try {
      await signInWithGithub();
      // Firebase auth context will handle the token exchange
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'GitHub Login Failed',
        description: error.message || 'GitHub login failed'
      });
    } finally {
      setIsFirebaseSubmitting(false);
    }
  };

  // 渲染UI组件
  return (
    <>
      <LoginFormUI
        email={email}
        password={password}
        rememberMe={rememberMe}
        isSubmitting={isSubmitting}
        onEmailChange={(e) => setEmail(e.target.value)}
        onPasswordChange={handlePasswordChange}
        onRememberMeChange={(e) => setRememberMe(e.target.checked)}
        onSubmit={handleSubmit}
        onFirebaseEmailLogin={handleFirebaseEmailLogin}
        onGoogleLogin={handleGoogleLogin}
        onFacebookLogin={handleFacebookLogin}
        onTwitterLogin={handleTwitterLogin}
        onGithubLogin={handleGithubLogin}
        firebaseInitialized={firebaseInitialized}
        isFirebaseSubmitting={isFirebaseSubmitting}
      />
      
      <FirebaseEmailLoginModal
        isOpen={showFirebaseEmailModal}
        onClose={() => setShowFirebaseEmailModal(false)}
        onSendEmail={handleSendFirebaseEmail}
        isLoading={isFirebaseSubmitting}
      />
    </>
  );
};

export default LoginForm; 