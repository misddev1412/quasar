import React, { useMemo, useState } from 'react';
import { FiLoader, FiSave } from 'react-icons/fi';
import { useSettings } from '@admin/hooks/useSettings';
import { useToast } from '@admin/contexts/ToastContext';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { Button } from '@admin/components/common/Button';
import { Toggle } from '@admin/components/common/Toggle';
import { Badge } from '@admin/components/common/Badge';

const SETTING_KEY = 'storefront.loading_overlay_enabled';
const SETTING_GROUP = 'storefront';

const LoadingOverlaySettingsForm: React.FC = () => {
  const { settings, isLoading: settingsLoading, updateSetting, createSetting } = useSettings({
    group: SETTING_GROUP,
  });
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const existingSetting = useMemo(
    () => settings.find((setting) => setting.key === SETTING_KEY),
    [settings]
  );

  const initialValue = (existingSetting?.value ?? 'true') === 'true';
  const [enabled, setEnabled] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setEnabled((existingSetting?.value ?? 'true') === 'true');
  }, [existingSetting?.value]);

  const isDirty = enabled !== initialValue;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (existingSetting?.id) {
        await updateSetting(existingSetting.id, {
          value: enabled ? 'true' : 'false',
          isPublic: true,
        });
      } else {
        await createSetting({
          key: SETTING_KEY,
          value: enabled ? 'true' : 'false',
          type: 'boolean',
          group: SETTING_GROUP,
          isPublic: true,
          description: 'Show loading overlay during storefront initialization',
        });
      }

      addToast({
        type: 'success',
        title: t('common.saved', 'Đã lưu'),
        description: t(
          'storefront.loading_overlay.saved',
          'Cấu hình hiển thị loading overlay đã được cập nhật.'
        ),
      });
    } catch (error) {
      console.error('Failed to save storefront loading overlay setting', error);
      addToast({
        type: 'error',
        title: t('common.error', 'Lỗi'),
        description: t(
          'storefront.loading_overlay.save_failed',
          'Không thể lưu cấu hình loading overlay. Vui lòng thử lại.'
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-200">
          <FiLoader className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t('storefront.loading_overlay.title', 'Loading overlay storefront')}
            </h2>
            <Badge variant="secondary" size="sm">
              {t('storefront.loading_overlay.badge', 'Storefront')}
            </Badge>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t(
              'storefront.loading_overlay.hint',
              'Bật/tắt lớp loading overlay toàn màn hình khi storefront khởi tạo.'
            )}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-neutral-900 dark:text-white">
            {t('storefront.loading_overlay.enable_label', 'Hiển thị loading overlay')}
          </p>
          <p className="text-sm text-neutral-500">
            {t(
              'storefront.loading_overlay.enable_description',
              'Khi tắt, storefront sẽ không hiển thị màn hình loading overlay trong giai đoạn init.'
            )}
          </p>
        </div>
        <Toggle
          checked={enabled}
          onChange={() => setEnabled((prev) => !prev)}
          disabled={settingsLoading || isSaving}
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={settingsLoading || !isDirty}
          startIcon={<FiSave />}
          className="px-6 hover:text-white"
        >
          {t('common.save', 'Lưu')}
        </Button>
      </div>
    </div>
  );
};

export default LoadingOverlaySettingsForm;
