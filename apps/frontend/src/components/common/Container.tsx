import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  style?: React.CSSProperties;
}

const containerSizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  padding = true,
  style,
}) => {
  return (
    <div
      className={`
        ${containerSizes[size]}
        mx-auto
        ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
};

export default Container;
