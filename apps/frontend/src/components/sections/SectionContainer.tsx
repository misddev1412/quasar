import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  paddingClassName?: string;
  disablePadding?: boolean;
}

const DEFAULT_PADDING = 'px-4 sm:px-6 lg:px-8';

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  fullWidth = false,
  className = '',
  paddingClassName,
  disablePadding = false,
}) => {
  const classes = [
    'w-full',
    fullWidth ? '' : 'max-w-7xl mx-auto',
    disablePadding ? '' : (paddingClassName || DEFAULT_PADDING),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};

export default SectionContainer;
