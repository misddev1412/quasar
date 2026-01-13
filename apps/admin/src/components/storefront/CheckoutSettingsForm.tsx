import React, { useEffect, useMemo, useState } from 'react';
import { FiGlobe, FiRefreshCw, FiSave, FiInfo } from 'react-icons/fi';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { Button } from '../common/Button';
import SearchSelect from '../common/SearchSelect';
import { Badge } from '../common/Badge';

const SETTING_KEY = 'storefront.checkout_default_country_id';
const SETTING_GROUP = 'storefront';

interface CountryOption {
  id: string;
  name: string;
  code: string;
  iso2?: string | null;
  iso3?: string | null;
}

type CountrySelectOption = {
  value: string;
  label: string;
};

const CheckoutSettingsForm: React.FC = () => {
  const { settings, isLoading: settingsLoading, updateSetting, createSetting } = useSettings({
    group: SETTING_GROUP,
  });
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const existingSetting = useMemo(
    () => settings.find((setting) => setting.key === SETTING_KEY),
    [settings]
  );

  const {
    data: countriesData,
    isLoading: countriesLoading,
    refetch: refetchCountries,
  } = trpc.adminAddressBook.getCountries.useQuery();

  const countries = useMemo<CountryOption[]>(() => {
    if (Array.isArray(countriesData)) return countriesData as CountryOption[];
    if (countriesData && typeof countriesData === 'object' && 'data' in countriesData) {
      const maybeArray = (countriesData as any).data;
      if (Array.isArray(maybeArray)) {
        return maybeArray as CountryOption[];
      }
    }
    return [];
  }, [countriesData]);

  const countryOptions = useMemo<CountrySelectOption[]>(
    () =>
      countries
        .map((country) => ({
          value: country.id,
          label: `${country.name} (${country.code})`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countries]
  );

  const selectedOption = useMemo(
    () => countryOptions.find((option) => option.value === selectedCountryId) || null,
    [countryOptions, selectedCountryId]
  );

  useEffect(() => {
    if (existingSetting?.value !== undefined && existingSetting?.value !== null) {
      setSelectedCountryId(existingSetting.value);
    }
  }, [existingSetting?.value]);

  const handleSave = async () => {
    if (!selectedCountryId) {
      addToast({
        type: 'error',
        title: t('common.error', 'Lỗi'),
        description: t(
          'storefront.checkout.default_country_required',
          'Vui lòng chọn quốc gia mặc định để hiển thị ở trang thanh toán.'
        ),
      });
      return;
    }

    setIsSaving(true);
    try {
      if (existingSetting?.id) {
        await updateSetting(existingSetting.id, {
          value: selectedCountryId,
          isPublic: true,
        });
      } else {
        await createSetting({
          key: SETTING_KEY,
          value: selectedCountryId,
          type: 'string',
          group: SETTING_GROUP,
          isPublic: true,
          description: 'Default checkout country for storefront',
        });
      }

      addToast({
        type: 'success',
        title: t('common.saved', 'Đã lưu'),
        description: t(
          'storefront.checkout.default_country_saved',
          'Quốc gia mặc định cho trang thanh toán đã được cập nhật.'
        ),
      });
    } catch (error) {
      console.error('Failed to save checkout default country', error);
      addToast({
        type: 'error',
        title: t('common.error', 'Lỗi'),
        description: t(
          'storefront.checkout.default_country_save_failed',
          'Không thể lưu quốc gia mặc định. Vui lòng thử lại.'
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToStoredValue = () => {
    setSelectedCountryId(existingSetting?.value || '');
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200">
          <FiGlobe className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t('storefront.checkout.default_country_title', 'Quốc gia mặc định cho checkout')}
            </h2>
            <Badge variant="secondary" size="sm">
              {t('storefront.checkout.checkout', 'Checkout')}
            </Badge>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t(
              'storefront.checkout.default_country_hint',
              'Chọn quốc gia sẽ được chọn sẵn cho khách ở trang thanh toán của storefront.'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <SearchSelect
            label={t('storefront.checkout.default_country_label', 'Quốc gia mặc định')}
            value={selectedOption}
            onChange={(option: any) => setSelectedCountryId(option?.value || '')}
            options={countryOptions}
            placeholder={t('storefront.checkout.default_country_placeholder', 'Chọn quốc gia')}
            isLoading={countriesLoading}
            isDisabled={settingsLoading || countriesLoading}
            size="md"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={resetToStoredValue}
            disabled={settingsLoading || isSaving}
            className="px-5"
          >
            {t('common.reset', 'Đặt lại')}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={settingsLoading || countriesLoading || !selectedCountryId}
            startIcon={<FiSave />}
            className="px-6 hover:text-white"
          >
            {t('common.save', 'Lưu')}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4 text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
        <FiInfo className="w-4 h-4 mt-0.5 text-neutral-500" />
        <div className="space-y-1">
          <p>{t('storefront.checkout.default_country_note', 'Giá trị được lưu là ID quốc gia trong hệ thống.')}</p>
          <p className="text-xs text-neutral-500">
            {t(
              'storefront.checkout.default_country_note_2',
              'Nếu thay đổi danh sách quốc gia, hãy cập nhật lại cấu hình này để đảm bảo lựa chọn mặc định hợp lệ.'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <button
          className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-3 py-2 text-neutral-700 hover:bg-primary-600 hover:text-white transition-colors"
          onClick={() => refetchCountries()}
          type="button"
        >
          <FiRefreshCw className="w-4 h-4" />
          {t('storefront.checkout.refresh_countries', 'Tải lại danh sách quốc gia')}
        </button>
        {countriesLoading && <span>{t('common.loading', 'Đang tải...')}</span>}
      </div>
    </div>
  );
};

export default CheckoutSettingsForm;
