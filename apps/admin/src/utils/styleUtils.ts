import { useTheme } from '../context/ThemeContext';

/**
 * 为深色/浅色模式获取文本颜色类
 * @param isDarkMode - 是否为深色模式
 * @param darkClass - 深色模式下使用的类名
 * @param lightClass - 浅色模式下使用的类名
 */
export const getTextColorClass = (
  isDarkMode: boolean, 
  darkClass = 'text-gray-300', 
  lightClass = 'text-gray-700'
): string => {
  return isDarkMode ? darkClass : lightClass;
};

/**
 * 为深色/浅色模式获取背景颜色类
 * @param isDarkMode - 是否为深色模式
 * @param darkClass - 深色模式下使用的类名
 * @param lightClass - 浅色模式下使用的类名
 */
export const getBackgroundColorClass = (
  isDarkMode: boolean, 
  darkClass = 'bg-gray-800', 
  lightClass = 'bg-white'
): string => {
  return isDarkMode ? darkClass : lightClass;
};

/**
 * 为深色/浅色模式获取边框颜色类
 * @param isDarkMode - 是否为深色模式
 * @param darkClass - 深色模式下使用的类名
 * @param lightClass - 浅色模式下使用的类名
 */
export const getBorderColorClass = (
  isDarkMode: boolean, 
  darkClass = 'border-gray-700', 
  lightClass = 'border-gray-200'
): string => {
  return isDarkMode ? darkClass : lightClass;
};

/**
 * 为主要和次要按钮获取按钮样式类
 * @param isDarkMode - 是否为深色模式
 * @param variant - 按钮变体（primary 或 secondary）
 */
export const getButtonClass = (
  isDarkMode: boolean, 
  variant: 'primary' | 'secondary' = 'primary'
): string => {
  if (variant === 'primary') {
    return isDarkMode
      ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white'
      : 'bg-gradient-to-r from-primary-700 to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 text-white';
  } else {
    return isDarkMode
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-800';
  }
};

/**
 * 获取页面主要容器的样式类
 * @param isDarkMode - 是否为深色模式
 */
export const getContainerClass = (isDarkMode: boolean): string => {
  return `${getBackgroundColorClass(isDarkMode)} ${getBorderColorClass(isDarkMode)} rounded-lg shadow-lg p-6`;
};

/**
 * 获取表单输入框的样式类
 * @param isDarkMode - 是否为深色模式
 * @param hasError - 是否有错误
 */
export const getFormInputClass = (isDarkMode: boolean, hasError = false): string => {
  const baseClasses = 'block w-full rounded-md px-4 py-3 border focus:ring-2 focus:ring-offset-2';
  const errorClasses = hasError 
    ? isDarkMode ? 'border-red-500 focus:ring-red-500' : 'border-red-500 focus:ring-red-500' 
    : '';
  
  const themeClasses = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-primary-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-primary-500';
    
  return `${baseClasses} ${themeClasses} ${errorClasses}`;
};

/**
 * 获取错误消息样式类
 * @param isDarkMode - 是否为深色模式
 */
export const getErrorMessageClass = (isDarkMode: boolean): string => {
  return isDarkMode 
    ? 'text-red-400 text-sm mt-1'
    : 'text-red-600 text-sm mt-1';
};

/**
 * 样式工具Hook，提供基于当前主题的样式类
 */
export const useStyleUtils = () => {
  const { isDarkMode } = useTheme();
  
  return {
    isDarkMode,
    getTextColorClass: (dark = 'text-gray-300', light = 'text-gray-700') => getTextColorClass(isDarkMode, dark, light),
    getBackgroundColorClass: (dark = 'bg-gray-800', light = 'bg-white') => getBackgroundColorClass(isDarkMode, dark, light),
    getBorderColorClass: (dark = 'border-gray-700', light = 'border-gray-200') => getBorderColorClass(isDarkMode, dark, light),
    getButtonClass: (variant: 'primary' | 'secondary' = 'primary') => getButtonClass(isDarkMode, variant),
    getContainerClass: () => getContainerClass(isDarkMode),
    getFormInputClass: (hasError = false) => getFormInputClass(isDarkMode, hasError),
    getErrorMessageClass: () => getErrorMessageClass(isDarkMode),
  };
}; 