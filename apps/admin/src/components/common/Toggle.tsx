import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  disabled = false, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-4',
      dot: 'w-3 h-3 translate-x-4'
    },
    md: {
      container: 'w-11 h-6',
      dot: 'w-4 h-4 translate-x-5'
    }
  };
  
  return (
    <div className="relative inline-block">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div 
        className={`block ${checked ? 'bg-blue-600' : 'bg-gray-300'} ${sizeClasses[size].container} rounded-full transition-colors duration-300 cursor-pointer ${disabled ? 'opacity-50' : ''}`}
        onClick={!disabled ? onChange : undefined}
      ></div>
      <div 
        className={`dot absolute left-1 top-1 ${checked ? sizeClasses[size].dot : 'translate-x-0'} bg-white rounded-full transition-transform duration-300`}
      ></div>
    </div>
  );
}; 