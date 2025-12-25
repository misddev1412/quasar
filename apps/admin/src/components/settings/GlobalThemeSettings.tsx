import React from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import LocaleSwitcher from '../LocaleSwitcher';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { Sun, Moon } from 'lucide-react';

import { ThemeConfig } from '../../config/theme.config';

interface GlobalThemeSettingsProps {
  theme?: ThemeConfig;
  onThemeChange?: (newTheme: Partial<ThemeConfig>) => void;
  currentMode?: 'light' | 'dark';
  onModeChange?: (mode: 'light' | 'dark') => void;
}

const GlobalThemeSettings: React.FC<GlobalThemeSettingsProps> = ({
  theme: propTheme,
  onThemeChange,
  currentMode: propMode,
  onModeChange
}) => {
  const { t } = useTranslationWithBackend();
  const context = useTheme();

  // Prefer props, fallback to context
  const theme = propTheme || context.theme;
  const setTheme = onThemeChange || context.setTheme;
  const currentMode = propMode || context.currentMode;
  const toggleDarkMode = () => {
    if (onModeChange) {
      onModeChange(currentMode === 'dark' ? 'light' : 'dark');
    } else {
      context.toggleDarkMode();
    }
  };

  // Available pre-defined colors
  const colorOptions = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Cyan', value: '#0891b2' },
  ];

  const handleColorChange = (key: string, color: string) => {
    setTheme({
      colors: {
        ...theme.colors,
        [key]: color
      }
    });
  };

  const renderCustomColorInput = (key: string, value: string) => {
    const isPrimaryMain = key === 'primary';
    const isCustom = isPrimaryMain ? !colorOptions.some(c => c.value === value) : true;

    return (
      <div
        className={`relative w-8 h-8 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-600 group cursor-pointer ${isCustom && isPrimaryMain ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500' : ''}`}
      >
        {isCustom ? (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: value }}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
              <span className="text-white text-lg leading-none pb-1 font-light">+</span>
            </div>
          </>
        )}
        <input
          type="color"
          value={value}
          onChange={(e) => handleColorChange(key, e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title={`Select ${key} color`}
        />
      </div>
    );
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme({
      fontFamily: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      <div className="mt-4 space-y-6">

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('settings.mode', 'Mode')}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.choose_default_mode', 'Choose default light or dark mode')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            startIcon={currentMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          >
            {currentMode === 'dark' ? t('header.switchToLightMode') : t('header.switchToDarkMode')}
          </Button>
        </div>

        {/* Font Family Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.font_family', 'Font Family')}
          </label>
          <select
            value={theme.fontFamily}
            onChange={handleFontChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            {/* Dynamically import availableFonts from config would be better but keeping it simple for now or need to export it from config to be safe */}
            {/* We'll assume the same list or re-declare. ideally import. */}
            <option value="Inter, sans-serif">Inter</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Outfit, sans-serif">Outfit</option>
            <option value='"Open Sans", sans-serif'>Open Sans</option>
            <option value="Lato, sans-serif">Lato</option>
            <option value="Montserrat, sans-serif">Montserrat</option>
            <option value="Raleway, sans-serif">Raleway</option>
          </select>
        </div>

        {/* Primary Color Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t('settings.primary_color', 'Primary Color')}
          </label>
          <div className="space-y-6">
            {/* Main Primary */}
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Main Color</div>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange('primary', color.value)}
                    className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${theme.colors.primary === color.value ? 'ring-2 ring-offset-1 ring-primary-500 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                {/* Custom Input for Primary Main */}
                {renderCustomColorInput('primary', theme.colors.primary)}
              </div>
            </div>

            {/* Primary Variants */}
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Variations</div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  {renderCustomColorInput('primaryHover', theme.colors.primaryHover || theme.colors.primary)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">Hover</span>
                </div>
                <div className="flex items-center gap-3">
                  {renderCustomColorInput('primaryLight', theme.colors.primaryLight || theme.colors.primary)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">Light</span>
                </div>
                <div className="flex items-center gap-3">
                  {renderCustomColorInput('primaryDark', theme.colors.primaryDark || theme.colors.primary)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">Dark</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Color Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t('settings.secondary_color', 'Secondary Color')}
          </label>
          <div className="space-y-6">
            {/* Main Secondary */}
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Main Color</div>
              <div className="flex items-center gap-2">
                {renderCustomColorInput('secondary', theme.colors.secondary)}
                <span className="text-sm text-gray-500 italic ml-2">Currently {theme.colors.secondary}</span>
              </div>
            </div>

            {/* Secondary Variants */}
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Variations</div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  {renderCustomColorInput('secondaryHover', theme.colors.secondaryHover || theme.colors.secondary)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">Hover</span>
                </div>
                <div className="flex items-center gap-3">
                  {renderCustomColorInput('secondaryLight', theme.colors.secondaryLight || theme.colors.secondary)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">Light</span>
                </div>
                <div className="flex items-center gap-3">
                  {renderCustomColorInput('secondaryDark', theme.colors.secondaryDark || theme.colors.secondary)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">Dark</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GlobalThemeSettings; 