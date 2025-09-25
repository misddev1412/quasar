import React, { useState } from 'react';
import { FiTruck } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';

interface CreateDeliveryMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DeliveryMethodFormData {
  name: string;
  type: string;
  description: string;
  deliveryCost: number;
  costCalculationType: string;
  freeDeliveryThreshold?: number;
  minDeliveryTimeHours?: number;
  maxDeliveryTimeHours?: number;
  weightLimitKg?: number;
  sizeLimitCm: string;
  coverageAreas: string[];
  providerName: string;
  trackingEnabled: boolean;
  insuranceEnabled: boolean;
  signatureRequired: boolean;
  useThirdPartyIntegration: boolean;
  iconUrl: string;
  isActive: boolean;
  isDefault: boolean;
}

const DELIVERY_TYPES = [
  'STANDARD',
  'EXPRESS',
  'OVERNIGHT',
  'SAME_DAY',
  'PICKUP',
  'DIGITAL',
  'COURIER',
  'FREIGHT',
  'OTHER'
];

const COST_CALCULATION_TYPES = [
  'FIXED',
  'WEIGHT_BASED',
  'DISTANCE_BASED',
  'FREE'
];

export const CreateDeliveryMethodModal: React.FC<CreateDeliveryMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<DeliveryMethodFormData>({
    name: '',
    type: 'STANDARD',
    description: '',
    deliveryCost: 0,
    costCalculationType: 'FIXED',
    freeDeliveryThreshold: undefined,
    minDeliveryTimeHours: undefined,
    maxDeliveryTimeHours: undefined,
    weightLimitKg: undefined,
    sizeLimitCm: '',
    coverageAreas: [],
    providerName: '',
    trackingEnabled: false,
    insuranceEnabled: false,
    signatureRequired: false,
    useThirdPartyIntegration: false,
    iconUrl: '',
    isActive: true,
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCoverageArea, setNewCoverageArea] = useState('');

  const createMutation = trpc.adminDeliveryMethods.create.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: t('delivery_methods.create_success'),
        type: 'success'
      });
      onSuccess();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || t('delivery_methods.create_error'),
        type: 'error'
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('delivery_methods.form.name_required');
    }

    if (!formData.type) {
      newErrors.type = t('delivery_methods.form.type_required');
    }

    if (formData.deliveryCost < 0) {
      newErrors.deliveryCost = t('delivery_methods.form.cost_must_be_positive');
    }

    if (formData.minDeliveryTimeHours && formData.maxDeliveryTimeHours &&
        formData.minDeliveryTimeHours > formData.maxDeliveryTimeHours) {
      newErrors.maxDeliveryTimeHours = t('delivery_methods.form.min_time_less_than_max');
    }

    if (formData.weightLimitKg && formData.weightLimitKg < 0) {
      newErrors.weightLimitKg = t('delivery_methods.form.weight_limit_positive');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        type: formData.type as any,
        description: formData.description.trim() || undefined,
        deliveryCost: formData.deliveryCost,
        costCalculationType: formData.costCalculationType as any,
        freeDeliveryThreshold: formData.freeDeliveryThreshold,
        minDeliveryTimeHours: formData.minDeliveryTimeHours,
        maxDeliveryTimeHours: formData.maxDeliveryTimeHours,
        weightLimitKg: formData.weightLimitKg,
        sizeLimitCm: formData.sizeLimitCm.trim() || undefined,
        coverageAreas: formData.coverageAreas,
        providerName: formData.providerName.trim() || undefined,
        trackingEnabled: formData.trackingEnabled,
        insuranceEnabled: formData.insuranceEnabled,
        signatureRequired: formData.signatureRequired,
        useThirdPartyIntegration: formData.useThirdPartyIntegration,
        iconUrl: formData.iconUrl.trim() || undefined,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
      };
      await createMutation.mutateAsync(submitData as any);
    } catch (error) {
      // Error handling is done in onError callback
    }
  };

  const handleAddCoverageArea = () => {
    if (newCoverageArea.trim() && !formData.coverageAreas.includes(newCoverageArea.trim())) {
      setFormData(prev => ({
        ...prev,
        coverageAreas: [...prev.coverageAreas, newCoverageArea.trim()]
      }));
      setNewCoverageArea('');
    }
  };

  const handleRemoveCoverageArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coverageAreas: prev.coverageAreas.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: keyof DeliveryMethodFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <FiTruck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('delivery_methods.create')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('delivery_methods.create_description')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('delivery_methods.form.basic_info')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="name"
              type="text"
              label={`${t('delivery_methods.name')} *`}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('delivery_methods.type')} *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                required
              >
                {DELIVERY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`delivery_methods.types.${type}`)}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>
          </div>

          <FormInput
            id="description"
            type="textarea"
            label={t('delivery_methods.description')}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>

        {/* Integration Type */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('delivery_methods.form.integration_type', 'Integration Type')}
          </h3>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.useThirdPartyIntegration}
                onChange={(e) => handleInputChange('useThirdPartyIntegration', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('delivery_methods.use_third_party_integration', 'Use Third-party Integration')}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('delivery_methods.form.third_party_description', 'Enable this to use external delivery service APIs for automatic cost calculation and delivery time estimation')}
                </p>
              </div>
            </label>

            {/* Third-party Integration Configuration */}
            {formData.useThirdPartyIntegration && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-4">
                <h4 className="text-md font-medium text-blue-900 dark:text-blue-100">
                  {t('delivery_methods.form.third_party_config', 'Third-party Integration Configuration')}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('delivery_methods.form.third_party_note', 'When third-party integration is enabled, delivery costs and times will be calculated by the external service. Configure your API credentials below.')}
                </p>
                <div className="space-y-3">
                  <FormInput
                    id="apiKey"
                    type="text"
                    label={t('delivery_methods.form.api_key', 'API Key')}
                    placeholder={t('delivery_methods.form.api_key_placeholder', 'Enter your third-party API key')}
                  />
                  <FormInput
                    id="apiSecret"
                    type="password"
                    label={t('delivery_methods.form.api_secret', 'API Secret')}
                    placeholder={t('delivery_methods.form.api_secret_placeholder', 'Enter your API secret')}
                  />
                  <FormInput
                    id="apiEndpoint"
                    type="url"
                    label={t('delivery_methods.form.api_endpoint', 'API Endpoint')}
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing - Hidden for third-party integrations */}
        {!formData.useThirdPartyIntegration && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('delivery_methods.form.pricing')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="deliveryCost"
                type="number"
                label={t('delivery_methods.delivery_cost')}
                value={formData.deliveryCost.toString()}
                onChange={(e) => handleInputChange('deliveryCost', parseFloat(e.target.value) || 0)}
                error={errors.deliveryCost}
                min="0"
                step="0.01"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('delivery_methods.cost_calculation_type')}
                </label>
                <select
                  value={formData.costCalculationType}
                  onChange={(e) => handleInputChange('costCalculationType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  {COST_CALCULATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`delivery_methods.cost_types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <FormInput
                id="freeDeliveryThreshold"
                type="number"
                label={t('delivery_methods.free_delivery_threshold')}
                value={formData.freeDeliveryThreshold?.toString() || ''}
                onChange={(e) => handleInputChange('freeDeliveryThreshold', e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        {/* Delivery Times - Hidden for third-party integrations */}
        {!formData.useThirdPartyIntegration && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('delivery_methods.form.delivery_times')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="minDeliveryTimeHours"
                type="number"
                label={`${t('delivery_methods.min_delivery_time')} (${t('delivery_methods.hours')})`}
                value={formData.minDeliveryTimeHours?.toString() || ''}
                onChange={(e) => handleInputChange('minDeliveryTimeHours', e.target.value ? parseInt(e.target.value) : undefined)}
                min="0"
              />

              <FormInput
                id="maxDeliveryTimeHours"
                type="number"
                label={`${t('delivery_methods.max_delivery_time')} (${t('delivery_methods.hours')})`}
                value={formData.maxDeliveryTimeHours?.toString() || ''}
                onChange={(e) => handleInputChange('maxDeliveryTimeHours', e.target.value ? parseInt(e.target.value) : undefined)}
                error={errors.maxDeliveryTimeHours}
                min="0"
              />
            </div>
          </div>
        )}

        {/* Limitations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('delivery_methods.form.limitations')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="weightLimitKg"
              type="number"
              label={t('delivery_methods.weight_limit')}
              value={formData.weightLimitKg?.toString() || ''}
              onChange={(e) => handleInputChange('weightLimitKg', e.target.value ? parseFloat(e.target.value) : undefined)}
              error={errors.weightLimitKg}
              min="0"
              step="0.1"
            />

            <FormInput
              id="sizeLimitCm"
              type="text"
              label={t('delivery_methods.size_limit')}
              value={formData.sizeLimitCm}
              onChange={(e) => handleInputChange('sizeLimitCm', e.target.value)}
              placeholder="e.g., 100x50x30"
            />
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('delivery_methods.form.coverage')}
          </h3>

          <div className="flex gap-2">
            <FormInput
              id="newCoverageArea"
              type="text"
              label=""
              value={newCoverageArea}
              onChange={(e) => setNewCoverageArea(e.target.value)}
              placeholder={t('delivery_methods.form.enter_area')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCoverageArea}
              className="self-end"
            >
              {t('delivery_methods.form.add_coverage_area')}
            </Button>
          </div>

          {formData.coverageAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.coverageAreas.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveCoverageArea(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    title={t('delivery_methods.form.remove_area')}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Provider Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('delivery_methods.form.provider')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="providerName"
              type="text"
              label={t('delivery_methods.provider_name')}
              value={formData.providerName}
              onChange={(e) => handleInputChange('providerName', e.target.value)}
            />

            <FormInput
              id="iconUrl"
              type="url"
              label={t('delivery_methods.icon_url')}
              value={formData.iconUrl}
              onChange={(e) => handleInputChange('iconUrl', e.target.value)}
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('delivery_methods.form.features')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.trackingEnabled}
                  onChange={(e) => handleInputChange('trackingEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('delivery_methods.tracking_enabled')}
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.insuranceEnabled}
                  onChange={(e) => handleInputChange('insuranceEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('delivery_methods.insurance_enabled')}
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.signatureRequired}
                  onChange={(e) => handleInputChange('signatureRequired', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('delivery_methods.signature_required')}
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('admin.active')}
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('delivery_methods.form.set_as_default')}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isPending}
          >
            {t('delivery_methods.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};