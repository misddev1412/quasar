import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useBrandingSetting } from '../../hooks/useBrandingSetting';
import {
  ADMIN_SIDEBAR_BRANDING_KEY,
  DEFAULT_ADMIN_SIDEBAR_BRANDING,
} from '../../constants/adminBranding';

interface LogoProps {
  collapsed?: boolean;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
  collapsed = false,
  onClick
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslationWithBackend();

  const { config: brandingConfig } = useBrandingSetting(
    ADMIN_SIDEBAR_BRANDING_KEY,
    DEFAULT_ADMIN_SIDEBAR_BRANDING,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const logoUrl = brandingConfig.logoUrl;
  const logoText = brandingConfig.logoText || 'Q';
  const brandName = brandingConfig.brandName || t('common.brand_name', 'Quasar');
  const subtitle = brandingConfig.subtitle || t('common.admin_dashboard', 'Admin Dashboard');
  const logoWidth = brandingConfig.width || 36;
  const logoHeight = brandingConfig.height || 36;

  return (
    <div
      onClick={onClick}
      className={`flex items-center transition-all duration-300 ease-in-out ${collapsed ? 'justify-center p-4' : 'p-4 pl-6'}`}
    >
      {logoUrl && !error ? (
        <div className="flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:translate-y-[-2px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          <img
            src={logoUrl}
            alt="Logo"
            style={{
              width: `${logoWidth}px`,
              height: `${logoHeight}px`,
              objectFit: 'contain',
              opacity: loading ? 0 : 1
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl hover:shadow-blue-500/40"
        >
          <span className="font-bold text-white text-base">
            {logoText}
          </span>
        </div>
      )}

      {!collapsed && (
        <div className="overflow-hidden w-[120px] ml-4">
          <div className="font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis text-base">
            {brandName}
          </div>
          <div className="text-xs text-gray-500 leading-none whitespace-nowrap overflow-hidden text-ellipsis block">
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo; 
