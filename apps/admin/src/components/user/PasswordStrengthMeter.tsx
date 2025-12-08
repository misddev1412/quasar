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
    { label: '', bar: 'bg-transparent', badge: '' },
    { label: 'user.password_strength.weak', bar: 'bg-gradient-to-r from-red-500 to-red-600', badge: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30' },
    { label: 'user.password_strength.medium', bar: 'bg-gradient-to-r from-orange-400 to-orange-500', badge: 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30' },
    { label: 'user.password_strength.strong', bar: 'bg-gradient-to-r from-yellow-400 to-amber-500', badge: 'text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30' },
    { label: 'user.password_strength.very_strong', bar: 'bg-gradient-to-r from-emerald-500 to-green-600', badge: 'text-emerald-800 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30' },
  ];

  const currentLevel = strengthLevels[strength];

  return (
    <div className="w-full space-y-2 pt-1">
      <div className="grid grid-cols-4 gap-x-1.5 md:gap-x-2 h-1.5 md:h-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-full rounded-full transition-all duration-200 ${
              index < strength ? (currentLevel as any).bar : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          />
        ))}
      </div>
      {password && strength > 0 && (
        <div className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">
          {t('user.password_strength.title')}:{' '}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${(currentLevel as any).badge}`}>
            {t((currentLevel as any).label)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter; 