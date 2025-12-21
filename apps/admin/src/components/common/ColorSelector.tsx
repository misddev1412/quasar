import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { InputWithIcon } from './InputWithIcon';
import { BASE_LABEL_CLASS } from './styles';

const TRANSPARENT_COLOR = 'transparent';

interface ColorSelectorProps {
  value?: string;
  onChange: (color: string | undefined) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  value,
  onChange,
  placeholder = '#000000',
  label,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presetColors = [
    TRANSPARENT_COLOR,
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
    '#808080', '#C0C0C0', '#FFD700', '#32CD32', '#87CEEB', '#FF69B4',
    '#4B0082', '#F0E68C', '#DDA0DD', '#B0E0E6', '#FF6347', '#40E0D0',
  ];

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const isTransparent = newValue.toLowerCase() === TRANSPARENT_COLOR;

    if (
      newValue === '' ||
      /^#[0-9A-Fa-f]{6}$/.test(newValue) ||
      isTransparent
    ) {
      onChange(isTransparent ? TRANSPARENT_COLOR : (newValue || undefined));
    }
  };

  const handleColorSelect = (color: string) => {
    setInputValue(color);
    onChange(color);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange(undefined);
    setIsOpen(false);
  };

  const isTransparentValue = (inputValue || '').toLowerCase() === TRANSPARENT_COLOR;
  const previewBackground = isTransparentValue || !inputValue ? 'transparent' : inputValue;
  const previewBackgroundImage =
    !inputValue || isTransparentValue
      ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px'
      : 'none';
  const colorPickerValue = !inputValue || isTransparentValue ? '#000000' : inputValue;
  const displayValue = inputValue ? (isTransparentValue ? 'transparent' : inputValue) : '#000000';

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className={BASE_LABEL_CLASS}>
          {label}
        </label>
      )}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1">
            <InputWithIcon
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              leftIcon={
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{
                    backgroundColor: previewBackground || '#FFFFFF',
                    backgroundImage: previewBackgroundImage,
                  }}
                />
              }
              iconSpacing="compact"
              className="pr-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11',
              'bg-white hover:bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'transition-colors duration-200'
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </button>
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 h-11"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{ minWidth: '280px' }}
          >
            <div className="mb-3">
              <label className={`${BASE_LABEL_CLASS} mb-2`}>
                Preset Colors
              </label>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map((color) => {
                  const isTransparent = color === TRANSPARENT_COLOR;
                  const isSelected =
                    isTransparent ? isTransparentValue : inputValue === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        'w-8 h-8 rounded border-2 transition-all duration-200 flex items-center justify-center text-[10px] font-semibold uppercase',
                        'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        isSelected ? 'border-blue-500' : 'border-gray-300',
                      )}
                      style={{
                        backgroundColor: isTransparent ? 'transparent' : color,
                        backgroundImage: isTransparent
                          ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 6px 6px'
                          : 'none',
                        color: isTransparent ? '#111827' : 'transparent',
                      }}
                      title={isTransparent ? 'Transparent' : color}
                    >
                      {isTransparent ? 'T' : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <label className={`${BASE_LABEL_CLASS} mb-2`}>
                Custom Color
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer "
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    {displayValue}
                  </span>
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="#000000"
                  className="w-full py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ paddingLeft: '1.5rem !important' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
