import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import FormInput from '../common/FormInput';
import { Button } from '../common/Button';
import { AdminUpdatePasswordDto } from '../../../../backend/src/modules/user/dto/admin/admin-user.dto';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'validation.required'),
  newPassword: z.string().min(6, 'validation.password_min_length'),
  confirmPassword: z.string().min(6, 'validation.password_min_length'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'validation.passwords_not_match',
  path: ['confirmPassword'],
});

type UpdatePasswordFormValues = z.infer<typeof passwordSchema>;

interface UpdatePasswordFormProps {
  onSubmit: SubmitHandler<AdminUpdatePasswordDto>;
  isSubmitting: boolean;
  error?: string;
}

const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({ onSubmit, isSubmitting, error }) => {
  const { t } = useTranslationWithBackend();
  
  const { register, handleSubmit, formState: { errors } } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const handleFormSubmit: SubmitHandler<UpdatePasswordFormValues> = (data) => {
    onSubmit({ oldPassword: data.oldPassword, newPassword: data.newPassword });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-lg">
      <FormInput
        label={t('user.current_password')}
        type="password"
        id="oldPassword"
        {...register('oldPassword')}
        error={errors.oldPassword?.message && t(errors.oldPassword.message)}
      />
      <FormInput
        label={t('user.new_password')}
        type="password"
        id="newPassword"
        {...register('newPassword')}
        error={errors.newPassword?.message && t(errors.newPassword.message, { min: 6 })}
      />
      <FormInput
        label={t('user.confirm_new_password')}
        type="password"
        id="confirmPassword"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message && t(errors.confirmPassword.message)}
      />
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('common.update')}
        </Button>
      </div>
    </form>
  );
};

export default UpdatePasswordForm; 