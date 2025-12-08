import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { config } = useLayout();
  const { isDarkMode } = useTheme();
  const { sidebarCollapsed, type } = config;
  const { t } = useTranslation();
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`
      px-6 py-4 border-t transition-all duration-300
      ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'} 
      text-xs
    `}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <p>
          &copy; {currentYear} Quasar Admin. {t('footer.allRightsReserved')}
        </p>
        
        <div className="flex space-x-6">
          <a 
            href="#" 
            className={`hover:text-blue-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {t('footer.terms')}
          </a>
          <a 
            href="#" 
            className={`hover:text-blue-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {t('footer.privacy')}
          </a>
          <a 
            href="#" 
            className={`hover:text-blue-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {t('footer.help')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 