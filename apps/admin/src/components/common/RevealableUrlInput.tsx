import React, { useState } from 'react';
import clsx from 'clsx';
import { Input } from './Input';
import { Button } from './Button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface RevealableUrlInputProps {
    value?: string;
    placeholder?: string;
    inputSize?: 'sm' | 'md' | 'lg';
    className?: string;
    hiddenLabel?: string;
    revealLabel?: string;
    hideLabel?: string;
}

export const RevealableUrlInput: React.FC<RevealableUrlInputProps> = ({
    value = '',
    placeholder,
    inputSize = 'md',
    className,
    hiddenLabel,
    revealLabel,
    hideLabel,
}) => {
    const { t } = useTranslationWithBackend();
    const [isRevealed, setIsRevealed] = useState(false);

    if (!value) {
        return (
            <Input
                value=""
                readOnly
                placeholder={placeholder}
                inputSize={inputSize}
                className={className}
            />
        );
    }

    const hiddenMessage = hiddenLabel || t('common.url_hidden', 'URL hidden');
    const showLabel = revealLabel || t('common.show_full_url', 'Show full URL');
    const hideLabelText = hideLabel || t('common.hide_full_url', 'Hide URL');

    return (
        <div className="space-y-2">
            <div className="relative w-full">
                <Input
                    value={value}
                    readOnly
                    placeholder={placeholder}
                    inputSize={inputSize}
                    className={clsx(
                        className,
                        !isRevealed && 'text-transparent caret-transparent select-none'
                    )}
                />
                {!isRevealed && (
                    <div className="pointer-events-none absolute inset-0 flex items-center rounded-lg px-3.5 text-sm text-gray-500">
                        {hiddenMessage}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                    startIcon={isRevealed ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    onClick={() => setIsRevealed((prev) => !prev)}
                >
                    {isRevealed ? hideLabelText : showLabel}
                </Button>
            </div>
        </div>
    );
};
