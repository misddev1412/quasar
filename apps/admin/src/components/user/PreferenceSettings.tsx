import React from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import LocaleSwitcher from '../LocaleSwitcher';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { Sun, Moon } from 'lucide-react';

const PreferenceSettings: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { currentMode, toggleDarkMode } = useTheme();

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.language_settings')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('settings.choose_display_language')}
        </p>
        <div className="mt-4">
          <LocaleSwitcher />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">{t('settings.theme_preference')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('settings.choose_light_or_dark_mode')}
        </p>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            startIcon={currentMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          >
            {currentMode === 'dark' ? t('header.switchToLightMode') : t('header.switchToDarkMode')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSettings; 