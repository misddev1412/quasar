import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { ColorSelector } from '../common/ColorSelector';
import { Toggle } from '../common/Toggle';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

export interface LoyaltyTierFormValues {
  name: string;
  description?: string;
  minPointsRequired: number;
  maxPointsRequired?: number;
  color?: string;
  iconUrl?: string;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface LoyaltyTierFormHandle {
  submit: () => Promise<boolean>;
}

type LoyaltyTierFormDefaults = Partial<LoyaltyTierFormValues> & {
  minPoints?: number;
  maxPoints?: number;
  icon?: string;
};

interface LoyaltyTierFormProps {
  defaultValues?: LoyaltyTierFormDefaults;
  onSubmit: (values: LoyaltyTierFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  showInternalSubmitButton?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showActionBar?: boolean;
}

const getNormalizedValues = (
  values?: LoyaltyTierFormDefaults
): LoyaltyTierFormValues => ({
  name: values?.name ?? '',
  description: values?.description ?? '',
  minPointsRequired: values?.minPointsRequired ?? values?.minPoints ?? 0,
  maxPointsRequired: values?.maxPointsRequired ?? values?.maxPoints,
  color: values?.color ?? '#7c3aed',
  iconUrl: values?.iconUrl ?? values?.icon ?? '',
  benefits:
    values?.benefits && values.benefits.length > 0 ? [...values.benefits] : [''],
  isActive: values?.isActive ?? true,
  sortOrder: values?.sortOrder ?? 0,
});

export const LoyaltyTierForm = forwardRef<
  LoyaltyTierFormHandle,
  LoyaltyTierFormProps
>(
  (
    {
      defaultValues,
      onSubmit,
      isSubmitting = false,
      showInternalSubmitButton = false,
      onCancel,
      submitLabel,
      cancelLabel,
      showActionBar = true,
    },
    ref,
  ) => {
    const { t } = useTranslationWithBackend();
  const [formData, setFormData] = useState<LoyaltyTierFormValues>(() =>
    getNormalizedValues(defaultValues)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const defaultValuesKey = JSON.stringify(defaultValues ?? {});

  // Reset form when default values change (e.g. after fetching tier detail)
  useEffect(() => {
    setFormData(getNormalizedValues(defaultValues));
    setErrors({});
  }, [defaultValuesKey]);

  const hasBenefits = useMemo(
    () => formData.benefits.some((benefit) => benefit.trim()),
    [formData.benefits]
  );

  const handleInputChange = <K extends keyof LoyaltyTierFormValues>(
    field: K,
    value: LoyaltyTierFormValues[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    const updated = [...formData.benefits];
    updated[index] = value;
    handleInputChange('benefits', updated);
  };

  const addBenefit = () => {
    handleInputChange('benefits', [...formData.benefits, '']);
  };

  const removeBenefit = (index: number) => {
    if (formData.benefits.length <= 1) return;
    const updated = formData.benefits.filter((_, idx) => idx !== index);
    handleInputChange('benefits', updated.length ? updated : ['']);
  };

  const validateForm = () => {
    const validationErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      validationErrors.name = t('loyalty.validation.name_required');
    }

    if (formData.minPointsRequired < 0) {
      validationErrors.minPointsRequired = t('loyalty.validation.min_points_positive');
    }

    if (
      formData.maxPointsRequired !== undefined &&
      formData.maxPointsRequired <= formData.minPointsRequired
    ) {
      validationErrors.maxPointsRequired = t(
        'loyalty.validation.max_points_greater_than_min'
      );
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const getSubmittedValues = (): LoyaltyTierFormValues => ({
    ...formData,
    maxPointsRequired:
      formData.maxPointsRequired === undefined || formData.maxPointsRequired === null
        ? undefined
        : formData.maxPointsRequired,
    iconUrl: formData.iconUrl?.trim() || undefined,
    benefits: formData.benefits
      .map((benefit) => benefit.trim())
      .filter((benefit) => benefit.length > 0),
  });

  const runSubmit = async () => {
    if (!validateForm()) {
      return false;
    }

    try {
      await onSubmit(getSubmittedValues());
      return true;
    } catch (error) {
      // Parent handles toast/errors; avoid console noise unless needed
      return false;
    }
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    return runSubmit();
  };

  useImperativeHandle(ref, () => ({
    submit: () => runSubmit(),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('loyalty.basic_information')}
            </h3>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('loyalty.tier_name')} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('loyalty.tier_name_placeholder')}
                className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('loyalty.description')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('loyalty.description_placeholder')}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center gap-3">
              <Toggle
                checked={formData.isActive}
                onChange={(checked) => handleInputChange('isActive', checked)}
                disabled={isSubmitting}
                aria-label={t('loyalty.is_active')}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('loyalty.is_active')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('loyalty.points_range')}
            </h3>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('loyalty.min_points')} *
              </label>
              <Input
                type="number"
                value={formData.minPointsRequired}
                onChange={(e) =>
                  handleInputChange(
                    'minPointsRequired',
                    Number.isNaN(parseInt(e.target.value, 10))
                      ? 0
                      : Math.max(0, parseInt(e.target.value, 10))
                  )
                }
                placeholder="0"
                className={
                  errors.minPointsRequired ? 'border-red-500 focus:border-red-500' : ''
                }
                min={0}
                disabled={isSubmitting}
              />
              {errors.minPointsRequired && (
                <p className="mt-1 text-sm text-red-600">{errors.minPointsRequired}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('loyalty.max_points')}
              </label>
              <Input
                type="number"
                value={
                  formData.maxPointsRequired === undefined ? '' : formData.maxPointsRequired
                }
                onChange={(e) =>
                  handleInputChange(
                    'maxPointsRequired',
                    e.target.value === ''
                      ? undefined
                      : Math.max(0, parseInt(e.target.value, 10) || 0)
                  )
                }
                placeholder={t('loyalty.max_points_placeholder')}
                className={
                  errors.maxPointsRequired ? 'border-red-500 focus:border-red-500' : ''
                }
                min={0}
                disabled={isSubmitting}
              />
              {errors.maxPointsRequired && (
                <p className="mt-1 text-sm text-red-600">{errors.maxPointsRequired}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('loyalty.max_points_description')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('loyalty.sort_order')}
              </label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleInputChange(
                    'sortOrder',
                    Number.isNaN(parseInt(e.target.value, 10))
                      ? 0
                      : parseInt(e.target.value, 10)
                  )
                }
                placeholder="0"
                min={0}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('loyalty.appearance')}
          </h3>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('loyalty.color')}
              </label>
              <ColorSelector
                value={formData.color || '#7c3aed'}
                onChange={(color) => handleInputChange('color', color || '#7c3aed')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('loyalty.icon')}
              </label>
              <Input
                value={formData.iconUrl || ''}
                onChange={(e) => handleInputChange('iconUrl', e.target.value)}
                placeholder={t('loyalty.icon_placeholder')}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('loyalty.icon_description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('loyalty.benefits')}
          </h3>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {formData.benefits.map((benefit, index) => (
            <div key={`benefit-${index}`} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder={t('loyalty.benefit_placeholder')}
                  disabled={isSubmitting}
                />
              </div>
              {formData.benefits.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeBenefit(index)}
                  disabled={isSubmitting}
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addBenefit}
            disabled={isSubmitting}
            className="w-full"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {t('loyalty.add_benefit')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('loyalty.preview')}
          </h3>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: formData.color || '#7c3aed' }}
              >
                {formData.iconUrl ? (
                  <span className="text-white text-lg">{formData.iconUrl}</span>
                ) : (
                  <FiStar className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {formData.name || t('loyalty.tier_name_placeholder')}
                </h4>
                {formData.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.description}
                  </p>
                )}
                <div >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.minPointsRequired}+ {t('loyalty.points')}
                  </span>
                  {formData.maxPointsRequired && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {' '}
                      {t('loyalty.up_to')} {formData.maxPointsRequired}
                    </span>
                  )}
                </div>
                {hasBenefits && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {t('loyalty.benefits')}:
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-none pl-0">
                      {formData.benefits
                        .map((benefit) => benefit.trim())
                        .filter(Boolean)
                        .map((benefit, index) => (
                          <li key={`preview-benefit-${index}`} className="flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="md:self-start">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    formData.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {formData.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(showActionBar || showInternalSubmitButton) && (
        <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 pt-2">
          {showActionBar && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {cancelLabel || t('common.cancel', 'Cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="min-w-[140px]"
          >
            {submitLabel || t('common.save', 'Save')}
          </Button>
        </div>
      )}

      {/* Hidden submit button keeps native form submission accessible */}
      <button type="submit" className="hidden" aria-hidden="true" />
    </form>
  );
});

LoyaltyTierForm.displayName = 'LoyaltyTierForm';

export default LoyaltyTierForm;
