import { z } from 'zod';

export interface PasswordRule {
  id: string;
  text: string;
  regex: RegExp;
}

export const getPasswordRules = (t: (key: string, options?: any) => string): PasswordRule[] => [
  { id: 'length', text: t('validation.password_min_length', { min: 8 }), regex: /.{8,}/ },
  { id: 'lowercase', text: t('validation.password_one_lowercase'), regex: /[a-z]/ },
  { id: 'uppercase', text: t('validation.password_one_uppercase'), regex: /[A-Z]/ },
  { id: 'number', text: t('validation.password_one_number'), regex: /\d/ },
  { id: 'special', text: t('validation.password_one_special'), regex: /[!@#$%^&*()_+\-=[]{};':"\\|,.<>\/?]/ },
];

// Secure password generator utility (no DOM/UI dependencies)
export const generateSecurePassword = (length = 12): string => {
  const lowers = 'abcdefghijklmnopqrstuvwxyz';
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specials = "!@#$%^&*()-_=+[]{};:',.<>/?";
  const all = lowers + uppers + numbers + specials;

  const getRandomInt = (max: number) => {
    if (typeof window !== 'undefined' && (window as any).crypto && (window as any).crypto.getRandomValues) {
      const array = new Uint32Array(1);
      (window as any).crypto.getRandomValues(array);
      return array[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  const chars: string[] = [];
  // Ensure at least one from each set
  chars.push(lowers[getRandomInt(lowers.length)]);
  chars.push(uppers[getRandomInt(uppers.length)]);
  chars.push(numbers[getRandomInt(numbers.length)]);
  chars.push(specials[getRandomInt(specials.length)]);
  for (let i = chars.length; i < length; i++) {
    chars.push(all[getRandomInt(all.length)]);
  }
  // Shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};

// Optionally, a zod password schema builder could live here if needed downstream
export const makePasswordSchema = (t: (key: string, options?: any) => string) => z.string()
  .min(8, t('validation.password_min_length', { min: 8 }))
  .regex(/[a-z]/, t('validation.password_one_lowercase'))
  .regex(/[A-Z]/, t('validation.password_one_uppercase'))
  .regex(/\d/, t('validation.password_one_number'))
  .regex(/[!@#$%^&*()_+\-=[]{};':"\\|,.<>\/?]/, t('validation.password_one_special'));

