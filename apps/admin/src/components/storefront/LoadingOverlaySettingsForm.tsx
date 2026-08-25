import React, { useMemo, useState } from 'react';
import { FiLoader, FiSave } from 'react-icons/fi';
import { useSettings } from '@admin/hooks/useSettings';
import { useToast } from '@admin/contexts/ToastContext';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { Button } from '@admin/components/common/Button';
import { Input } from '@admin/components/common/Input';
import { Toggle } from '@admin/components/common/Toggle';
import { Badge } from '@admin/components/common/Badge';

const SETTING_KEYS = {
  enabled: 'storefront.loading_overlay_enabled',
  title: 'storefront.loading_overlay_title',
  message: 'storefront.loading_overlay_message',
  showLogo: 'storefront.loading_overlay_show_logo',
  backgroundColor: 'storefront.loading_overlay_background_color',
  accentColor: 'storefront.loading_overlay_accent_color',
} as const;
const SETTING_GROUP = 'storefront';

interface LoadingOverlayDraft {
  enabled: boolean;
  title: string;
  message: string;
  showLogo: boolean;
  backgroundColor: string;
  accentColor: string;
}

const LoadingOverlaySettingsForm: React.FC = () => {
  const { settings, isLoading: settingsLoading, updateSetting, createSetting } = useSettings({
    group: SETTING_GROUP,
  });
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const initialValue = useMemo<LoadingOverlayDraft>(() => {
    const valueFor = (key: string, fallback: string) =>
      settings.find((setting) => setting.key === key)?.value ?? fallback;

    return {
      enabled: valueFor(SETTING_KEYS.enabled, 'true') === 'true',
      title: valueFor(SETTING_KEYS.title, ''),
      message: valueFor(SETTING_KEYS.message, ''),
      showLogo: valueFor(SETTING_KEYS.showLogo, 'true') === 'true',
      backgroundColor: valueFor(SETTING_KEYS.backgroundColor, ''),
      accentColor: valueFor(SETTING_KEYS.accentColor, '#3b82f6'),
    };
  }, [settings]);
  const [draft, setDraft] = useState<LoadingOverlayDraft>(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setDraft(initialValue);
  }, [initialValue]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(initialValue);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saveSetting = async (
        key: string,
        value: string,
        type: 'boolean' | 'string',
        description: string,
      ) => {
        const existingSetting = settings.find((setting) => setting.key === key);
        if (existingSetting?.id) {
          await updateSetting(existingSetting.id, { value, isPublic: true });
          return;
        }
        await createSetting({ key, value, type, group: SETTING_GROUP, isPublic: true, description });
      };

      await Promise.all([
        saveSetting(SETTING_KEYS.enabled, String(draft.enabled), 'boolean', 'Show loading overlay during storefront initialization'),
        saveSetting(SETTING_KEYS.title, draft.title.trim(), 'string', 'Custom storefront loading overlay title'),
        saveSetting(SETTING_KEYS.message, draft.message.trim(), 'string', 'Custom storefront loading overlay message'),
        saveSetting(SETTING_KEYS.showLogo, String(draft.showLogo), 'boolean', 'Show site logo on storefront loading overlay'),
        saveSetting(SETTING_KEYS.backgroundColor, draft.backgroundColor.trim(), 'string', 'Storefront loading overlay background color'),
        saveSetting(SETTING_KEYS.accentColor, draft.accentColor.trim() || '#3b82f6', 'string', 'Storefront loading overlay accent color'),
      ]);

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
              'Bật/tắt và tùy chỉnh màn hình loading toàn storefront.'
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
          checked={draft.enabled}
          onChange={() => setDraft((prev) => ({ ...prev, enabled: !prev.enabled }))}
          disabled={settingsLoading || isSaving}
        />
      </div>

      <div className={`space-y-5 ${draft.enabled ? '' : 'opacity-50'}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <span>{t('storefront.loading_overlay.title_label', 'Tiêu đề')}</span>
            <Input
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={t('storefront.loading_overlay.title_placeholder', 'Mặc định dùng tên website')}
              disabled={!draft.enabled || settingsLoading || isSaving}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <span>{t('storefront.loading_overlay.message_label', 'Thông báo')}</span>
            <Input
              value={draft.message}
              onChange={(event) => setDraft((prev) => ({ ...prev, message: event.target.value }))}
              placeholder={t('storefront.loading_overlay.message_placeholder', 'Đang tải...')}
              disabled={!draft.enabled || settingsLoading || isSaving}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <span>{t('storefront.loading_overlay.background_color', 'Màu nền')}</span>
            <Input
              type="color"
              value={draft.backgroundColor || '#eef2ff'}
              onChange={(event) => setDraft((prev) => ({ ...prev, backgroundColor: event.target.value }))}
              disabled={!draft.enabled || settingsLoading || isSaving}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <span>{t('storefront.loading_overlay.accent_color', 'Màu hiệu ứng')}</span>
            <Input
              type="color"
              value={draft.accentColor || '#3b82f6'}
              onChange={(event) => setDraft((prev) => ({ ...prev, accentColor: event.target.value }))}
              disabled={!draft.enabled || settingsLoading || isSaving}
            />
          </label>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">
              {t('storefront.loading_overlay.show_logo', 'Hiển thị logo website')}
            </p>
            <p className="text-sm text-neutral-500">
              {t('storefront.loading_overlay.show_logo_description', 'Dùng logo đã cấu hình trong thông tin website.')}
            </p>
          </div>
          <Toggle
            checked={draft.showLogo}
            onChange={() => setDraft((prev) => ({ ...prev, showLogo: !prev.showLogo }))}
            disabled={!draft.enabled || settingsLoading || isSaving}
          />
        </div>
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
