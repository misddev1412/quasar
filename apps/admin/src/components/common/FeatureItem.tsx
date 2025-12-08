import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
  isDarkMode?: boolean;
  enhancedText?: boolean; // 添加增强文本对比度选项
}

export const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text, className = '', isDarkMode, enhancedText = false }) => {
  // 如果没有提供isDarkMode，则从ThemeContext中获取
  const themeContext = useTheme();
  const darkMode = isDarkMode !== undefined ? isDarkMode : themeContext.isDarkMode;
  
  // 根据主题和enhancedText选项决定文本样式
  const getTextStyles = () => {
    if (darkMode) {
      return enhancedText 
        ? "text-white font-medium drop-shadow-lg text-shadow-enhanced" 
        : "text-white/90 font-medium";
    }
    // 浅色模式下使用深色文本，不使用白色
    return enhancedText 
      ? "text-slate-800 font-semibold" 
      : "text-primary-900 font-medium";
  };
  
  // 根据主题获取图标背景样式
  const getIconBgStyles = () => {
    if (darkMode) {
      return 'bg-white/10 border-white/10';
    }
    // 浅色模式下使用更深的背景色和边框
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