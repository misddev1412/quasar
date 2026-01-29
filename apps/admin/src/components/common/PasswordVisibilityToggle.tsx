import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';

interface PasswordVisibilityToggleProps {
    isVisible: boolean;
    onToggle: () => void;
    className?: string;
    size?: number;
}

export const PasswordVisibilityToggle: React.FC<PasswordVisibilityToggleProps> = ({
    isVisible,
    onToggle,
    className = '',
    size = 20,
}) => {
    const { t } = useTranslationWithBackend();

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`p-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
            title={isVisible ? t('common.hide') : t('common.show')}
            aria-pressed={isVisible}
            aria-label={isVisible ? t('common.hide') : t('common.show')}
            tabIndex={-1}
        >
            {isVisible ? <EyeOff size={size} /> : <Eye size={size} />}
        </button>
    );
};
