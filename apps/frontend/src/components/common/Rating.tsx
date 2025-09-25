import React from 'react';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  max?: number;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  max = 5,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          className={`${sizeClasses[size]} ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform`}
          disabled={readOnly}
        >
          <span
            className={`${
              rating <= value ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

export default Rating;