import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BaseLayout from '../../components/layout/BaseLayout';
import { Button } from '../../components/common/Button';
import { Toggle } from '../../components/common/Toggle';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PhoneInputField } from '../../components/common/PhoneInputField';
import TextareaInput from '../../components/common/TextareaInput';
import { Modal } from '../../components/common/Modal';
import { ColorSelector } from '../../components/common/ColorSelector';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import {
  FloatingWidgetActionConfig,
  FloatingWidgetActionConfigList,
  FloatingWidgetActionType,
  floatingWidgetActionListSchema,
  floatingWidgetActionTypeValues,
} from '@shared/types/floating-widget.types';
import { FiArrowDown, FiArrowUp, FiEdit2, FiPlus, FiRefreshCw, FiSave, FiTrash2 } from 'react-icons/fi';
import UnifiedIcon from '../../components/common/UnifiedIcon';
import { SettingData } from '../../hooks/useSettings';

type ApiSettingResponse = {
  code: number;
  status: string;
  data?: SettingData;
  timestamp: string;
};

const FLOATING_ICONS_SETTING_KEY = 'storefront.float_icons';
const FLOATING_ICONS_GROUP = 'storefront-ui';

const DEFAULT_ICON_BY_TYPE: Record<FloatingWidgetActionType, string> = {
  call: 'phone',
  email: 'mail',
  back_to_top: 'arrow-up',
  zalo: 'chat',
  messenger: 'chat',
  custom: 'star',
};

const ICON_OPTIONS = [
  { value: 'phone', label: 'Phone' },
  { value: 'mail', label: 'Email' },
  { value: 'chat', label: 'Chat Bubble' },
  { value: 'arrow-up', label: 'Arrow Up' },
  { value: 'bookmark', label: 'Bookmark' },
  { value: 'bell', label: 'Bell' },
  { value: 'heart', label: 'Heart' },
  { value: 'map-pin', label: 'Map Pin' },
  { value: 'star', label: 'Star' },
  { value: 'home', label: 'Home' },
  { value: 'cog', label: 'Gear' },
];

const TYPE_OPTIONS = floatingWidgetActionTypeValues.map((value) => ({
  value,
  label: value
    .replace(/_/g, ' ')
    .replace(/^(.)/, (match) => match.toUpperCase()),
}));

const emptyMetadata = (): NonNullable<FloatingWidgetActionConfig['metadata']> => ({
  phoneNumber: undefined,
  email: undefined,
  messengerLink: undefined,
  zaloPhone: undefined,
  customUrl: undefined,
  note: undefined,
});

const normalizeItems = (items: FloatingWidgetActionConfig[]): FloatingWidgetActionConfigList =>
  items
    .map((item) => ({
      ...item,
      icon: item.icon || DEFAULT_ICON_BY_TYPE[item.type],
      metadata: { ...emptyMetadata(), ...(item.metadata || {}) },
    }))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      ...item,
      order: index,
    }));

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `float-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

interface FloatingIconFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialItem: FloatingWidgetActionConfig | null;
  onSubmit: (item: FloatingWidgetActionConfig) => void;
  onClose: () => void;
  nextOrder: number;
}

const FloatingIconFormModal: React.FC<FloatingIconFormModalProps> = ({
  isOpen,
  mode,
  initialItem,
  onSubmit,
  onClose,
  nextOrder,
}) => {
  const { t } = useTranslationWithBackend();
  const [draft, setDraft] = useState<FloatingWidgetActionConfig>(() =>
    initialItem ?? {
      id: generateId(),
      label: '',
      type: 'call',
      icon: DEFAULT_ICON_BY_TYPE.call,
      description: '',
      order: nextOrder,
      isActive: true,
      backgroundColor: '#0ea5e9',
      textColor: '#ffffff',
      tooltip: '',
      href: '',
      metadata: emptyMetadata(),
    }
  );

  useEffect(() => {
    if (!isOpen) return;
    if (initialItem) {
      setDraft({
        ...initialItem,
        metadata: { ...emptyMetadata(), ...(initialItem.metadata || {}) },
      });
    } else {
      setDraft({
        id: generateId(),
        label: '',
        type: 'call',
        icon: DEFAULT_ICON_BY_TYPE.call,
        description: '',
        order: nextOrder,
        isActive: true,
        backgroundColor: '#0ea5e9',
        textColor: '#ffffff',
        tooltip: '',
        href: '',
        metadata: emptyMetadata(),
      });
    }
  }, [initialItem, isOpen, nextOrder]);

  const handleChange = (field: keyof FloatingWidgetActionConfig, value: unknown) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetadataChange = (
    field: keyof NonNullable<FloatingWidgetActionConfig['metadata']>,
    value: string | undefined
  ) => {
    setDraft((prev) => ({
      ...prev,
      metadata: {
        ...emptyMetadata(),
        ...(prev.metadata || {}),
        [field]: value ?? '',
      },
    }));
  };

  const handleTypeChange = (value: FloatingWidgetActionType) => {
    setDraft((prev) => {
      const keepCustomIcon = prev.icon && prev.icon !== DEFAULT_ICON_BY_TYPE[prev.type];
      return {
        ...prev,
        type: value,
        icon: keepCustomIcon ? prev.icon : DEFAULT_ICON_BY_TYPE[value],
        metadata: emptyMetadata(),
      };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.label.trim()) {
      return;
    }

    onSubmit({
      ...draft,
      metadata: { ...emptyMetadata(), ...(draft.metadata || {}) },
    });
  };

  const renderTypeSpecificFields = () => {
    switch (draft.type) {
      case 'call':
        return (
          <PhoneInputField
            id="floating-icon-phone"
            label={t('floating_icons.form.phone_number', 'Phone number')}
            placeholder={t('floating_icons.form.phone_placeholder', 'Enter phone number (e.g. 0987654321)')}
            value={draft.metadata?.phoneNumber}
            onChange={(value) => handleMetadataChange('phoneNumber', value)}
          />
        );
      case 'email':
        return (
          <Input
            id="floating-icon-email"
            type="email"
            inputSize="md"
            placeholder={t('floating_icons.form.email_placeholder', 'Enter email address')}
            value={draft.metadata?.email || ''}
            onChange={(e) => handleMetadataChange('email', e.target.value)}
          />
        );
      case 'messenger':
        return (
          <Input
            id="floating-icon-messenger"
            inputSize="md"
            placeholder={t('floating_icons.form.messenger_placeholder', 'Messenger URL (https://m.me/your-page)')}
            value={draft.metadata?.messengerLink || ''}
            onChange={(e) => handleMetadataChange('messengerLink', e.target.value)}
          />
        );
      case 'zalo':
        return (
          <Input
            id="floating-icon-zalo"
            inputSize="md"
            placeholder={t('floating_icons.form.zalo_placeholder', 'Zalo phone or link (https://zalo.me/...)')}
            value={draft.metadata?.zaloPhone || ''}
            onChange={(e) => handleMetadataChange('zaloPhone', e.target.value)}
          />
        );
      case 'custom':
        return (
          <Input
            id="floating-icon-custom"
            inputSize="md"
            placeholder={t('floating_icons.form.custom_placeholder', 'External URL or deeplink')}
            value={draft.metadata?.customUrl || ''}
            onChange={(e) => handleMetadataChange('customUrl', e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {mode === 'create'
              ? t('floating_icons.form.create_title', 'Add floating icon')
              : t('floating_icons.form.edit_title', 'Edit floating icon')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('floating_icons.form.subtitle', 'Configure action button that appears on the storefront.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-label">
              {t('floating_icons.form.label', 'Display name')} <span className="text-red-500">*</span>
            </label>
            <Input
              id="floating-icon-label"
              inputSize="md"
              placeholder={t('floating_icons.form.label_placeholder', 'e.g. Call us now')}
              value={draft.label}
              onChange={(e) => handleChange('label', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-type">
              {t('floating_icons.form.type', 'Action type')}
            </label>
            <Select
              id="floating-icon-type"
              value={draft.type}
              options={TYPE_OPTIONS}
              onChange={(value) => handleTypeChange(value as FloatingWidgetActionType)}
              placeholder={t('floating_icons.form.type_placeholder', 'Choose type')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-icon">
              {t('floating_icons.form.icon', 'Icon')}
            </label>
            <Select
              id="floating-icon-icon"
              value={draft.icon || DEFAULT_ICON_BY_TYPE[draft.type]}
              options={ICON_OPTIONS}
              onChange={(value) => handleChange('icon', value)}
              placeholder={t('floating_icons.form.icon_placeholder', 'Choose icon')}
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{t('floating_icons.form.icon_preview', 'Preview')}:</span>
              <UnifiedIcon icon={draft.icon || DEFAULT_ICON_BY_TYPE[draft.type]} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-tooltip">
              {t('floating_icons.form.tooltip', 'Tooltip text')}
            </label>
            <Input
              id="floating-icon-tooltip"
              inputSize="md"
              placeholder={t('floating_icons.form.tooltip_placeholder', 'Optional hover tooltip')}
              value={draft.tooltip || ''}
              onChange={(e) => handleChange('tooltip', e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-description">
              {t('floating_icons.form.description', 'Short description')}
            </label>
            <TextareaInput
              id="floating-icon-description"
              label=""
              rows={3}
              placeholder={t('floating_icons.form.description_placeholder', 'Explain what this action does (optional)')}
              value={draft.description || ''}
              onChange={(event) => handleChange('description', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            {draft.type !== 'call' && (
              <label className="text-sm font-medium text-gray-700">
                {t('floating_icons.form.action_target', 'Action target')}
              </label>
            )}
            {renderTypeSpecificFields()}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-href">
              {t('floating_icons.form.href', 'Override URL (optional)')}
            </label>
            <Input
              id="floating-icon-href"
              inputSize="md"
              placeholder={t('floating_icons.form.href_placeholder', 'Leave empty to auto-generate')}
              value={draft.href || ''}
              onChange={(e) => handleChange('href', e.target.value)}
            />
          </div>

          <ColorSelector
            label={t('floating_icons.form.background', 'Background color')}
            placeholder="#0ea5e9"
            value={draft.backgroundColor}
            onChange={(color) => handleChange('backgroundColor', color ?? '')}
          />

          <ColorSelector
            label={t('floating_icons.form.text_color', 'Icon color')}
            placeholder="#ffffff"
            value={draft.textColor}
            onChange={(color) => handleChange('textColor', color ?? '')}
          />

          <div className="flex items-center gap-3 pt-2">
            <Toggle
              checked={draft.isActive}
              onChange={() => handleChange('isActive', !draft.isActive)}
            />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-gray-700">
                {t('floating_icons.form.active', 'Show on storefront')}
              </p>
              <p className="text-xs text-gray-500">
                {t('floating_icons.form.active_hint', 'Disable to hide without deleting the icon.')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {mode === 'create'
              ? t('floating_icons.form.submit_create', 'Add icon')
              : t('floating_icons.form.submit_edit', 'Save changes')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const FloatingIconsSettingsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [items, setItems] = useState<FloatingWidgetActionConfigList>([]);
  const [savedSnapshot, setSavedSnapshot] = useState<FloatingWidgetActionConfigList>([]);
  const [editingItem, setEditingItem] = useState<FloatingWidgetActionConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentSettingId, setCurrentSettingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  const {
    data: settingResponse,
    isLoading,
    error,
    refetch,
  } = trpc.adminSettings.getByKey.useQuery(
    { key: FLOATING_ICONS_SETTING_KEY },
    {
      retry: false,
    }
  );

  const createSettingMutation = trpc.adminSettings.create.useMutation();
  const updateSettingMutation = trpc.adminSettings.update.useMutation();

  const errorCode = error?.data?.code;
  const errorStatus = (error?.data as { status?: string } | undefined)?.status;

  useEffect(() => {
    const response = settingResponse as ApiSettingResponse | undefined;
    if (!response?.data) {
      const isNotFoundError =
        errorStatus === 'NOT_FOUND' ||
        errorCode === 'NOT_FOUND' ||
        Number(errorCode) === 404;

      if (isNotFoundError) {
        setCurrentSettingId(null);
        setItems([]);
        setSavedSnapshot([]);
        setInitialLoadError(null);
      } else if (error) {
        setInitialLoadError(error.message);
      }
      return;
    }

    const setting = response.data;
    setCurrentSettingId(setting.id || null);

    if (setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        const validated = floatingWidgetActionListSchema.safeParse(parsed);
        if (validated.success) {
          const normalized = normalizeItems(validated.data);
          setItems(normalized);
          setSavedSnapshot(normalized);
          setInitialLoadError(null);
        } else {
          setItems([]);
          setSavedSnapshot([]);
          setInitialLoadError(t('floating_icons.errors.invalid_schema', 'Invalid floating icon data structure.'));
        }
      } catch (parseError) {
        console.error('Failed to parse floating icons setting', parseError);
        setItems([]);
        setSavedSnapshot([]);
        setInitialLoadError(t('floating_icons.errors.invalid_json', 'Cannot read floating icon configuration.'));
      }
    } else {
      setItems([]);
      setSavedSnapshot([]);
      setInitialLoadError(null);
    }
  }, [errorCode, errorStatus, error?.message, settingResponse, t]);

  const normalizedItems = useMemo(() => normalizeItems(items), [items]);
  const normalizedSnapshot = useMemo(() => normalizeItems(savedSnapshot), [savedSnapshot]);

  const isDirty = useMemo(() => {
    return JSON.stringify(normalizedItems) !== JSON.stringify(normalizedSnapshot);
  }, [normalizedItems, normalizedSnapshot]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: FloatingWidgetActionConfig) => {
    setModalMode('edit');
    setEditingItem({ ...item, metadata: { ...emptyMetadata(), ...(item.metadata || {}) } });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUpsertItem = (item: FloatingWidgetActionConfig) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.id === item.id);
      if (existingIndex === -1) {
        return normalizeItems([...prev, { ...item, order: prev.length }]);
      }

      const next = [...prev];
      next[existingIndex] = { ...item, order: next[existingIndex].order };
      return normalizeItems(next);
    });

    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setItems((prev) =>
      normalizeItems(
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !item.isActive } : item
        )
      )
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm(t('floating_icons.actions.confirm_delete', 'Are you sure you want to delete this icon?'))) {
      return;
    }

    setItems((prev) => normalizeItems(prev.filter((item) => item.id !== id)));
  };

  const moveItem = useCallback((id: string, direction: 'up' | 'down') => {
    setItems((prev) => {
      const sorted = normalizeItems(prev);
      const index = sorted.findIndex((item) => item.id === id);
      if (index === -1) {
        return prev;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) {
        return prev;
      }

      const swapped = [...sorted];
      [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
      return normalizeItems(swapped);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = JSON.stringify(normalizedItems);

    try {
      if (currentSettingId) {
        await updateSettingMutation.mutateAsync({
          id: currentSettingId,
          value: payload,
          type: 'json',
          description: 'Storefront floating quick actions',
        });
      } else {
        const response = (await createSettingMutation.mutateAsync({
          key: FLOATING_ICONS_SETTING_KEY,
          value: payload,
          type: 'json',
          isPublic: true,
          group: FLOATING_ICONS_GROUP,
          description: 'Storefront floating quick actions',
        })) as ApiSettingResponse;
        if (response?.data?.id) {
          setCurrentSettingId(response.data.id);
        }
      }

      setSavedSnapshot(normalizedItems);
      await refetch();

      addToast({
        type: 'success',
        title: t('floating_icons.toast.save_success_title', 'Configuration saved'),
        description: t('floating_icons.toast.save_success_desc', 'Floating icons will update on the storefront shortly.'),
      });
    } catch (saveError: any) {
      console.error('Failed to save floating icons', saveError);
      addToast({
        type: 'error',
        title: t('floating_icons.toast.save_error_title', 'Unable to save'),
        description: saveError?.message || t('floating_icons.toast.save_error_desc', 'Please try again in a moment.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setItems(normalizedSnapshot);
  };

  const breadcrumbItems = [
    { label: t('navigation.home', 'Home'), href: '/' },
    { label: t('navigation.settings', 'Settings'), href: '/settings' },
    { label: t('floating_icons.title', 'Floating icons'), href: '/settings/floating-icons' },
  ];

  return (
    <BaseLayout
      title={t('floating_icons.title', 'Floating icons')}
      description={t('floating_icons.subtitle', 'Manage floating quick actions on the storefront')}
      breadcrumbs={breadcrumbItems}
    >
      {isLoading && (
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            {t('floating_icons.state.loading', 'Loading configuration...')}
          </p>
        </div>
      )}

      {initialLoadError && !isLoading && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {initialLoadError}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" onClick={openCreateModal} startIcon={<FiPlus />}>
          {t('floating_icons.actions.add', 'Add icon')}
        </Button>
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={!isDirty}
          startIcon={<FiRefreshCw />}
        >
          {t('floating_icons.actions.reset', 'Reset')}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          startIcon={<FiSave />}
          isLoading={isSaving}
        >
          {isSaving
            ? t('floating_icons.actions.saving', 'Saving...')
            : t('floating_icons.actions.save', 'Save changes')}
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {normalizedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <p className="text-base font-medium text-gray-700">
              {t('floating_icons.empty.title', 'No floating icons yet')}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t('floating_icons.empty.subtitle', 'Create quick actions like call, email, Zalo to help customers reach you faster.')}
            </p>
            <Button
              className="mt-4 mx-auto"
              variant="primary"
              onClick={openCreateModal}
              startIcon={<FiPlus />}
            >
              {t('floating_icons.actions.add_first', 'Create your first icon')}
            </Button>
          </div>
        ) : (
          normalizedItems.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                  style={{
                    backgroundColor: item.backgroundColor || '#0ea5e9',
                    color: item.textColor || '#ffffff',
                  }}
                >
                  <UnifiedIcon icon={item.icon || DEFAULT_ICON_BY_TYPE[item.type]} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{item.label}</h3>
                    {!item.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        {t('floating_icons.labels.hidden', 'Hidden')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {t(`floating_icons.type.${item.type}`, item.type.replace(/_/g, ' '))}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  )}
                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    {item.tooltip && (
                      <p>
                        <strong>{t('floating_icons.labels.tooltip', 'Tooltip')}:</strong> {item.tooltip}
                      </p>
                    )}
                    {item.href && (
                      <p>
                        <strong>{t('floating_icons.labels.href', 'URL')}:</strong> {item.href}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 md:items-end md:text-right">
                <div className="flex items-center gap-2 self-start md:self-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0}
                    startIcon={<FiArrowUp />}
                  >
                    {t('floating_icons.actions.move_up', 'Up')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={index === normalizedItems.length - 1}
                    startIcon={<FiArrowDown />}
                  >
                    {t('floating_icons.actions.move_down', 'Down')}
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Toggle
                    checked={item.isActive}
                    onChange={() => handleToggleActive(item.id)}
                  />
                  <span className="text-sm text-gray-600">
                    {item.isActive
                      ? t('floating_icons.labels.active', 'Visible')
                      : t('floating_icons.labels.inactive', 'Hidden')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    startIcon={<FiEdit2 />}
                  >
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    startIcon={<FiTrash2 />}
                  >
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <FloatingIconFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialItem={editingItem}
        onSubmit={handleUpsertItem}
        onClose={closeModal}
        nextOrder={normalizedItems.length}
      />
    </BaseLayout>
  );
};

export default FloatingIconsSettingsPage;
