import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiCreditCard, FiDollarSign, FiSettings, FiGlobe, FiInfo, FiShield, FiTrash2 } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { Checkbox } from '../common/Checkbox';
import { Card, CardHeader, CardContent } from '../common/Card';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'CASH' | 'CHECK' | 'CRYPTOCURRENCY' | 'BUY_NOW_PAY_LATER' | 'OTHER';
  description?: string;
  isActive: boolean;
  sortOrder: number;
  processingFee: number;
  processingFeeType: 'FIXED' | 'PERCENTAGE';
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies?: string[];
  iconUrl?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditPaymentMethodModalProps {
  isOpen: boolean;
  paymentMethod: PaymentMethod;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentProviderFormState {
  id?: string;
  providerKey: string;
  displayName: string;
  providerType: string;
  description: string;
  environment: string;
  apiKey: string;
  apiSecret: string;
  clientId: string;
  clientSecret: string;
  checksumKey: string;
  publicKey: string;
  webhookUrl: string;
  webhookSecret: string;
  callbackUrl: string;
  isActive: boolean;
}

const PAYMENT_METHOD_TYPES = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHECK', label: 'Check' },
  { value: 'CRYPTOCURRENCY', label: 'Cryptocurrency' },
  { value: 'BUY_NOW_PAY_LATER', label: 'Buy Now Pay Later' },
  { value: 'PAYOS', label: 'PayOS' },
  { value: 'OTHER', label: 'Other' },
];

const PROCESSING_FEE_TYPES = [
  { value: 'FIXED', label: 'Fixed Amount' },
  { value: 'PERCENTAGE', label: 'Percentage' },
];

const COMMON_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'SGD'
];

const buildDefaultProviderForm = (): PaymentProviderFormState => ({
  providerKey: '',
  displayName: '',
  providerType: '',
  description: '',
  environment: 'production',
  apiKey: '',
  apiSecret: '',
  clientId: '',
  clientSecret: '',
  checksumKey: '',
  publicKey: '',
  webhookUrl: '',
  webhookSecret: '',
  callbackUrl: '',
  isActive: true,
});

export const EditPaymentMethodModal: React.FC<EditPaymentMethodModalProps> = ({
  isOpen,
  paymentMethod,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'CREDIT_CARD' as const,
    description: '',
    isActive: true,
    sortOrder: 0,
    processingFee: 0,
    processingFeeType: 'FIXED' as const,
    minAmount: '',
    maxAmount: '',
    iconUrl: '',
    isDefault: false,
  });

  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([]);
  const [newCurrency, setNewCurrency] = useState('');
  const [providerForm, setProviderForm] = useState<PaymentProviderFormState>(() => buildDefaultProviderForm());

  // Initialize form with payment method data
  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        name: paymentMethod.name,
        type: paymentMethod.type as any,
        description: paymentMethod.description || '',
        isActive: paymentMethod.isActive,
        sortOrder: paymentMethod.sortOrder,
        processingFee: paymentMethod.processingFee,
        processingFeeType: paymentMethod.processingFeeType as any,
        minAmount: paymentMethod.minAmount?.toString() || '',
        maxAmount: paymentMethod.maxAmount?.toString() || '',
        iconUrl: paymentMethod.iconUrl || '',
        isDefault: paymentMethod.isDefault,
      });
      setSupportedCurrencies(paymentMethod.supportedCurrencies || []);
      setProviderForm(buildDefaultProviderForm());
    }
  }, [paymentMethod]);

  const updateMutation = trpc.adminPaymentMethods.update.useMutation({
    onSuccess: (result) => {
      addToast({
        title: 'Success',
        description: 'Payment method updated successfully',
        type: 'success'
      });
      onSuccess();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update payment method',
        type: 'error'
      });
    },
  });

  const {
    data: providerConfigData,
    isFetching: providerConfigLoading,
    refetch: refetchProviderConfig,
  } = trpc.adminPaymentMethods.providerConfig.useQuery(
    { paymentMethodId: paymentMethod?.id || '' },
    {
      enabled: isOpen && Boolean(paymentMethod?.id),
    }
  );

  useEffect(() => {
    const provider = (providerConfigData as any)?.data;
    if (provider) {
      setProviderForm({
        id: provider.id,
        providerKey: provider.providerKey || '',
        displayName: provider.displayName || provider.providerKey || '',
        providerType: provider.providerType || '',
        description: provider.description || '',
        environment: provider.environment || 'production',
        apiKey: provider.apiKey || '',
        apiSecret: provider.apiSecret || '',
        clientId: provider.clientId || '',
        clientSecret: provider.clientSecret || '',
        checksumKey: provider.checksumKey || '',
        publicKey: provider.publicKey || '',
        webhookUrl: provider.webhookUrl || '',
        webhookSecret: provider.webhookSecret || '',
        callbackUrl: provider.callbackUrl || '',
        isActive: provider.isActive ?? true,
      });
    } else {
      setProviderForm(buildDefaultProviderForm());
    }
  }, [providerConfigData]);

  const saveProviderConfigMutation = trpc.adminPaymentMethods.saveProviderConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Payment provider configuration saved successfully',
        type: 'success',
      });
      refetchProviderConfig();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update provider configuration',
        type: 'error',
      });
    },
  });

  const deleteProviderConfigMutation = trpc.adminPaymentMethods.deleteProviderConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Payment provider configuration deleted successfully',
        type: 'success',
      });
      setProviderForm(buildDefaultProviderForm());
      refetchProviderConfig();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete provider configuration',
        type: 'error',
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProviderInputChange = (field: keyof PaymentProviderFormState, value: any) => {
    setProviderForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
      maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
      supportedCurrencies: supportedCurrencies.length > 0 ? supportedCurrencies : undefined,
    };

    updateMutation.mutate({
      id: paymentMethod.id,
      data: submitData,
    });
  };

  const addCurrency = () => {
    if (newCurrency && !supportedCurrencies.includes(newCurrency.toUpperCase())) {
      setSupportedCurrencies(prev => [...prev, newCurrency.toUpperCase()]);
      setNewCurrency('');
    }
  };

  const removeCurrency = (currency: string) => {
    setSupportedCurrencies(prev => prev.filter(c => c !== currency));
  };

  const addCommonCurrency = (currency: string) => {
    if (!supportedCurrencies.includes(currency)) {
      setSupportedCurrencies(prev => [...prev, currency]);
    }
  };

  const handleSaveProviderConfig = () => {
    if (!paymentMethod?.id) return;
    saveProviderConfigMutation.mutate({
      ...providerForm,
      paymentMethodId: paymentMethod.id,
    } as any);
  };

  const handleDeleteProviderConfig = () => {
    if (!providerForm.id) return;
    if (window.confirm('Are you sure you want to delete this provider configuration?')) {
      deleteProviderConfigMutation.mutate({ id: providerForm.id });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('admin.edit_payment_method')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('admin.edit_payment_method_description')}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <FiX className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiInfo className="w-4 h-4" />
              <h4 className="font-medium">{t('admin.basic_information')}</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="payment-method-name"
                type="text"
                label={`${t('admin.name')} *`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('admin.enter_payment_method_name')}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.type')} *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                >
                  {PAYMENT_METHOD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <FormInput
              id="payment-method-description"
              type="textarea"
              label={t('admin.description')}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('admin.enter_payment_method_description')}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="payment-method-icon-url"
                type="url"
                label={t('admin.icon_url')}
                value={formData.iconUrl}
                onChange={(e) => handleInputChange('iconUrl', e.target.value)}
                placeholder="https://example.com/icon.png"
              />

              <FormInput
                id="payment-method-sort-order"
                type="number"
                label={t('admin.sort_order')}
                value={formData.sortOrder.toString()}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Provider Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiShield className="w-4 h-4" />
              <h4 className="font-medium">{t('admin.payment_provider_configuration', 'Payment Provider Configuration')}</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure gateway credentials (PayOS, Stripe, etc.) associated with this payment method.
            </p>

            {providerConfigLoading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('loading', 'Loading...')}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    id="provider-key"
                    type="text"
                    label="Provider Key"
                    value={providerForm.providerKey}
                    onChange={(e) => handleProviderInputChange('providerKey', e.target.value.toUpperCase())}
                    placeholder={t('admin.provider_key_placeholder', 'PROVIDER_KEY')}
                  />
                  <FormInput
                    id="provider-display-name"
                    type="text"
                    label="Display Name"
                    value={providerForm.displayName}
                    onChange={(e) => handleProviderInputChange('displayName', e.target.value)}
                    placeholder={t('admin.provider_display_name_placeholder', 'Provider display name')}
                  />
                  <FormInput
                    id="provider-type"
                    type="text"
                    label="Provider Type"
                    value={providerForm.providerType}
                    onChange={(e) => handleProviderInputChange('providerType', e.target.value)}
                    placeholder={t('admin.provider_type_placeholder', 'PAYMENT_GATEWAY')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Environment
                    </label>
                    <select
                      value={providerForm.environment}
                      onChange={(e) => handleProviderInputChange('environment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="production">Production</option>
                      <option value="sandbox">Sandbox</option>
                      <option value="staging">Staging</option>
                    </select>
                  </div>

                  <FormInput
                    id="provider-webhook-url"
                    type="text"
                    label="Webhook URL"
                    value={providerForm.webhookUrl}
                    onChange={(e) => handleProviderInputChange('webhookUrl', e.target.value)}
                    placeholder="https://your-domain.com/webhook"
                  />
                  <FormInput
                    id="provider-callback-url"
                    type="text"
                    label="Callback URL"
                    value={providerForm.callbackUrl}
                    onChange={(e) => handleProviderInputChange('callbackUrl', e.target.value)}
                    placeholder="https://your-domain.com/callback"
                  />
                </div>

                <FormInput
                  id="provider-description"
                  type="textarea"
                  label={t('admin.description')}
                  value={providerForm.description}
                  onChange={(e) => handleProviderInputChange('description', e.target.value)}
                  placeholder="Describe how this provider is used"
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id="provider-client-id"
                    type="text"
                    label="Client ID"
                    value={providerForm.clientId}
                    onChange={(e) => handleProviderInputChange('clientId', e.target.value)}
                  />
                  <FormInput
                    id="provider-client-secret"
                    type="text"
                    label="Client Secret"
                    value={providerForm.clientSecret}
                    onChange={(e) => handleProviderInputChange('clientSecret', e.target.value)}
                  />
                  <FormInput
                    id="provider-api-key"
                    type="text"
                    label="API Key"
                    value={providerForm.apiKey}
                    onChange={(e) => handleProviderInputChange('apiKey', e.target.value)}
                  />
                  <FormInput
                    id="provider-api-secret"
                    type="text"
                    label="API Secret"
                    value={providerForm.apiSecret}
                    onChange={(e) => handleProviderInputChange('apiSecret', e.target.value)}
                  />
                  <FormInput
                    id="provider-checksum-key"
                    type="text"
                    label="Checksum Key"
                    value={providerForm.checksumKey}
                    onChange={(e) => handleProviderInputChange('checksumKey', e.target.value)}
                    placeholder="Secret checksum/signature key"
                  />
                  <FormInput
                    id="provider-public-key"
                    type="text"
                    label="Public Key"
                    value={providerForm.publicKey}
                    onChange={(e) => handleProviderInputChange('publicKey', e.target.value)}
                  />
                  <FormInput
                    id="provider-webhook-secret"
                    type="text"
                    label="Webhook Secret"
                    value={providerForm.webhookSecret}
                    onChange={(e) => handleProviderInputChange('webhookSecret', e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={providerForm.isActive}
                    onCheckedChange={(checked) => handleProviderInputChange('isActive', Boolean(checked))}
                    id="provider-active"
                  />
                  <label htmlFor="provider-active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.active')}
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleSaveProviderConfig}
                    isLoading={saveProviderConfigMutation.isPending}
                    disabled={!providerForm.providerKey || !providerForm.displayName}
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {providerForm.id ? t('admin.save_changes') : t('admin.save_configuration', 'Save Configuration')}
                  </Button>
                  {providerForm.id && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDeleteProviderConfig}
                      isLoading={deleteProviderConfigMutation.isPending}
                    >
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      {t('admin.delete_configuration', 'Delete Configuration')}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Processing Fees */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiDollarSign className="w-4 h-4" />
              <h4 className="font-medium">{t('admin.processing_fees')}</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="payment-method-processing-fee"
                type="number"
                label={t('admin.processing_fee')}
                value={formData.processingFee.toString()}
                onChange={(e) => handleInputChange('processingFee', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.processing_fee_type')}
                </label>
                <select
                  value={formData.processingFeeType}
                  onChange={(e) => handleInputChange('processingFeeType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  {PROCESSING_FEE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="payment-method-min-amount"
                type="number"
                label={t('admin.minimum_amount')}
                value={formData.minAmount}
                onChange={(e) => handleInputChange('minAmount', e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />

              <FormInput
                id="payment-method-max-amount"
                type="number"
                label={t('admin.maximum_amount')}
                value={formData.maxAmount}
                onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                placeholder="10000.00"
                step="0.01"
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Supported Currencies */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiGlobe className="w-4 h-4" />
              <h4 className="font-medium">{t('admin.supported_currencies')}</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {COMMON_CURRENCIES.map(currency => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => addCommonCurrency(currency)}
                  disabled={supportedCurrencies.includes(currency)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    supportedCurrencies.includes(currency)
                      ? 'bg-primary-100 text-primary-700 border-primary-300 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <FormInput
                id="new-currency"
                type="text"
                label=""
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                placeholder={t('admin.add_custom_currency')}
                maxLength={3}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addCurrency}>
                {t('admin.add')}
              </Button>
            </div>

            {supportedCurrencies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {supportedCurrencies.map(currency => (
                  <span
                    key={currency}
                    className="inline-flex items-center px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-md dark:bg-primary-900/30 dark:text-primary-300"
                  >
                    {currency}
                    <button
                      type="button"
                      onClick={() => removeCurrency(currency)}
                      className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiSettings className="w-4 h-4" />
              <h4 className="font-medium">{t('admin.settings')}</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                id="payment-method-active"
              />
              <label htmlFor="payment-method-active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.active')}
              </label>

              <Checkbox
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                id="payment-method-default"
              />
              <label htmlFor="payment-method-default" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.set_as_default')}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            disabled={!formData.name.trim()}
          >
            <FiSave className="w-4 h-4 mr-2" />
            {t('admin.save_changes')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
