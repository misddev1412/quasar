import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Textarea } from '../../../components/common/Textarea';
import { Switch } from '../../../components/common/Switch';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../context/ToastContext';
import { trpc } from '../../../utils/trpc';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { ColorSelector } from '../../../components/common/ColorSelector';

interface LoyaltyTierForm {
  name: string;
  description: string;
  minPoints: number;
  maxPoints?: number;
  color: string;
  icon?: string;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
}

const CreateLoyaltyTierPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<LoyaltyTierForm>({
    name: '',
    description: '',
    minPoints: 0,
    maxPoints: undefined,
    color: '#000000',
    icon: '',
    benefits: [''],
    isActive: true,
    sortOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTierMutation = trpc.adminLoyaltyTiers.create.useMutation({
    onSuccess: (data: any) => {
      addToast({ type: 'success', title: t('loyalty.tier_created_success') });
      navigate('/loyalty?tab=tiers');
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: t('loyalty.tier_create_error'), description: error?.message });
      setIsSubmitting(false);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('loyalty.validation.name_required');
    }

    if (formData.minPoints < 0) {
      newErrors.minPoints = t('loyalty.validation.min_points_positive');
    }

    if (formData.maxPoints !== undefined && formData.maxPoints <= formData.minPoints) {
      newErrors.maxPoints = t('loyalty.validation.max_points_greater_than_min');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Filter out empty benefits
    const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');

    try {
      await createTierMutation.mutateAsync({
        ...formData,
        benefits: filteredBenefits,
      });
    } catch (error) {
      // Error handled by mutation callbacks
    }
  };

  const handleInputChange = (field: keyof LoyaltyTierForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    handleInputChange('benefits', newBenefits);
  };

  const addBenefit = () => {
    handleInputChange('benefits', [...formData.benefits, '']);
  };

  const removeBenefit = (index: number) => {
    if (formData.benefits.length > 1) {
      const newBenefits = formData.benefits.filter((_, i) => i !== index);
      handleInputChange('benefits', newBenefits);
    }
  };

  const actions = [
    {
      label: t('common.cancel'),
      onClick: () => navigate('/loyalty?tab=tiers'),
      icon: <FiArrowLeft />,
    },
    {
      label: t('common.save'),
      onClick: () => handleSubmit(new Event('submit') as any),
      primary: true,
      icon: <FiSave />,
    },
  ];

  return (
    <BaseLayout 
      title={t('loyalty.create_tier')} 
      description={t('loyalty.create_tier_description')}
      actions={actions}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
        },
        {
          label: t('loyalty.title'),
          href: '/loyalty?tab=tiers',
        },
        {
          label: t('loyalty.create_tier'),
        }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('loyalty.basic_information')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('loyalty.tier_name')} *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('loyalty.tier_name_placeholder')}
                    className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
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
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.isActive}
                    onChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('loyalty.is_active')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Points Range */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('loyalty.points_range')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('loyalty.min_points')} *
                  </label>
                  <Input
                    type="number"
                    value={formData.minPoints}
                    onChange={(e) => handleInputChange('minPoints', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className={errors.minPoints ? 'border-red-500 focus:border-red-500' : ''}
                    min={0}
                  />
                  {errors.minPoints && (
                    <p className="mt-1 text-sm text-red-600">{errors.minPoints}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('loyalty.max_points')}
                  </label>
                  <Input
                    type="number"
                    value={formData.maxPoints || ''}
                    onChange={(e) => handleInputChange('maxPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder={t('loyalty.max_points_placeholder')}
                    className={errors.maxPoints ? 'border-red-500 focus:border-red-500' : ''}
                    min={0}
                  />
                  {errors.maxPoints && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxPoints}</p>
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
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Appearance */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('loyalty.appearance')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('loyalty.color')}
                </label>
                <div className="flex items-center space-x-3">
                  <ColorSelector
                    value={formData.color}
                    onChange={(color) => handleInputChange('color', color)}
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="#000000"
                    className="max-w-32"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('loyalty.icon')}
                </label>
                <Input
                  value={formData.icon || ''}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder={t('loyalty.icon_placeholder')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('loyalty.icon_description')}
                </p>
              </div>
            </div>
          </Card>

          {/* Benefits */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('loyalty.benefits')}
            </h3>
            
            <div className="space-y-3">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <Input
                      value={benefit}
                      onChange={(e) => handleBenefitChange(index, e.target.value)}
                      placeholder={t('loyalty.benefit_placeholder')}
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
            </div>
          </Card>

          {/* Preview */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('loyalty.preview')}
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.icon ? (
                    <span className="text-white text-lg">{formData.icon}</span>
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
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.minPoints}+ {t('loyalty.points')}
                    </span>
                    {formData.maxPoints && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {' '}{t('loyalty.up_to')} {formData.maxPoints}
                      </span>
                    )}
                  </div>
                  {formData.benefits.filter(b => b.trim()).length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {t('loyalty.benefits')}:
                      </div>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {formData.benefits.filter(b => b.trim()).map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    formData.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {formData.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </BaseLayout>
  );
};

export default CreateLoyaltyTierPage;
