import React, { useEffect } from 'react';
import { FeatureItem } from '../common/FeatureItem';
import { ShieldIcon, BoltIcon, ChartIcon } from '../common/Icons';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useTheme } from '../../context/ThemeContext';
import LocaleSwitcher from '../LocaleSwitcher';

interface AuthCardProps {
  title?: string;
  children: React.ReactNode;
}

// 主题切换按钮组件
const ThemeToggleButton: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-primary-100/80 hover:bg-primary-100/90'} backdrop-blur-sm transition-all duration-300 flex items-center justify-center shadow-lg`}
      aria-label={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
    >
      {isDarkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-200" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-800" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  children
}) => {
  const { t } = useTranslationWithBackend();
  const { isDarkMode, currentMode } = useTheme();
  const currentYear = new Date().getFullYear();

  // 为登录页面应用特定样式
  useEffect(() => {
    // 应用登录页特定背景
    document.body.classList.add('auth-page');
    
    if (isDarkMode) {
      document.body.classList.add('login-dark-mode');
      document.body.classList.remove('login-light-mode');
      // 设置登录页面的主题颜色
      document.documentElement.style.setProperty('--login-primary-color', '#60a5fa');
      document.documentElement.style.setProperty('--login-secondary-color', '#38bdf8');
      document.documentElement.style.setProperty('--login-text-color', '#f9fafb');
    } else {
      document.body.classList.add('login-light-mode');
      document.body.classList.remove('login-dark-mode');
      // 设置登录页面的主题颜色 - 浅色模式下使用更深的颜色提高对比度
      document.documentElement.style.setProperty('--login-primary-color', '#2563eb');
      document.documentElement.style.setProperty('--login-secondary-color', '#0284c7');
      document.documentElement.style.setProperty('--login-text-color', '#0f172a');
    }
    
    // 清理函数，恢复原始body类
    return () => {
      document.body.classList.remove('auth-page', 'login-light-mode', 'login-dark-mode');
      document.documentElement.style.removeProperty('--login-primary-color');
      document.documentElement.style.removeProperty('--login-secondary-color');
      document.documentElement.style.removeProperty('--login-text-color');
    };
  }, [isDarkMode]);

  // 基于主题的背景样式
  const getBgStyles = () => {
    if (isDarkMode) {
      return "bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950";
    }
    // 增强浅色模式下的背景对比度
    return "bg-gradient-to-br from-blue-100 via-white to-indigo-100";
  };

  // 左侧面板背景样式
  const getLeftPanelBgStyles = () => {
    if (isDarkMode) {
      return "bg-gradient-to-br from-primary-700 to-primary-900";
    }
    // 使用浅色背景用于浅色模式，以便文字可以使用深色
    return "bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200";
  };

  // 获取标题文本颜色
  const getTitleTextColor = () => {
    return isDarkMode ? "text-white" : "text-primary-900";
  };

  // 获取图标颜色
  const getIconColor = () => {
    return isDarkMode ? "text-white" : "text-primary-700";
  };

  return (
    <div className={`min-h-screen w-full ${getBgStyles()} flex flex-col items-center justify-center p-4 transition-colors duration-500`}>
      {/* 身份验证容器 */}
      <div className="w-full max-w-5xl overflow-hidden bg-theme-surface rounded-2xl shadow-2xl flex flex-col md:flex-row transition-all duration-500">
        
        {/* 品牌面板 - 左侧 */}
        <div className={`w-full md:w-5/12 ${getLeftPanelBgStyles()} p-8 md:p-12 flex flex-col justify-between relative transition-colors duration-500`}>
          {/* 抽象背景元素 */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -left-40 -top-40 w-80 h-80 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-blue-300 blur-3xl"></div>
          </div>
          
          {/* Logo和标题 */}
          <div className="relative z-10">
            <div className="mb-6 flex items-center justify-between">
              <div className={`h-12 w-12 ${isDarkMode ? 'bg-white/30' : 'bg-primary-100'} backdrop-blur-sm rounded-xl flex items-center justify-center ${isDarkMode ? 'border border-white/20' : 'border border-primary-200'} shadow-lg`}>
                <span className={`${isDarkMode ? 'text-white' : 'text-primary-800'} text-2xl font-bold ${isDarkMode ? 'text-shadow-enhanced' : ''}`}>Q</span>
              </div>
              
              {/* 主题切换和语言切换 */}
              <div className="flex items-center space-x-3">
                <ThemeToggleButton />
                <LocaleSwitcher 
                  className="bg-transparent"
                  selectClassName={`backdrop-blur-sm ${isDarkMode ? 'border-white/20 bg-white/10 text-white hover:bg-white/20' : 'border-primary-200 bg-primary-50/80 text-primary-900 hover:bg-primary-50'} focus:ring-primary-400 focus:border-primary-400 shadow-lg`} 
                />
              </div>
            </div>
            <h1 className={`text-4xl lg:text-5xl font-bold ${getTitleTextColor()} mb-4 ${isDarkMode ? 'drop-shadow-xl text-shadow-enhanced' : ''}`}>{title || t('auth.admin_platform')}</h1>
            <p className={`${getTitleTextColor()} text-lg mb-8 ${isDarkMode ? 'drop-shadow-xl text-shadow-enhanced' : ''}`}>{t('auth.enter_credentials')}</p>
          </div>
          
          {/* 功能列表，增强对比度 */}
          <div className="space-y-6 relative z-10">
            <FeatureItem 
              icon={<ShieldIcon className={`h-6 w-6 ${getIconColor()}`} />} 
              text={t('features.enterprise_security')} 
              className="hover:translate-x-1 transition-transform duration-300 feature-item-enhanced"
              isDarkMode={isDarkMode}
              enhancedText={true}
            />
            <FeatureItem 
              icon={<BoltIcon className={`h-6 w-6 ${getIconColor()}`} />} 
              text={t('features.efficient_management')} 
              className="hover:translate-x-1 transition-transform duration-300 feature-item-enhanced"
              isDarkMode={isDarkMode}
              enhancedText={true}
            />
            <FeatureItem 
              icon={<ChartIcon className={`h-6 w-6 ${getIconColor()}`} />} 
              text={t('features.data_analysis')} 
              className="hover:translate-x-1 transition-transform duration-300 feature-item-enhanced"
              isDarkMode={isDarkMode}
              enhancedText={true}
            />
          </div>
        </div>
        
        {/* 内容 - 右侧 */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-theme-surface text-theme-primary transition-colors duration-500">
          <div className="max-w-md mx-auto w-full">
            {children}
          </div>
          
          {/* 页脚 */}
          <footer className="mt-10 text-center text-xs text-theme-muted">
            {t('common.copyright', { year: currentYear })}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthCard; 