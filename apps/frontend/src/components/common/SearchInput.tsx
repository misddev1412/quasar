import { forwardRef } from 'react';
import Input from './Input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onSubmit, placeholder = "Search products...", size = 'md', className = '', fullWidth = false }, ref) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.(e);
    };

    const sizeClasses = {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12'
    };

    return (
      <form onSubmit={handleSubmit} className={`${fullWidth ? 'w-full' : 'max-w-md'} ${className}`}>
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          icon={<SearchIcon />}
          size={size}
          radius="full"
          variant="flat"
          classNames={{
            base: `${sizeClasses[size]} ${fullWidth ? 'w-full' : ''}`,
            mainWrapper: "h-full",
            inputWrapper: [
              "h-full",
              "bg-gray-50 dark:bg-gray-800/50",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-all duration-200",
              "border-2 border-transparent",
              "shadow-none",
              "data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-800",
              "group-data-[focus=true]:bg-white dark:group-data-[focus=true]:bg-gray-900",
              "group-data-[focus=true]:border-blue-500 dark:group-data-[focus=true]:border-blue-400",
              "!cursor-text",
              "outline-none",
              "focus-within:outline-none",
              "focus-within:ring-0"
            ].join(" "),
            input: [
              "text-sm",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "text-gray-900 dark:text-gray-100",
              "focus:outline-none"
            ].join(" ")
          }}
        />
      </form>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;