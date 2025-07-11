import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Spinner = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  children,
  fullWidth = false,
  startIcon,
  endIcon,
}) => {
  const { isDarkMode, currentMode } = useTheme();

  // 检查是否在登录页面
  const isLoginPage = typeof document !== 'undefined' && 
    document.body.classList.contains('login-page');

  // 根据变体获取类名
  const getVariantClasses = () => {
    // 为登录页面主按钮使用CSS变量
    if (variant === 'primary' && isLoginPage) {
      return isDarkMode
        ? 'themed-button shadow-md hover:shadow-lg bg-gradient-to-r from-primary-500 to-primary-700'
        : 'themed-button shadow-md hover:shadow-lg bg-gradient-to-r from-primary-700 to-primary-900 font-semibold';
    }

    // 标准变体类
    const classes = {
      primary: `themed-button bg-gradient-to-r ${
        isDarkMode 
          ? 'from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800' 
          : 'from-primary-700 to-primary-900 hover:from-primary-800 hover:to-primary-950'
      } text-white font-semibold shadow-md hover:shadow-lg`,
      secondary: isDarkMode 
        ? 'bg-theme-surface text-theme-primary border border-theme-border hover:bg-opacity-80'
        : 'bg-slate-200 text-slate-800 border border-slate-300 hover:bg-slate-300 font-medium',
      outline: isDarkMode
        ? 'bg-transparent border border-theme-border text-theme-primary hover:bg-theme-surface'
        : 'bg-transparent border-2 border-primary-700 text-primary-800 hover:bg-primary-50 font-medium',
      ghost: isDarkMode
        ? 'bg-transparent hover:bg-theme-surface text-theme-primary'
        : 'bg-transparent hover:bg-slate-100 text-slate-800 font-medium',
      danger: 'bg-error-600 hover:bg-error-700 text-white font-semibold shadow-md',
    };
    
    return classes[variant];
  };

  // 尺寸类
  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4',
    lg: 'py-4 px-6 text-lg',
  };

  // 为登录页面添加自定义按钮动画效果
  const getAnimationClass = () => {
    return isLoginPage && variant === 'primary' && !disabled && !isLoading
      ? 'hover:scale-[1.02] hover:-translate-y-0.5 transform transition-all duration-200'
      : 'hover:scale-[1.01] transition-all duration-200';
  };

  // 按钮圆角
  const borderRadiusClass = 'rounded-[var(--border-radius)]';

  // 更好的按钮阴影
  const getShadowClass = () => {
    if (disabled || isLoading) return '';
    
    if (variant === 'primary' || variant === 'danger') {
      return isDarkMode 
        ? 'shadow-md hover:shadow-lg' 
        : 'shadow-md hover:shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40';
    }
    
    return '';
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`flex justify-center items-center ${borderRadiusClass} transition-all duration-200 ${
        fullWidth ? 'w-full' : ''
      } ${getVariantClasses()} ${sizeClasses[size]} ${getShadowClass()} ${
        disabled || isLoading ? 'opacity-70 cursor-not-allowed' : getAnimationClass()
      } ${className}`}
    >
      {isLoading && <Spinner className="animate-spin -ml-1 mr-2 h-5 w-5" />}
      {!isLoading && startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {!isLoading && endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};

export default Button; 