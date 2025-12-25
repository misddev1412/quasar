import React, { useEffect } from 'react';
import { FeatureItem } from '../common/FeatureItem';
import { ShieldIcon, BoltIcon, ChartIcon } from '../common/Icons';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useTheme } from '../../context/ThemeContext';
import LocaleSwitcher from '../LocaleSwitcher';
import { useBrandingSetting } from '../../hooks/useBrandingSetting';
import {
  ADMIN_LOGIN_BRANDING_KEY,
  DEFAULT_ADMIN_LOGIN_BRANDING,
} from '../../constants/adminBranding';

interface AuthCardProps {
  title?: string;
  children: React.ReactNode;
}

const getControlButtonStyle = (isDarkMode: boolean) => {
  return `px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center shadow-lg text-sm font-medium cursor-pointer hover:scale-105 ${isDarkMode
    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30'
    : 'bg-primary-100/80 hover:bg-primary-200/90 text-primary-900 border border-primary-200 hover:border-primary-300'
    }`;
};


const ThemeToggleButton: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslationWithBackend();

  return (
    <button
      onClick={toggleDarkMode}
      className={getControlButtonStyle(isDarkMode)}
      aria-label={isDarkMode ? t('auth.toggle_light_mode') : t('auth.toggle_dark_mode')}
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
  const { isDarkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  const { config: loginBranding } = useBrandingSetting(
    ADMIN_LOGIN_BRANDING_KEY,
    DEFAULT_ADMIN_LOGIN_BRANDING,
    { publicAccess: true },
  );
  const resolvedTitle = title || loginBranding.platformTitle || t('auth.admin_platform');

  useEffect(() => {
    document.body.classList.add('auth-page');

    if (isDarkMode) {
      document.body.classList.add('login-dark-mode');
      document.body.classList.remove('login-light-mode');
      document.documentElement.style.setProperty('--login-primary-color', '#60a5fa');
      document.documentElement.style.setProperty('--login-secondary-color', '#38bdf8');
      document.documentElement.style.setProperty('--login-text-color', '#f9fafb');
    } else {
      document.body.classList.add('login-light-mode');
      document.body.classList.remove('login-dark-mode');
      document.documentElement.style.setProperty('--login-primary-color', '#2563eb');
      document.documentElement.style.setProperty('--login-secondary-color', '#0284c7');
      document.documentElement.style.setProperty('--login-text-color', '#0f172a');
    }

    return () => {
      document.body.classList.remove('auth-page', 'login-light-mode', 'login-dark-mode');
      document.documentElement.style.removeProperty('--login-primary-color');
      document.documentElement.style.removeProperty('--login-secondary-color');
      document.documentElement.style.removeProperty('--login-text-color');
    };
  }, [isDarkMode]);

  const getBgStyles = () => {
    if (isDarkMode) {
      return "bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950";
    }
    return "bg-gradient-to-br from-blue-100 via-white to-indigo-100";
  };

  const getLeftPanelBgStyles = () => {
    if (isDarkMode) {
      return "bg-gradient-to-br from-primary-700 to-primary-900";
    }
    return "bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200";
  };

  const getTitleTextColor = () => {
    return isDarkMode ? "text-white" : "text-primary-900";
  };

  const getIconColor = () => {
    return isDarkMode ? "text-white" : "text-primary-700";
  };

  const backgroundImageStyle: React.CSSProperties | undefined = loginBranding.backgroundImageUrl
    ? {
      backgroundImage: `linear-gradient(135deg, rgba(15,23,42,${isDarkMode ? 0.85 : 0.45}), rgba(15,23,42,${isDarkMode ? 0.75 : 0.35})), url(${loginBranding.backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
    : undefined;

  return (
    <div
      className={`min-h-screen w-full ${getBgStyles()} flex flex-col items-center justify-center p-4 transition-colors duration-500`}
      style={backgroundImageStyle}
    >
      <div className="w-full max-w-5xl overflow-hidden bg-theme-surface rounded-2xl shadow-2xl flex flex-col md:flex-row transition-all duration-500">

        <div className={`w-full md:w-5/12 ${getLeftPanelBgStyles()} p-6 sm:p-8 md:p-12 flex flex-col justify-between relative transition-colors duration-500`}>
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -left-40 -top-40 w-80 h-80 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-blue-300 blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="mb-4 md:mb-6 flex flex-col">
              {/* Logo Section */}
              {loginBranding.logoUrl && (
                <div className="mb-3 md:mb-4 flex justify-start animate-fade-in-down">
                  <img
                    src={loginBranding.logoUrl}
                    alt="Logo"
                    className="drop-shadow-lg hover:scale-105 transition-transform duration-300"
                    style={{
                      width: `${loginBranding.width || 120}px`, // Increased default from 48
                      height: 'auto',
                      objectFit: 'contain',
                      maxHeight: '120px' // Increased max height from 80
                    }}
                  />
                </div>
              )}

            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${getTitleTextColor()} mb-3 md:mb-6 leading-tight tracking-tight ${isDarkMode ? 'drop-shadow-xl text-shadow-enhanced' : ''}`}>{resolvedTitle}</h1>
            <p className={`${getTitleTextColor()} text-base md:text-lg mb-4 md:mb-6 ${isDarkMode ? 'drop-shadow-xl text-shadow-enhanced' : ''}`}>{t('auth.enter_credentials')}</p>

            {/* Main Image - Hidden on mobile, shown on tablet and up */}
            <div className="hidden md:flex justify-center mb-8">
              <img
                src="/assets/images/auth-form-main.png"
                alt="Admin Platform"
                className="w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>

            {/* Features - Compact on mobile */}
            <div className="space-y-2 md:space-y-4 mt-4 md:mt-6">
              <FeatureItem
                icon={<ShieldIcon className={`h-5 w-5 md:h-6 md:w-6 ${getIconColor()}`} />}
                text={t('features.enterprise_security')}
                className="hover:translate-x-1 transition-transform duration-300 feature-item-enhanced"
                isDarkMode={isDarkMode}
                enhancedText={true}
              />
              <FeatureItem
                icon={<BoltIcon className={`h-5 w-5 md:h-6 md:w-6 ${getIconColor()}`} />}
                text={t('features.efficient_management')}
                className="hover:translate-x-1 transition-transform duration-300 feature-item-enhanced"
                isDarkMode={isDarkMode}
                enhancedText={true}
              />
              <FeatureItem
                icon={<ChartIcon className={`h-5 w-5 md:h-6 md:w-6 ${getIconColor()}`} />}
                text={t('features.data_analysis')}
                className="hover:translate-x-1 transition-transform duration-300 feature-item-enhanced"
                isDarkMode={isDarkMode}
                enhancedText={true}
              />
            </div>
          </div>

          <div className="relative z-10"></div>
        </div>

        <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-theme-surface text-theme-primary transition-colors duration-500">
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 w-full mb-4 sm:mb-6">
            <LocaleSwitcher
              className="auth-locale-switcher min-w-[8rem] sm:min-w-[9rem]"
              selectClassName={`${getControlButtonStyle(isDarkMode)} min-h-[36px] sm:min-h-[40px] relative overflow-hidden whitespace-nowrap text-xs sm:text-sm`}
            />
            <ThemeToggleButton />
          </div>
          <div className="max-w-md mx-auto w-full">
            {children}
          </div>

          <footer className="mt-6 sm:mt-10 text-center text-xs text-theme-muted">
            {t('common.copyright', { year: currentYear })}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthCard; 
