import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiCalendar, FiGift } from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Textarea } from '../../../components/common/Textarea';
import { Switch } from '../../../components/common/Switch';
import { Select } from '../../../components/common/Select';
import { DatePicker } from '../../../components/common/DatePicker';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../context/ToastContext';
import { trpc } from '../../../utils/trpc';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
// import { FileUpload } from '../../../components/common/FileUpload';

// Simple image upload component for URL-based image handling
const ImageUpload: React.FC<{
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  placeholder?: string;
  description?: string;
}> = ({ value, onChange, onRemove, placeholder, description }) => {
  const { t } = useTranslationWithBackend();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload this file to a server
      // For now, create a temporary URL
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {value ? (
              <div className="relative">
                <img
                  src={value}
                  alt={t('loyalty.reward_preview_alt')}
                  className="w-full h-full object-cover rounded-lg max-h-48"
                />
                <button
                  type="button"
                  onClick={onRemove}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">{t('loyalty.upload_image_cta')}</span> {t('loyalty.upload_image_helper')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('loyalty.upload_image_formats')}</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

interface LoyaltyRewardForm {
  name: string;
  description: string;
  type: 'discount' | 'free_shipping' | 'free_product' | 'cashback' | 'gift_card' | 'exclusive_access';
  pointsRequired: number;
  value?: number;
  discountType?: 'percentage' | 'fixed';
  conditions?: string;
  isActive: boolean;
  isLimited: boolean;
  totalQuantity?: number;
  remainingQuantity?: number;
  startsAt?: string;
  endsAt?: string;
  imageUrl?: string;
  termsConditions?: string;
  tierRestrictions: string[];
  autoApply: boolean;
  sortOrder: number;
}

const CreateLoyaltyRewardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<LoyaltyRewardForm>({
    name: '',
    description: '',
    type: 'discount',
    pointsRequired: 0,
    value: undefined,
    discountType: 'fixed',
    conditions: '',
    isActive: true,
    isLimited: false,
    totalQuantity: undefined,
    remainingQuantity: undefined,
    startsAt: undefined,
    endsAt: undefined,
    imageUrl: undefined,
    termsConditions: '',
    tierRestrictions: [],
    autoApply: false,
    sortOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tiersData } = trpc.adminLoyaltyTiers.list.useQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const createRewardMutation = trpc.adminLoyaltyRewards.create.useMutation({
    onSuccess: (data: any) => {
      addToast({ type: 'success', title: t('loyalty.reward_created_success') });
      navigate('/loyalty?tab=rewards');
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: t('loyalty.reward_create_error'), description: error?.message });
      setIsSubmitting(false);
    },
  });

  const rewardTypes = [
    { value: 'discount', label: t('loyalty.reward_types.discount') },
    { value: 'free_shipping', label: t('loyalty.reward_types.free_shipping') },
    { value: 'free_product', label: t('loyalty.reward_types.free_product') },
    { value: 'cashback', label: t('loyalty.reward_types.cashback') },
    { value: 'gift_card', label: t('loyalty.reward_types.gift_card') },
    { value: 'exclusive_access', label: t('loyalty.reward_types.exclusive_access') },
  ];

  const discountTypes = [
    { value: 'percentage', label: t('loyalty.discount_types.percentage') },
    { value: 'fixed', label: t('loyalty.discount_types.fixed') },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('loyalty.validation.name_required');
    }

    if (formData.pointsRequired < 0) {
      newErrors.pointsRequired = t('loyalty.validation.points_required_positive');
    }

    if (formData.type === 'discount' && formData.value !== undefined && formData.value <= 0) {
      newErrors.value = t('loyalty.validation.value_positive');
    }

    if (formData.type === 'discount' && formData.discountType === 'percentage' && formData.value && formData.value > 100) {
      newErrors.value = t('loyalty.validation.percentage_max_100');
    }

    if (formData.isLimited) {
      if (!formData.totalQuantity || formData.totalQuantity <= 0) {
        newErrors.totalQuantity = t('loyalty.validation.total_quantity_positive');
      }
      if (!formData.remainingQuantity || formData.remainingQuantity < 0) {
        newErrors.remainingQuantity = t('loyalty.validation.remaining_quantity_positive');
      }
      if (formData.totalQuantity && formData.remainingQuantity && formData.remainingQuantity > formData.totalQuantity) {
        newErrors.remainingQuantity = t('loyalty.validation.remaining_exceeds_total');
      }
    }

    if (formData.endsAt && formData.startsAt && formData.endsAt <= formData.startsAt) {
      newErrors.endsAt = t('loyalty.validation.end_date_after_start');
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

    try {
      // Convert string dates to Date objects for the API
      const submissionData = {
        ...formData,
        startsAt: formData.startsAt ? new Date(formData.startsAt) : undefined,
        endsAt: formData.endsAt ? new Date(formData.endsAt) : undefined,
      };
      await createRewardMutation.mutateAsync(submissionData);
    } catch (error) {
      // Error handled by mutation callbacks
    }
  };

  const handleInputChange = (field: keyof LoyaltyRewardForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (url: string) => {
    handleInputChange('imageUrl', url);
  };

  const handleImageRemove = () => {
    handleInputChange('imageUrl', undefined);
  };

  const actions = [
    {
      label: t('common.cancel'),
      onClick: () => navigate('/loyalty?tab=rewards'),
      icon: <FiArrowLeft />,
    },
    {
      label: t('common.save'),
      onClick: () => handleSubmit(new Event('submit') as any),
      primary: true,
      icon: <FiSave />,
    },
  ];

  const tiers = (tiersData as any)?.data?.items || [];

  return (
    <BaseLayout 
      title={t('loyalty.create_reward')} 
      description={t('loyalty.create_reward_description')}
      actions={actions}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
        },
        {
          label: t('loyalty.title'),
          href: '/loyalty?tab=rewards',
        },
        {
          label: t('loyalty.create_reward'),
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
                    {t('loyalty.reward_name')} *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('loyalty.reward_name_placeholder')}
                    className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('loyalty.reward_type')} *
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(value) => handleInputChange('type', value)}
                    options={rewardTypes}
                  />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('loyalty.points_required')} *
                  </label>
                  <Input
                    type="number"
                    value={formData.pointsRequired}
                    onChange={(e) => handleInputChange('pointsRequired', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className={errors.pointsRequired ? 'border-red-500 focus:border-red-500' : ''}
                    min={0}
                  />
                  {errors.pointsRequired && (
                    <p className="mt-1 text-sm text-red-600">{errors.pointsRequired}</p>
                  )}
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

            {/* Reward Value */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('loyalty.reward_value')}
              </h3>
              
              <div className="space-y-4">
                {formData.type === 'discount' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('loyalty.discount_type')}
                      </label>
                      <Select
                        value={formData.discountType}
                        onChange={(value) => handleInputChange('discountType', value)}
                        options={discountTypes}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {formData.discountType === 'percentage' 
                          ? t('loyalty.discount_percentage')
                          : t('loyalty.discount_amount')
                        } *
                      </label>
                      <Input
                        type="number"
                        value={formData.value || ''}
                        onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || undefined)}
                        placeholder={formData.discountType === 'percentage' ? '10' : '10.00'}
                        className={errors.value ? 'border-red-500 focus:border-red-500' : ''}
                        min={0}
                        max={formData.discountType === 'percentage' ? 100 : undefined}
                        step={formData.discountType === 'percentage' ? 1 : 0.01}
                      />
                      {errors.value && (
                        <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                      )}
                    </div>
                  </>
                )}

                {formData.type === 'cashback' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('loyalty.cashback_amount')} *
                    </label>
                    <Input
                      type="number"
                      value={formData.value || ''}
                      onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || undefined)}
                      placeholder="10.00"
                      className={errors.value ? 'border-red-500 focus:border-red-500' : ''}
                      min={0}
                      step={0.01}
                    />
                    {errors.value && (
                      <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                    )}
                  </div>
                )}

                {formData.type === 'gift_card' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('loyalty.gift_card_value')} *
                    </label>
                    <Input
                      type="number"
                      value={formData.value || ''}
                      onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || undefined)}
                      placeholder="25.00"
                      className={errors.value ? 'border-red-500 focus:border-red-500' : ''}
                      min={0}
                      step={0.01}
                    />
                    {errors.value && (
                      <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('loyalty.conditions')}
                  </label>
                  <Textarea
                    value={formData.conditions}
                    onChange={(e) => handleInputChange('conditions', e.target.value)}
                    placeholder={t('loyalty.conditions_placeholder')}
                    rows={3}
                  />
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

          {/* Availability */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('loyalty.availability')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.isLimited}
                  onChange={(checked) => handleInputChange('isLimited', checked)}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('loyalty.is_limited')}
                </span>
              </div>

              {formData.isLimited && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('loyalty.total_quantity')} *
                    </label>
                    <Input
                      type="number"
                      value={formData.totalQuantity || ''}
                      onChange={(e) => handleInputChange('totalQuantity', parseInt(e.target.value) || undefined)}
                      placeholder="100"
                      className={errors.totalQuantity ? 'border-red-500 focus:border-red-500' : ''}
                      min={1}
                    />
                    {errors.totalQuantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalQuantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('loyalty.remaining_quantity')} *
                    </label>
                    <Input
                      type="number"
                      value={formData.remainingQuantity || ''}
                      onChange={(e) => handleInputChange('remainingQuantity', parseInt(e.target.value) || undefined)}
                      placeholder="100"
                      className={errors.remainingQuantity ? 'border-red-500 focus:border-red-500' : ''}
                      min={0}
                    />
                    {errors.remainingQuantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.remainingQuantity}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('loyalty.starts_at')}
                  </label>
                  <DatePicker
                    value={formData.startsAt}
                    onChange={(date) => handleInputChange('startsAt', date)}
                    placeholder={t('loyalty.select_start_date')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('loyalty.ends_at')}
                  </label>
                  <DatePicker
                    value={formData.endsAt}
                    onChange={(date) => handleInputChange('endsAt', date)}
                    placeholder={t('loyalty.select_end_date')}
                  />
                  {errors.endsAt && (
                    <p className="mt-1 text-sm text-red-600">{errors.endsAt}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Image */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('loyalty.reward_image')}
            </h3>
            
            <ImageUpload
              value={formData.imageUrl}
              onChange={handleImageUpload}
              onRemove={handleImageRemove}
              placeholder={t('loyalty.upload_image_placeholder')}
              description={t('loyalty.upload_image_description')}
            />
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('loyalty.terms_conditions')}
            </h3>
            
            <Textarea
              value={formData.termsConditions}
              onChange={(e) => handleInputChange('termsConditions', e.target.value)}
              placeholder={t('loyalty.terms_conditions_placeholder')}
              rows={6}
            />
          </Card>

          {/* Settings */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('loyalty.reward_settings')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.autoApply}
                  onChange={(checked) => handleInputChange('autoApply', checked)}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('loyalty.auto_apply')}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('loyalty.auto_apply_description')}
                </p>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </BaseLayout>
  );
};

export default CreateLoyaltyRewardPage;
