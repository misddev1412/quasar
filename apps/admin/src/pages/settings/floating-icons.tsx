import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BaseLayout from '../../components/layout/BaseLayout';
import { Button } from '../../components/common/Button';
import { Toggle } from '../../components/common/Toggle';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PhoneInputField } from '../../components/common/PhoneInputField';
import TextareaInput from '../../components/common/TextareaInput';
import { Modal } from '../../components/common/Modal';
import { ColorSelector } from '../../components/common/ColorSelector';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import {
  FloatingWidgetActionConfig,
  FloatingWidgetActionConfigList,
  FloatingWidgetActionType,
  FloatingWidgetActionEffect,
  floatingWidgetActionListSchema,
  floatingWidgetActionTypeValues,
  floatingWidgetActionEffectValues,
} from '@shared/types/floating-widget.types';
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiZap,
  FiCheckCircle,
} from 'react-icons/fi';
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
const ICON_BOX_SIZE = 54;

const DEFAULT_ICON_BY_TYPE: Record<FloatingWidgetActionType, string> = {
  call: 'phone',
  email: 'mail',
  back_to_top: 'arrow-up',
  zalo: 'zalo',
  messenger: 'chat',
  custom: 'star',
  group_phone: 'phone',
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

const EFFECT_LABELS: Record<FloatingWidgetActionEffect, string> = {
  none: 'No animation',
  pulse: 'Soft pulse',
  ring: 'Call ring',
  bounce: 'Bounce',
};

const emptyMetadata = (): NonNullable<FloatingWidgetActionConfig['metadata']> => ({
  phoneNumber: undefined,
  email: undefined,
  messengerLink: undefined,
  zaloPhone: undefined,
  customUrl: undefined,
  note: undefined,
  groupPhoneList: [],
});

const resolveIconName = (item: FloatingWidgetActionConfig): string => {
  if (item.type === 'zalo' && (!item.icon || item.icon === 'chat')) {
    return 'zalo';
  }
  return item.icon || DEFAULT_ICON_BY_TYPE[item.type];
};

const getMetadataValueByType = (item: FloatingWidgetActionConfig): string | undefined => {
  switch (item.type) {
    case 'call':
      return item.metadata?.phoneNumber;
    case 'email':
      return item.metadata?.email;
    case 'messenger':
      return item.metadata?.messengerLink;
    case 'zalo':
      return item.metadata?.zaloPhone;
    case 'custom':
      return item.metadata?.customUrl;
    case 'group_phone':
      return item.metadata?.groupPhoneList
        ?.map((p) => `${p.label}: ${p.phoneNumber}`)
        .join(', ');
    default:
      return undefined;
  }
};

const normalizeItems = (items: FloatingWidgetActionConfig[]): FloatingWidgetActionConfigList =>
  items
    .map((item) => ({
      ...item,
      icon: resolveIconName(item),
      effect: item.effect || 'none',
      isTransparentBackground: Boolean(item.isTransparentBackground),
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
  onSubmit: (item: FloatingWidgetActionConfig) => void | Promise<void>;
  onClose: () => void;
  nextOrder: number;
}

type SaveOptions = {
  toast?: {
    title: string;
    description?: string;
  } | null;
};

const FloatingIconFormModal: React.FC<FloatingIconFormModalProps> = ({
  isOpen,
  mode,
  initialItem,
  onSubmit,
  onClose,
  nextOrder,
}) => {
  const { t } = useTranslationWithBackend();
  const effectOptions = useMemo(
    () =>
      floatingWidgetActionEffectValues.map((value) => ({
        value,
        label: t(`floating_icons.form.effect_option.${value}`, EFFECT_LABELS[value]),
      })),
    [t]
  );
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
      isTransparentBackground: false,
      effect: 'none',
      tooltip: '',
      href: '',
      hasSlideOutInfo: false,
      slideOutText: '',
      metadata: emptyMetadata(),
    }
  );

  useEffect(() => {
    if (!isOpen) return;
    if (initialItem) {
      setDraft({
        ...initialItem,
        effect: initialItem.effect || 'none',
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
        isTransparentBackground: false,
        effect: 'none',
        tooltip: '',
        href: '',
        hasSlideOutInfo: false,
        slideOutText: '',
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

  const handleAddGroupPhone = () => {
    setDraft((prev) => ({
      ...prev,
      metadata: {
        ...emptyMetadata(),
        ...(prev.metadata || {}),
        groupPhoneList: [
          ...(prev.metadata?.groupPhoneList || []),
          { label: '', phoneNumber: '', icon: 'phone', textColor: '#000000' },
        ],
      },
    }));
  };

  const handleRemoveGroupPhone = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      metadata: {
        ...emptyMetadata(),
        ...(prev.metadata || {}),
        groupPhoneList: (prev.metadata?.groupPhoneList || []).filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const handleGroupPhoneChange = (
    index: number,
    field: 'label' | 'phoneNumber' | 'icon' | 'textColor',
    value: string
  ) => {
    setDraft((prev) => {
      const newList = [...(prev.metadata?.groupPhoneList || [])];
      if (newList[index]) {
        newList[index] = { ...newList[index], [field]: value };
      }
      return {
        ...prev,
        metadata: {
          ...emptyMetadata(),
          ...(prev.metadata || {}),
          groupPhoneList: newList,
        },
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('floating_icons.form.action_target', 'Action target')}
            </label>
            <PhoneInputField
              id="floating-icon-phone"
              label={t('floating_icons.form.phone_number', 'Phone number')}
              placeholder={t('floating_icons.form.phone_placeholder', 'Enter phone number (e.g. 0987654321)')}
              value={draft.metadata?.phoneNumber}
              onChange={(value) => handleMetadataChange('phoneNumber', value)}
            />
          </div>
        );
      case 'email':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('floating_icons.form.action_target', 'Action target')}
            </label>
            <Input
              id="floating-icon-email"
              type="email"
              inputSize="md"
              placeholder={t('floating_icons.form.email_placeholder', 'Enter email address')}
              value={draft.metadata?.email || ''}
              onChange={(e) => handleMetadataChange('email', e.target.value)}
            />
          </div>
        );
      case 'messenger':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('floating_icons.form.action_target', 'Action target')}
            </label>
            <Input
              id="floating-icon-messenger"
              inputSize="md"
              placeholder={t('floating_icons.form.messenger_placeholder', 'Messenger URL (https://m.me/your-page)')}
              value={draft.metadata?.messengerLink || ''}
              onChange={(e) => handleMetadataChange('messengerLink', e.target.value)}
            />
          </div>
        );
      case 'zalo':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('floating_icons.form.action_target', 'Action target')}
            </label>
            <Input
              id="floating-icon-zalo"
              inputSize="md"
              placeholder={t('floating_icons.form.zalo_placeholder', 'Zalo phone or link (https://zalo.me/...)')}
              value={draft.metadata?.zaloPhone || ''}
              onChange={(e) => handleMetadataChange('zaloPhone', e.target.value)}
            />
          </div>
        );
      case 'custom':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('floating_icons.form.action_target', 'Action target')}
            </label>
            <Input
              id="floating-icon-custom"
              inputSize="md"
              placeholder={t('floating_icons.form.custom_placeholder', 'External URL or deeplink')}
              value={draft.metadata?.customUrl || ''}
              onChange={(e) => handleMetadataChange('customUrl', e.target.value)}
            />
          </div>
        );
      case 'group_phone':
        return (
          <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-gray-900">
                  {t('floating_icons.form.phone_list', 'Phone numbers')}
                </label>
                <p className="text-xs text-gray-500">
                  {t('floating_icons.form.phone_list_hint', 'Add multiple numbers for different departments')}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddGroupPhone}
                startIcon={<FiPlus />}
                type="button"
                className="shadow-sm"
              >
                {t('common.add', 'Add')}
              </Button>
            </div>

            <div className="space-y-3">
              {draft.metadata?.groupPhoneList?.map((item, idx) => (
                <div key={idx} className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-sky-100 ring-1 ring-transparent hover:ring-sky-100">
                  <div className="grid gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-xs font-medium text-gray-500">
                        {t('floating_icons.form.label_placeholder', 'Label')}
                      </label>
                      <Input
                        placeholder={t('floating_icons.form.label_placeholder', 'e.g. Sales')}
                        value={item.label}
                        onChange={(e) =>
                          handleGroupPhoneChange(idx, 'label', e.target.value)
                        }
                        inputSize="sm"
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-xs font-medium text-gray-500">
                        {t('floating_icons.form.phone_placeholder', 'Phone')}
                      </label>
                      <Input
                        placeholder="e.g. 0987 654 321"
                        value={item.phoneNumber}
                        onChange={(e) =>
                          handleGroupPhoneChange(idx, 'phoneNumber', e.target.value)
                        }
                        inputSize="sm"
                        className="font-mono bg-gray-50"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end justify-end pb-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        icon={<FiTrash2 className="h-4 w-4" />}
                        onClick={() => handleRemoveGroupPhone(idx)}
                        type="button"
                        title="Remove"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-6 border-t border-gray-50 pt-3">
                    <div className="flex-1 max-w-[140px]">
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        {t('floating_icons.form.icon', 'Icon')}
                      </label>
                      <Select
                        value={item.icon || 'phone'}
                        options={ICON_OPTIONS}
                        onChange={(value) => handleGroupPhoneChange(idx, 'icon', value as string)}
                        size="sm"
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        {t('floating_icons.form.text_color', 'Color')}
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-gray-200 shadow-sm transition-transform active:scale-95">
                          <input
                            type="color"
                            value={item.textColor || '#000000'}
                            onChange={(e) => handleGroupPhoneChange(idx, 'textColor', e.target.value)}
                            className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer border-0 p-0"
                            title={t('floating_icons.form.text_color_picker', 'Pick a color')}
                          />
                        </div>
                        <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                          {item.textColor || '#000000'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!draft.metadata?.groupPhoneList ||
                draft.metadata.groupPhoneList.length === 0) && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-8 text-center">
                    <div className="bg-gray-50 p-3 rounded-full mb-3">
                      <FiZap className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {t('floating_icons.form.no_phones_title', 'No numbers added')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      {t('floating_icons.form.no_phones', 'Add phone numbers that will appear when customers hover over the icon.')}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddGroupPhone}
                      className="mt-3 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                    >
                      {t('common.add_now', 'Add number now')}
                    </Button>
                  </div>
                )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-[85vh]">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create'
                ? t('floating_icons.form.create_title', 'Add Floating Icon')
                : t('floating_icons.form.edit_title', 'Edit Floating Icon')}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('floating_icons.form.subtitle', 'Configure action button that appears on the storefront.')}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Section 1: General Info */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 border-b pb-2 mb-4">
                {t('floating_icons.sections.general', 'General Information')}
              </h3>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-label">
                    {t('floating_icons.form.label', 'Display Name')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="floating-icon-label"
                    inputSize="md"
                    placeholder={t('floating_icons.form.label_placeholder', 'e.g. Call Support')}
                    value={draft.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-type">
                    {t('floating_icons.form.type', 'Action Type')}
                  </label>
                  <Select
                    id="floating-icon-type"
                    value={draft.type}
                    options={TYPE_OPTIONS}
                    onChange={(value) => handleTypeChange(value as FloatingWidgetActionType)}
                    placeholder="Select type"
                  />
                </div>
              </div>

              {/* Rendering Type Specific fields here if distinct enough, otherwise put in configuration */}
              {renderTypeSpecificFields()}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-href">
                  {t('floating_icons.form.href', 'Override URL (Optional)')}
                </label>
                <div className="relative">
                  <Input
                    id="floating-icon-href"
                    inputSize="md"
                    placeholder="https://..."
                    value={draft.href || ''}
                    onChange={(e) => handleChange('href', e.target.value)}
                    className="pl-9"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <span className="text-sm">🔗</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {t('floating_icons.form.href_hint', 'Leave empty to use automatic behavior based on type.')}
                </p>
              </div>
            </section>

            {/* Section 2: Content */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 border-b pb-2 mb-4">
                {t('floating_icons.sections.content', 'Content & Tooltip')}
              </h3>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-tooltip">
                    {t('floating_icons.form.tooltip', 'Tooltip Text')}
                  </label>
                  <Input
                    id="floating-icon-tooltip"
                    inputSize="md"
                    placeholder={t('floating_icons.form.tooltip_placeholder', 'Text shown on hover')}
                    value={draft.tooltip || ''}
                    onChange={(e) => handleChange('tooltip', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-description">
                    {t('floating_icons.form.description', 'Internal Description')}
                  </label>
                  <Input
                    id="floating-icon-description"
                    inputSize="md"
                    placeholder={t('floating_icons.form.description_placeholder', 'For admin reference only')}
                    value={draft.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Appearance */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 border-b pb-2 mb-4">
                {t('floating_icons.sections.appearance', 'Appearance')}
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-icon">
                      {t('floating_icons.form.icon', 'Main Button Icon')}
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Select
                          id="floating-icon-icon"
                          value={draft.icon || DEFAULT_ICON_BY_TYPE[draft.type]}
                          options={ICON_OPTIONS}
                          onChange={(value) => handleChange('icon', value)}
                        />
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-gray-50 text-gray-600 shadow-sm transition-colors" style={{ color: draft.textColor, backgroundColor: draft.isTransparentBackground ? 'transparent' : draft.backgroundColor }}>
                        <UnifiedIcon
                          icon={draft.icon || DEFAULT_ICON_BY_TYPE[draft.type]}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="floating-icon-effect">
                      {t('floating_icons.form.effect', 'Animation Effect')}
                    </label>
                    <Select
                      id="floating-icon-effect"
                      value={draft.effect || 'none'}
                      options={effectOptions}
                      onChange={(value) => handleChange('effect', value as FloatingWidgetActionEffect)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <ColorSelector
                    label={t('floating_icons.form.background', 'Button Background')}
                    placeholder="#0ea5e9"
                    value={draft.backgroundColor}
                    onChange={(color) => handleChange('backgroundColor', color ?? '')}
                  />
                  <ColorSelector
                    label={t('floating_icons.form.text_color', 'Icon Color')}
                    placeholder="#ffffff"
                    value={draft.textColor}
                    onChange={(color) => handleChange('textColor', color ?? '')}
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Advanced Settings */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 border-b pb-2 mb-4">
                {t('floating_icons.sections.settings', 'Display Settings')}
              </h3>

              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-gray-900">
                      {t('floating_icons.form.active', 'Active Status')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('floating_icons.form.active_hint', 'Visible on storefront')}
                    </p>
                  </div>
                  <Toggle
                    checked={draft.isActive}
                    onChange={() => handleChange('isActive', !draft.isActive)}
                  />
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-gray-900">
                      {t('floating_icons.form.transparent_bg', 'Transparent Background')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('floating_icons.form.transparent_bg_hint', 'Remove background color and shadow')}
                    </p>
                  </div>
                  <Toggle
                    checked={Boolean(draft.isTransparentBackground)}
                    onChange={() => handleChange('isTransparentBackground', !draft.isTransparentBackground)}
                  />
                </div>
              </div>

              {/* Slide out settings */}
              <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={Boolean(draft.hasSlideOutInfo)}
                    onChange={() => handleChange('hasSlideOutInfo', !draft.hasSlideOutInfo)}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t('floating_icons.form.slide_out', 'Slide Out Information')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('floating_icons.form.slide_out_desc', 'Show a text bubble next to the icon on hover')}
                    </p>
                  </div>
                </div>

                {draft.hasSlideOutInfo && (
                  <div className="pl-14 pt-2 animate-in fade-in slide-in-from-top-1">
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      {t('floating_icons.form.slide_text', 'Hover Text content')}
                    </label>
                    <Input
                      placeholder={t('floating_icons.form.slide_text_placeholder', 'Default text to show...')}
                      value={draft.slideOutText || ''}
                      onChange={(e) => handleChange('slideOutText', e.target.value)}
                      inputSize="sm"
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant="primary" type="submit" className="min-w-[100px]">
            {mode === 'create'
              ? t('floating_icons.form.submit_create', 'Create Icon')
              : t('floating_icons.form.submit_edit', 'Save Changes')}
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
  const itemsRef = useRef<FloatingWidgetActionConfigList>([]);

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
  const activeCount = useMemo(() => normalizedItems.filter((item) => item.isActive).length, [normalizedItems]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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

  const handleSave = useCallback(
    async (itemsOverride?: FloatingWidgetActionConfigList, options?: SaveOptions) => {
      const itemsToPersist = itemsOverride ?? normalizedItems;
      setIsSaving(true);
      const payload = JSON.stringify(itemsToPersist);

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

        setSavedSnapshot(itemsToPersist);

        const toastContent =
          options?.toast === undefined
            ? {
              title: t('floating_icons.toast.save_success_title', 'Configuration saved'),
              description: t(
                'floating_icons.toast.save_success_desc',
                'Floating icons will update on the storefront shortly.'
              ),
            }
            : options.toast;

        if (toastContent) {
          addToast({
            type: 'success',
            ...toastContent,
          });
        }
      } catch (saveError: any) {
        console.error('Failed to save floating icons', saveError);
        setItems(savedSnapshot);
        addToast({
          type: 'error',
          title: t('floating_icons.toast.save_error_title', 'Unable to save'),
          description:
            saveError?.message || t('floating_icons.toast.save_error_desc', 'Please try again in a moment.'),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [
      addToast,
      createSettingMutation,
      currentSettingId,
      normalizedItems,
      savedSnapshot,
      t,
      updateSettingMutation,
    ]
  );

  const applyChangesAndSave = useCallback(
    async (
      updater: (prev: FloatingWidgetActionConfigList) => FloatingWidgetActionConfigList,
      options?: SaveOptions
    ) => {
      if (isSaving) {
        return;
      }

      const nextItems = normalizeItems(updater(itemsRef.current));
      setItems(nextItems);
      await handleSave(nextItems, options);
    },
    [handleSave, isSaving]
  );

  const handleUpsertItem = useCallback(
    async (item: FloatingWidgetActionConfig) => {
      if (isSaving) {
        return;
      }
      setIsModalOpen(false);
      await applyChangesAndSave(
        (prev) => {
          const existingIndex = prev.findIndex((entry) => entry.id === item.id);
          if (existingIndex === -1) {
            return [...prev, { ...item, order: prev.length }];
          }
          const next = [...prev];
          next[existingIndex] = { ...item, order: next[existingIndex].order };
          return next;
        },
        {
          toast: undefined,
        }
      );
    },
    [applyChangesAndSave, isSaving]
  );

  const handleToggleActive = (id: string) => {
    void applyChangesAndSave(
      (prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !item.isActive } : item
        ),
      { toast: null }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm(t('floating_icons.actions.confirm_delete', 'Are you sure you want to delete this icon?'))) {
      return;
    }

    void applyChangesAndSave(
      (prev) => prev.filter((item) => item.id !== id),
      {
        toast: {
          title: t('floating_icons.toast.delete_success_title', 'Floating icon removed'),
          description: t(
            'floating_icons.toast.delete_success_desc',
            'The shortcut will disappear from your storefront shortly.'
          ),
        },
      }
    );
  };

  const moveItem = useCallback(
    (id: string, direction: 'up' | 'down') => {
      void applyChangesAndSave(
        (prev) => {
          const sorted = [...prev].sort((a, b) => a.order - b.order);
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
          return swapped;
        },
        { toast: null }
      );
    },
    [applyChangesAndSave]
  );

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

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
              <FiZap className="h-4 w-4" />
              {t('floating_icons.hero.pill', 'Quick customer shortcuts')}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('floating_icons.hero.title', 'Delight shoppers with floating icons')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t(
                  'floating_icons.hero.description',
                  'Highlight hotlines, live chat, or scroll helpers so visitors can reach you instantly.'
                )}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-sky-500" />
                {t('floating_icons.hero.tip_customize', 'Mix icons, colors, and tooltips to match your brand voice.')}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-sky-500" />
                {t(
                  'floating_icons.hero.tip_order',
                  'Reorder buttons so the most important actions stay closest to the thumb.'
                )}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-sky-500" />
                {t(
                  'floating_icons.hero.tip_effects',
                  'Use gentle animations to draw attention without distracting shoppers.'
                )}
              </li>
            </ul>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('floating_icons.metrics.total', 'Total icons')}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{normalizedItems.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('floating_icons.metrics.active', 'Active')}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{activeCount}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('floating_icons.metrics.hidden', 'Hidden')}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{Math.max(normalizedItems.length - activeCount, 0)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {t('floating_icons.quick_actions.title', 'Quick actions')}
            </p>
            <p className="text-sm text-gray-500">
              {t(
                'floating_icons.quick_actions.description',
                'Add new shortcuts or refresh data. Every change saves automatically.'
              )}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              onClick={openCreateModal}
              startIcon={<FiPlus />}
              disabled={isSaving}
            >
              {t('floating_icons.actions.add', 'Add icon')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => refetch()}
              startIcon={<FiRefreshCw />}
              disabled={isSaving || isLoading}
            >
              {isLoading
                ? t('floating_icons.actions.refreshing', 'Refreshing...')
                : t('floating_icons.actions.reload', 'Reload data')}
            </Button>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-gray-600">
            <FiCheckCircle className="h-4 w-4 text-emerald-500" />
            {t('floating_icons.quick_actions.auto_save', 'Auto-save enabled')}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {normalizedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-500">
              <FiPlus className="h-6 w-6" />
            </div>
            <p className="mt-4 text-base font-medium text-gray-800">
              {t('floating_icons.empty.title', 'No floating icons yet')}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t(
                'floating_icons.empty.subtitle',
                'Create quick actions like call, email, or Zalo to help customers reach you faster.'
              )}
            </p>
            <Button className="mt-5 mx-auto" variant="primary" onClick={openCreateModal} startIcon={<FiPlus />}>
              {t('floating_icons.actions.add_first', 'Create your first icon')}
            </Button>
          </div>
        ) : (
          normalizedItems.map((item, index) => {
            const effectLabel = t(
              `floating_icons.form.effect_option.${item.effect || 'none'}`,
              EFFECT_LABELS[item.effect || 'none']
            );
            const typeLabel = t(`floating_icons.type.${item.type}`, item.type.replace(/_/g, ' '));
            const actionTargetValue = getMetadataValueByType(item);
            const hrefDisplay =
              item.href ||
              t('floating_icons.labels.auto_generate', 'Auto generated');
            const actionTargetDisplay =
              actionTargetValue || hrefDisplay || t('floating_icons.labels.not_set', 'Not configured');

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 shadow-sm"
                      style={{
                        backgroundColor: item.isTransparentBackground ? 'transparent' : item.backgroundColor || '#0ea5e9',
                        borderColor: item.isTransparentBackground ? 'rgba(15,23,42,0.1)' : 'transparent',
                        boxShadow: item.isTransparentBackground ? undefined : '0 10px 25px rgba(14,165,233,0.25)',
                      }}
                    >
                      <UnifiedIcon
                        icon={item.icon || DEFAULT_ICON_BY_TYPE[item.type]}
                        variant={item.isTransparentBackground ? 'floating' : 'nav'}
                        size={item.isTransparentBackground ? ICON_BOX_SIZE : 24}
                        className={item.isTransparentBackground ? '' : 'h-6 w-6'}
                        style={
                          item.isTransparentBackground
                            ? { color: item.textColor || '#0ea5e9', width: ICON_BOX_SIZE, height: ICON_BOX_SIZE }
                            : { color: item.textColor || '#ffffff' }
                        }
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                        <Badge variant={item.isActive ? 'success' : 'secondary'} size="sm">
                          {item.isActive
                            ? t('floating_icons.labels.active', 'Visible')
                            : t('floating_icons.labels.inactive', 'Hidden')}
                        </Badge>
                        {item.isTransparentBackground && (
                          <Badge variant="secondary" size="sm">
                            {t('floating_icons.labels.transparent', 'No background')}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                        <span>{typeLabel}</span>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="info" size="sm">
                          {t('floating_icons.labels.effect', 'Animation')}: {effectLabel}
                        </Badge>
                        {item.tooltip && (
                          <Badge variant="secondary" size="sm">
                            {t('floating_icons.labels.tooltip', 'Tooltip')}: {item.tooltip}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-slate-50">
                        <Toggle
                          checked={item.isActive}
                          onChange={() => handleToggleActive(item.id)}
                          disabled={isSaving}
                        />
                        <span className="text-sm text-gray-600">
                          {item.isActive
                            ? t('floating_icons.labels.active', 'Visible')
                            : t('floating_icons.labels.inactive', 'Hidden')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(item.id, 'up')}
                      disabled={index === 0 || isSaving}
                      startIcon={<FiArrowUp />}
                    >
                      {t('floating_icons.actions.move_up', 'Up')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(item.id, 'down')}
                      disabled={index === normalizedItems.length - 1 || isSaving}
                      startIcon={<FiArrowDown />}
                    >
                      {t('floating_icons.actions.move_down', 'Down')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(item)}
                      startIcon={<FiEdit2 />}
                      disabled={isSaving}
                    >
                      {t('common.edit', 'Edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      startIcon={<FiTrash2 />}
                      disabled={isSaving}
                    >
                      {t('common.delete', 'Delete')}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 text-sm text-gray-600 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {t('floating_icons.labels.action_target', 'Action target')}
                    </p>
                    <p className="mt-1 break-words text-gray-900">{actionTargetDisplay}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {t('floating_icons.labels.href', 'URL')}
                    </p>
                    <p className="mt-1 break-words text-gray-900">{hrefDisplay}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {t('floating_icons.labels.effect', 'Animation')}
                    </p>
                    <p className="mt-1 text-gray-900">{effectLabel}</p>
                  </div>
                </div>
              </div>
            );
          })
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
