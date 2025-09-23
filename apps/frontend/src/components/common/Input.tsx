import { Input as HeroUIInput, InputProps as HeroUIInputProps } from '@heroui/react';
import { forwardRef } from 'react';

interface InputProps extends HeroUIInputProps {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <HeroUIInput
          ref={ref}
          className={className}
          startContent={icon}
          isInvalid={!!error}
          errorMessage={error}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;