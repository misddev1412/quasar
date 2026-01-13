import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
  isDarkMode?: boolean;
  enhancedText?: boolean;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text, className = '', isDarkMode, enhancedText = false }) => {
  const themeContext = useTheme();
  const darkMode = isDarkMode !== undefined ? isDarkMode : themeContext.isDarkMode;
  
  const getTextStyles = () => {
    if (darkMode) {
      return enhancedText 
        ? "text-white font-medium drop-shadow-lg text-shadow-enhanced" 
        : "text-white/90 font-medium";
    }
    return enhancedText 
      ? "text-slate-800 font-semibold" 
      : "text-primary-900 font-medium";
  };
  
  const getIconBgStyles = () => {
    if (darkMode) {
      return 'bg-white/10 border-white/10';
    }
    return 'bg-primary-100 border-primary-200';
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`p-2.5 rounded-lg ${getIconBgStyles()} backdrop-blur-sm shadow-lg border`}>
        {icon}
      </div>
      <span className={getTextStyles()}>{text}</span>
    </div>
  );
};

export default FeatureItem; 