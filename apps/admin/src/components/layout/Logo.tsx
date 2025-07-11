import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

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

  return (
    <div 
      onClick={onClick}
      className={`flex items-center transition-all duration-300 ease-in-out ${collapsed ? 'justify-center p-4' : 'p-4 pl-6'}`}
    >
      <div 
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl hover:shadow-blue-500/40"
      >
        <span className="font-bold text-white text-base">
          Q
        </span>
      </div>
      
      {!collapsed && (
        <div className="overflow-hidden w-[120px] ml-4">
          <div className="font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis text-base">
            {t('common.brand_name', 'Quasar')}
          </div>
          <div className="text-xs text-gray-500 leading-none whitespace-nowrap overflow-hidden text-ellipsis block">
            {t('common.admin_dashboard', 'Admin Dashboard')}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo; 