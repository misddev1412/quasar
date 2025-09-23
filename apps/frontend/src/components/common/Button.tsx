import { Button as HeroUIButton, ButtonProps as HeroUIButtonProps } from '@heroui/react';
import { forwardRef } from 'react';

interface ButtonProps extends HeroUIButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, icon, fullWidth, className, ...props }, ref) => {
    return (
      <HeroUIButton
        ref={ref}
        className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Loading...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {icon && icon}
            {children}
          </span>
        )}
      </HeroUIButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;