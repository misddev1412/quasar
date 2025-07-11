import { useEffect } from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AuthCard from '../../components/auth/AuthCard';
import LoginForm from '../../components/auth/LoginForm';
import { useLoginForm } from '../../hooks/useLoginForm';

export function LoginPage() {
  const auth = useAuth();
  const { isDarkMode, theme } = useTheme();
  const { t } = useTranslationWithBackend();
  const { error, isSubmitting, handleLogin } = useLoginForm({ auth });
  
  // 应用登录页特定样式
  useEffect(() => {
    const bodyEl = document.body;
    bodyEl.classList.add('login-page');
    
    // 根据主题模式应用不同的CSS变量
    if (!isDarkMode) {
      bodyEl.classList.add('login-light-mode');
      // 使用更友好的浅色模式颜色
      document.documentElement.style.setProperty('--login-primary-color', '#4f46e5'); // 靛蓝色
      document.documentElement.style.setProperty('--login-secondary-color', '#6366f1'); // 浅靛蓝色
      document.documentElement.style.setProperty('--login-text-color', '#1e293b'); // 深蓝灰色
      
      // 如果主题配置存在，使用配置中的颜色
      if (theme?.colors?.primary) {
        document.documentElement.style.setProperty('--login-primary-color', theme.colors.primary);
      }
      if (theme?.colors?.secondary) {
        document.documentElement.style.setProperty('--login-secondary-color', theme.colors.secondary);
      }
      if (theme?.modes?.light?.text?.primary) {
        document.documentElement.style.setProperty('--login-text-color', theme.modes.light.text.primary);
      }
    } else {
      bodyEl.classList.add('login-dark-mode');
      // 使用更友好的深色模式颜色
      document.documentElement.style.setProperty('--login-primary-color', '#818cf8'); // 中等亮度的靛蓝色
      document.documentElement.style.setProperty('--login-secondary-color', '#60a5fa'); // 亮蓝色
      document.documentElement.style.setProperty('--login-text-color', '#f1f5f9'); // 略柔和的白色
      
      // 如果主题配置存在，使用配置中的颜色
      if (theme?.colors?.primary) {
        document.documentElement.style.setProperty('--login-primary-color', theme.colors.primary);
      }
      if (theme?.colors?.secondary) {
        document.documentElement.style.setProperty('--login-secondary-color', theme.colors.secondary);
      }
      if (theme?.modes?.dark?.text?.primary) {
        document.documentElement.style.setProperty('--login-text-color', theme.modes.dark.text.primary);
      }
    }
    
    // 为登录页添加特定背景色
    if (!isDarkMode) {
      document.documentElement.style.setProperty('--login-bg-color', '#f0f9ff'); // 浅蓝色背景，更舒适
      document.documentElement.style.setProperty('--login-card-bg', '#ffffff'); // 白色
      document.documentElement.style.setProperty('--login-border-color', '#e0e7ff'); // 浅靛蓝色边框
    } else {
      document.documentElement.style.setProperty('--login-bg-color', '#0f172a'); // 深蓝色背景
      document.documentElement.style.setProperty('--login-card-bg', '#1e293b'); // 深蓝灰色卡片
      document.documentElement.style.setProperty('--login-border-color', '#3730a3'); // 深靛蓝色边框，增加视觉区分度
    }
    
    // 应用背景色到body
    document.body.style.backgroundColor = 'var(--login-bg-color)';
    
    // 清理函数，移除添加的类和样式
    return () => {
      bodyEl.classList.remove('login-page', 'login-light-mode', 'login-dark-mode');
      document.documentElement.style.removeProperty('--login-primary-color');
      document.documentElement.style.removeProperty('--login-secondary-color');
      document.documentElement.style.removeProperty('--login-text-color');
      document.documentElement.style.removeProperty('--login-bg-color');
      document.documentElement.style.removeProperty('--login-card-bg');
      document.documentElement.style.removeProperty('--login-border-color');
      document.body.style.backgroundColor = '';
    };
  }, [isDarkMode, theme]);

  return (
    <AuthCard title={t('auth.admin_platform')}>
      <LoginForm
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        error={error}
      />
    </AuthCard>
  );
}

export default LoginPage; 