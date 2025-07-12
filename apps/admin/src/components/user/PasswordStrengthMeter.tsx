import React from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface PasswordStrengthMeterProps {
  password?: string;
}

const checkPasswordStrength = (pw: string) => {
  if (!pw) return 0;
  if (pw.length < 8) return 1;

  let score = 1;
  if (/\d/.test(pw)) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  return Math.min(score, 4);
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const { t } = useTranslationWithBackend();
  const strength = checkPasswordStrength(password);
  
  const strengthLevels = [
    { label: '', color: 'bg-transparent' }, // level 0
    { label: 'user.password_strength.weak', color: 'bg-red-500' }, // level 1
    { label: 'user.password_strength.medium', color: 'bg-orange-500' }, // level 2
    { label: 'user.password_strength.strong', color: 'bg-yellow-500' }, // level 3
    { label: 'user.password_strength.very_strong', color: 'bg-green-500' }, // level 4
  ];

  const currentLevel = strengthLevels[strength];

  return (
    <div className="w-full space-y-2 pt-1">
      <div className="grid grid-cols-4 gap-x-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-colors ${
              index < strength ? currentLevel.color : 'bg-gray-200 dark:bg-neutral-700'
            }`}
          />
        ))}
      </div>
      {password && strength > 0 && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t('user.password_strength.title')}:{' '}
          <span className="font-semibold">{t(currentLevel.label)}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter; 