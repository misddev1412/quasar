import React, { useState } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import FormInput from '../common/FormInput';
import { Button } from '../common/Button';
import { AdminUpdatePasswordDto } from '../../../../backend/src/modules/user/dto/admin/admin-user.dto';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const passwordRules = (t: (key: string, options?: any) => string) => [
  { id: 'length', text: t('validation.password_min_length', { min: 8 }), regex: /.{8,}/ },
  { id: 'lowercase', text: t('validation.password_one_lowercase'), regex: /[a-z]/ },
  { id: 'uppercase', text: t('validation.password_one_uppercase'), regex: /[A-Z]/ },
  { id: 'number', text: t('validation.password_one_number'), regex: /\d/ },
  { id: 'special', text: t('validation.password_one_special'), regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ },
];

const makePasswordSchema = (t: (key: string, options?: any) => string) => z.object({
  oldPassword: z.string().min(1, t('validation.required')),
  newPassword: z.string()
    .min(8, t('validation.password_min_length', { min: 8 }))
    .regex(/[a-z]/, t('validation.password_one_lowercase', 'Must contain at least one lowercase letter'))
    .regex(/[A-Z]/, t('validation.password_one_uppercase', 'Must contain at least one uppercase letter'))
    .regex(/\d/, t('validation.password_one_number', 'Must contain at least one number'))
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, t('validation.password_one_special', 'Must contain at least one special character')),
  confirmPassword: z.string().min(1, t('validation.required')),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: t('validation.passwords_not_match'),
  path: ['confirmPassword'],
});

type UpdatePasswordFormValues = z.infer<ReturnType<typeof makePasswordSchema>>;

interface UpdatePasswordFormProps {
  onSubmit: SubmitHandler<AdminUpdatePasswordDto>;
  isSubmitting: boolean;
  error?: string;
}

const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({ onSubmit, isSubmitting, error }) => {
  const { t } = useTranslationWithBackend();
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordSchema = makePasswordSchema(t);
  const rules = passwordRules(t);

  const { control, register, handleSubmit, formState: { errors } } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
  });

  const newPasswordValue = useWatch({
    control,
    name: 'newPassword',
    defaultValue: "",
  });

  const handleFormSubmit: SubmitHandler<UpdatePasswordFormValues> = (data) => {
    onSubmit({ oldPassword: data.oldPassword, newPassword: data.newPassword });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-8">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 md:col-span-2">
        <FormInput
          label={t('user.current_password')}
          type={showOldPassword ? 'text' : 'password'}
          id="oldPassword"
          autoComplete="current-password"
          {...register('oldPassword')}
          error={errors.oldPassword?.message}
          rightIcon={
            <span onClick={() => setShowOldPassword(p => !p)} className="cursor-pointer">
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          }
        />
        <div className="space-y-2">
          <FormInput
            label={t('user.new_password')}
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            autoComplete="new-password"
            {...register('newPassword')}
            error={errors.newPassword?.message}
            rightIcon={
              <span onClick={() => setShowNewPassword(p => !p)} className="cursor-pointer">
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            }
          />
          <PasswordStrengthMeter password={newPasswordValue} />
        </div>

        <FormInput
          label={t('user.confirm_new_password')}
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          rightIcon={
            <span onClick={() => setShowConfirmPassword(p => !p)} className="cursor-pointer">
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          }
        />
        
        {error && <p className="text-red-500 text-sm py-2">{error}</p>}
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.update')}
          </Button>
        </div>
      </form>
      <div className="mt-4 md:mt-0 md:col-span-1">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          {/* NOTE: Add 'user.password_requirements' to translation files */}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">{t('user.password_requirements', 'Password requirements')}</h3>
          <ul className="space-y-2 text-sm">
            {rules.map((rule) => (
              <li key={rule.id} className={`flex items-center ${rule.regex.test(newPasswordValue) ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                {rule.regex.test(newPasswordValue) ? <CheckCircle2 size={16} className="mr-2 shrink-0" /> : <XCircle size={16} className="mr-2 shrink-0" />}
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordForm; 