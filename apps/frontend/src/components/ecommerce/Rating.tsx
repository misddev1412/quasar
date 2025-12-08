import React from 'react';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  showValue?: boolean;
  precision?: number;
}

const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 'md',
  readonly = true,
  onChange,
  className = '',
  showValue = false,
  precision = 0.5,
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handleClick = (newValue: number) => {
    if (!readonly && onChange) {
      onChange(newValue);
    }
  };

  const handleMouseEnter = (newValue: number) => {
    if (!readonly) {
      // Optional: Add hover effect
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= precision;
    const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span
          key={`full-${i}`}
          className={`text-yellow-400 cursor-pointer ${sizeClasses[size]}`}
          onClick={() => handleClick(i + 1)}
          onMouseEnter={() => handleMouseEnter(i + 1)}
        >
          ★
        </span>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <span
          key="half"
          className={`text-yellow-400 cursor-pointer ${sizeClasses[size]}`}
          onClick={() => handleClick(fullStars + 1)}
          onMouseEnter={() => handleMouseEnter(fullStars + 1)}
        >
          ★½
        </span>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span
          key={`empty-${i}`}
          className={`text-gray-300 cursor-pointer ${sizeClasses[size]}`}
          onClick={() => handleClick(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
          onMouseEnter={() => handleMouseEnter(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
        >
          ☆
        </span>
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">{renderStars()}</div>
      {showValue && (
        <span className={`text-gray-600 ${sizeClasses[size]}`}>
          {value.toFixed(1)}/{max}
        </span>
      )}
    </div>
  );
};

export default Rating;
