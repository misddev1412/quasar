import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon } from 'lucide-react';
import { FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { useSectionsManager, AdminSection, ActiveLanguage } from '../../hooks/useSectionsManager';
import { SectionType, SECTION_TYPE_LABELS } from '@shared/enums/section.enums';
import { Button } from '../common/Button';
import { Select, SelectOption } from '../common/Select';
import { Toggle } from '../common/Toggle';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { useToast } from '../../context/ToastContext';
import { cn } from '@admin/lib/utils';
import { MediaManager } from '../common/MediaManager';
import { Dropdown } from '../common/Dropdown';
import { ReorderableTable, DragHandle, type ReorderableColumn } from '../common/ReorderableTable';
import SelectComponent, { components as selectComponents, type MenuListProps, type FilterOptionOption } from 'react-select';
import { trpc } from '../../utils/trpc';
import '../common/CountrySelector.css';
import { SearchSelect } from '../common/SearchSelect';
import { RichTextEditor } from '../common/RichTextEditor';

interface SectionsManagerProps {
  page: string;
  onPageChange: (page: string) => void;
}

interface SectionTranslationForm {
  title?: string;
  subtitle?: string;
  description?: string;
  heroDescription?: string;
  configOverride?: string;
}

interface HeroSlideConfig {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  [key: string]: unknown;
}

interface HeroSliderLocaleEditorProps {
  locale: string;
  config: Record<string, unknown>;
  onConfigChange: (nextConfig: Record<string, unknown>) => void;
  hasParseError?: boolean;
}

interface ProductOption {
  value: string;
  label: string;
  sku?: string | null;
  image?: string | null;
  priceLabel?: string | null;
  brandName?: string | null;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const TextArea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500',
      className
    )}
    {...props}
  />
);

interface SectionFormState {
  page: string;
  type: SectionType;
  isEnabled: boolean;
  position?: number;
  config: Record<string, unknown>;
  translations: Record<string, SectionTranslationForm>;
}

const PAGE_OPTIONS: SelectOption[] = [
  { value: 'home', label: 'Home' },
  { value: 'news', label: 'News' },
  { value: 'product', label: 'Product' },
];

const SECTION_TYPE_OPTIONS: SelectOption[] = (Object.entries(SECTION_TYPE_LABELS) as Array<[SectionType, string]>).map(([value, label]) => ({
  value,
  label,
}));

type ConfigChangeHandler = (value: Record<string, unknown>) => void;

type SectionConfigEditorProps = {
  type: SectionType;
  value: Record<string, unknown>;
  onChange: ConfigChangeHandler;
};

const ensureNumber = (value: unknown, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const SectionConfigEditor: React.FC<SectionConfigEditorProps> = ({ type, value, onChange }) => {
  const { t } = useTranslation();
  const [jsonView, setJsonView] = useState(false);
  const [rawJson, setRawJson] = useState(JSON.stringify(value ?? {}, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setRawJson(JSON.stringify(value ?? {}, null, 2));
  }, [value]);

  const handleJsonApply = () => {
    try {
      const parsed = JSON.parse(rawJson || '{}');
      onChange(parsed);
      setJsonError(null);
    } catch (error: any) {
      setJsonError(error.message || 'Invalid JSON');
    }
  };

  if (jsonView) {
    return (
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-gray-700">
          {t('sections.manager.configEditor.rawJson')}
          <Button variant="ghost" size="sm" onClick={() => setJsonView(false)}>{t('sections.manager.configEditor.useFormEditor')}</Button>
        </label>
        <TextArea
          rows={10}
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          className="font-mono text-xs"
        />
        {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
        <Button variant="secondary" size="sm" onClick={handleJsonApply}>{t('sections.manager.configEditor.applyJson')}</Button>
      </div>
    );
  }

  const handleValueChange = (path: string, newValue: unknown) => {
    const segments = path.split('.');
    const next = { ...(value ?? {}) } as Record<string, unknown>;
    let current: Record<string, unknown> = next;
    while (segments.length > 1) {
      const key = segments.shift() as string;
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    current[segments[0]] = newValue as never;
    onChange(next);
  };

  const renderHeroSlider = () => {
    const handleOverlayToggle = (checked: boolean) => {
      const existingOverlay = ((value?.overlay as Record<string, unknown>) || {}) as Record<string, unknown>;
      const existingOpacity = typeof existingOverlay.opacity === 'number'
        ? existingOverlay.opacity
        : typeof existingOverlay.opacityPercent === 'number'
          ? existingOverlay.opacityPercent
          : 60;
      const nextOverlay = checked
        ? {
            ...existingOverlay,
            enabled: true,
            color: (existingOverlay.color as string) || '#00000080',
            opacity: existingOpacity,
            opacityPercent: existingOpacity,
          }
        : {
            ...existingOverlay,
            enabled: false,
          };

      onChange({
        ...(value ?? {}),
        overlay: nextOverlay,
      });
    };

    const handleOverlayColorChange = (colorValue: string) => {
      const existingOverlay = ((value?.overlay as Record<string, unknown>) || {}) as Record<string, unknown>;
      onChange({
        ...(value ?? {}),
        overlay: {
          ...existingOverlay,
          color: colorValue,
        },
      });
    };

    const handleOverlayOpacityChange = (nextValue: number) => {
      const clamped = Math.max(0, Math.min(100, Number.isFinite(nextValue) ? nextValue : 0));
      const existingOverlay = ((value?.overlay as Record<string, unknown>) || {}) as Record<string, unknown>;
      onChange({
        ...(value ?? {}),
        overlay: {
          ...existingOverlay,
          opacity: clamped,
          opacityPercent: clamped,
        },
      });
    };

    const overlayConfig = (value?.overlay as { enabled?: boolean; color?: string; opacity?: number; opacityPercent?: number }) || {};
    const overlayEnabled = Boolean(overlayConfig.enabled);
    const overlayColor = typeof overlayConfig.color === 'string' && overlayConfig.color.trim() !== ''
      ? overlayConfig.color
      : '#00000080';
    const overlayOpacity = typeof (overlayConfig as { opacity?: number; opacityPercent?: number }).opacity === 'number'
      ? (overlayConfig as { opacity?: number; opacityPercent?: number }).opacity
      : typeof (overlayConfig as { opacity?: number; opacityPercent?: number }).opacityPercent === 'number'
        ? (overlayConfig as { opacity?: number; opacityPercent?: number }).opacityPercent
        : 60;
    const overlayColorPickerValue = /^#([0-9a-fA-F]{6})$/.test(overlayColor)
      ? overlayColor
      : overlayColor.startsWith('#') && overlayColor.length >= 7
        ? overlayColor.slice(0, 7)
        : '#000000';

    return (
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          Slides are configured per language in the translation panel. Use this section to manage shared behaviour like autoplay and overlays.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Autoplay interval (ms)
            <Input
              type="number"
              min={1000}
              value={ensureNumber(value?.interval, 5000)}
              onChange={(e) => handleValueChange('interval', Number(e.target.value))}
              className="text-sm"
              inputSize="md"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={Boolean(value?.autoplay ?? true)}
              onChange={(e) => handleValueChange('autoplay', e.target.checked)}
            />
            Autoplay enabled
          </label>
        </div>
        <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={overlayEnabled}
              onChange={(e) => handleOverlayToggle(e.target.checked)}
            />
            Enable overlay
          </label>
          {overlayEnabled && (
            <div className="space-y-2">
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Overlay color
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <Input
                    type="color"
                    value={overlayColorPickerValue}
                    onChange={(e) => handleOverlayColorChange(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={overlayColor}
                    onChange={(e) => handleOverlayColorChange(e.target.value)}
                    placeholder="#00000080 or rgba(0,0,0,0.6)"
                    className="text-sm"
                    inputSize="md"
                  />
                </div>
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Overlay opacity (%)
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={overlayOpacity}
                    onChange={(e) => handleOverlayOpacityChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={overlayOpacity}
                    onChange={(e) => handleOverlayOpacityChange(Number(e.target.value))}
                    className="w-20 text-sm"
                  />
                </div>
                <span className="text-xs text-gray-500">0% removes the overlay, 100% makes it fully solid.</span>
              </label>
              <p className="text-xs text-gray-500">Supports hex or rgba values. Use transparency for softer overlays.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProductsByCategory = () => (
    <ProductsByCategoryConfigEditor value={value || {}} onChange={onChange} />
  );

  const renderNews = () => (
    <NewsByCategoryConfigEditor value={value || {}} onChange={onChange} />
  );

const renderCustomHtml = () => (
  <div className="space-y-2">
    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
      Custom HTML
      <Button variant="ghost" size="sm" onClick={() => setJsonView(true)}>Edit as JSON</Button>
      </label>
      <RichTextEditor
        value={(value?.html as string) || ''}
        onChange={(newValue) => handleValueChange('html', newValue)}
        placeholder="Enter your custom HTML content here..."
        minHeight="400px"
      />
    </div>
  );

  const renderBanner = () => {
    const handleLayoutChange = (layout: 'full-width' | 'container') => {
      onChange({
        ...(value ?? {}),
        layout,
      });
    };

    const handleHeightChange = (height: string) => {
      onChange({
        ...(value ?? {}),
        height,
      });
    };

    const currentLayout = (value?.layout as string) || 'full-width';
    const currentHeight = (value?.height as string) || '400px';

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.banner.layoutType')}
            <Select
              value={currentLayout}
              onChange={(layout) => handleLayoutChange(layout as 'full-width' | 'container')}
              options={[
                { value: 'full-width', label: t('sections.manager.config.banner.fullWidth') },
                { value: 'container', label: t('sections.manager.config.banner.container') },
              ]}
              className="text-sm"
            />
            <span className="text-xs text-gray-500">
              {currentLayout === 'full-width'
                ? t('sections.manager.config.banner.fullWidthDescription')
                : t('sections.manager.config.banner.containerDescription')}
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.banner.bannerHeight')}
            <Input
              type="text"
              value={currentHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              placeholder={t('sections.manager.config.banner.heightPlaceholder')}
              className="text-sm"
              inputSize="md"
            />
            <span className="text-xs text-gray-500">{t('sections.manager.config.banner.heightDescription')}</span>
          </label>
        </div>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.banner.contentDescription')}
        </p>
      </div>
    );
  };

  const renderTestimonials = () => {
    const handleLayoutChange = (layout: 'grid' | 'slider') => {
      onChange({
        ...(value ?? {}),
        layout,
      });
    };

    const handleColumnsChange = (columns: number) => {
      onChange({
        ...(value ?? {}),
        columns,
      });
    };

    const currentLayout = (value?.layout as string) || 'grid';
    const currentColumns = ensureNumber(value?.columns, 3);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.testimonials.layoutStyle')}
            <Select
              value={currentLayout}
              onChange={(layout) => handleLayoutChange(layout as 'grid' | 'slider')}
              options={[
                { value: 'grid', label: t('sections.manager.config.testimonials.gridLayout') },
                { value: 'slider', label: t('sections.manager.config.testimonials.sliderLayout') },
              ]}
              className="text-sm"
            />
            <span className="text-xs text-gray-500">
              {currentLayout === 'grid'
                ? t('sections.manager.config.testimonials.gridDescription')
                : t('sections.manager.config.testimonials.sliderDescription')}
            </span>
          </label>

          {currentLayout === 'grid' && (
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('sections.manager.config.testimonials.numberOfColumns')}
              <Input
                type="number"
                min={1}
                max={4}
                value={currentColumns}
                onChange={(e) => handleColumnsChange(Number(e.target.value))}
                className="text-sm"
                inputSize="md"
              />
              <span className="text-xs text-gray-500">{t('sections.manager.config.testimonials.columnsDescription')}</span>
            </label>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.testimonials.contentDescription')}
        </p>
      </div>
    );
  };

  const renderCta = () => {
    const handleStyleChange = (style: 'center' | 'left' | 'right') => {
      onChange({
        ...(value ?? {}),
        style,
      });
    };

    const handleBackgroundChange = (background: 'primary' | 'secondary' | 'dark' | 'gradient') => {
      onChange({
        ...(value ?? {}),
        background,
      });
    };

    const currentStyle = (value?.style as string) || 'center';
    const currentBackground = (value?.background as string) || 'primary';

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.cta.textAlign')}
            <Select
              value={currentStyle}
              onChange={(style) => handleStyleChange(style as 'center' | 'left' | 'right')}
              options={[
                { value: 'center', label: t('sections.manager.config.cta.centerAligned') },
                { value: 'left', label: t('sections.manager.config.cta.leftAligned') },
                { value: 'right', label: t('sections.manager.config.cta.rightAligned') },
              ]}
              className="text-sm"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.cta.backgroundStyle')}
            <Select
              value={currentBackground}
              onChange={(background) => handleBackgroundChange(background as 'primary' | 'secondary' | 'dark' | 'gradient')}
              options={[
                { value: 'primary', label: t('sections.manager.config.cta.primaryColor') },
                { value: 'secondary', label: t('sections.manager.config.cta.secondaryColor') },
                { value: 'dark', label: t('sections.manager.config.cta.darkBackground') },
                { value: 'gradient', label: t('sections.manager.config.cta.gradientBackground') },
              ]}
              className="text-sm"
            />
          </label>
        </div>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.cta.contentDescription')}
        </p>
      </div>
    );
  };

  const renderFeatures = () => {
    const handleLayoutChange = (layout: 'grid' | 'list' | 'tabs') => {
      onChange({
        ...(value ?? {}),
        layout,
      });
    };

    const handleColumnsChange = (columns: number) => {
      onChange({
        ...(value ?? {}),
        columns,
      });
    };

    const currentLayout = (value?.layout as string) || 'grid';
    const currentColumns = ensureNumber(value?.columns, 3);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.features.layoutStyle')}
            <Select
              value={currentLayout}
              onChange={(layout) => handleLayoutChange(layout as 'grid' | 'list' | 'tabs')}
              options={[
                { value: 'grid', label: t('sections.manager.config.features.gridLayout') },
                { value: 'list', label: t('sections.manager.config.features.listLayout') },
                { value: 'tabs', label: t('sections.manager.config.features.tabbedLayout') },
              ]}
              className="text-sm"
            />
          </label>

          {currentLayout === 'grid' && (
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('sections.manager.config.features.numberOfColumns')}
              <Input
                type="number"
                min={1}
                max={4}
                value={currentColumns}
                onChange={(e) => handleColumnsChange(Number(e.target.value))}
                className="text-sm"
                inputSize="md"
              />
              <span className="text-xs text-gray-500">{t('sections.manager.config.features.columnsDescription')}</span>
            </label>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.features.contentDescription')}
        </p>
      </div>
    );
  };

  const renderGallery = () => {
    const handleLayoutChange = (layout: 'grid' | 'masonry' | 'slider') => {
      onChange({
        ...(value ?? {}),
        layout,
      });
    };

    const handleColumnsChange = (columns: number) => {
      onChange({
        ...(value ?? {}),
        columns,
      });
    };

    const currentLayout = (value?.layout as string) || 'grid';
    const currentColumns = ensureNumber(value?.columns, 3);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.gallery.galleryLayout')}
            <Select
              value={currentLayout}
              onChange={(layout) => handleLayoutChange(layout as 'grid' | 'masonry' | 'slider')}
              options={[
                { value: 'grid', label: t('sections.manager.config.gallery.gridLayout') },
                { value: 'masonry', label: t('sections.manager.config.gallery.masonryLayout') },
                { value: 'slider', label: t('sections.manager.config.gallery.sliderLayout') },
              ]}
              className="text-sm"
            />
          </label>

          {(currentLayout === 'grid' || currentLayout === 'masonry') && (
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('sections.manager.config.gallery.numberOfColumns')}
              <Input
                type="number"
                min={1}
                max={6}
                value={currentColumns}
                onChange={(e) => handleColumnsChange(Number(e.target.value))}
                className="text-sm"
                inputSize="md"
              />
              <span className="text-xs text-gray-500">{t('sections.manager.config.gallery.columnsDescription')}</span>
            </label>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.gallery.contentDescription')}
        </p>
      </div>
    );
  };

  const renderTeam = () => {
    const handleLayoutChange = (layout: 'grid' | 'slider') => {
      onChange({
        ...(value ?? {}),
        layout,
      });
    };

    const handleColumnsChange = (columns: number) => {
      onChange({
        ...(value ?? {}),
        columns,
      });
    };

    const currentLayout = (value?.layout as string) || 'grid';
    const currentColumns = ensureNumber(value?.columns, 4);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.team.layoutStyle')}
            <Select
              value={currentLayout}
              onChange={(layout) => handleLayoutChange(layout as 'grid' | 'slider')}
              options={[
                { value: 'grid', label: t('sections.manager.config.team.gridLayout') },
                { value: 'slider', label: t('sections.manager.config.team.sliderLayout') },
              ]}
              className="text-sm"
            />
          </label>

          {currentLayout === 'grid' && (
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('sections.manager.config.team.numberOfColumns')}
              <Input
                type="number"
                min={1}
                max={6}
                value={currentColumns}
                onChange={(e) => handleColumnsChange(Number(e.target.value))}
                className="text-sm"
                inputSize="md"
              />
              <span className="text-xs text-gray-500">{t('sections.manager.config.team.columnsDescription')}</span>
            </label>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.team.contentDescription')}
        </p>
      </div>
    );
  };

  const renderContactForm = () => {
    const handleFieldsChange = (fields: string[]) => {
      onChange({
        ...(value ?? {}),
        fields,
      });
    };

    const currentFields = (value?.fields as string[]) || ['name', 'email', 'message'];

    const availableFields = [
      { value: 'name', label: t('sections.manager.config.contactForm.name') },
      { value: 'email', label: t('sections.manager.config.contactForm.email') },
      { value: 'phone', label: t('sections.manager.config.contactForm.phone') },
      { value: 'subject', label: t('sections.manager.config.contactForm.subject') },
      { value: 'message', label: t('sections.manager.config.contactForm.message') },
      { value: 'company', label: t('sections.manager.config.contactForm.company') },
    ];

    return (
      <div className="space-y-4">
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          {t('sections.manager.config.contactForm.formFields')}
          <div className="space-y-2">
            {availableFields.map((field) => (
              <label key={field.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={currentFields.includes(field.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFieldsChange([...currentFields, field.value]);
                    } else {
                      handleFieldsChange(currentFields.filter(f => f !== field.value));
                    }
                  }}
                />
                {field.label}
              </label>
            ))}
          </div>
          <span className="text-xs text-gray-500">{t('sections.manager.config.contactForm.fieldsDescription')}</span>
        </label>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.contactForm.contentDescription')}
        </p>
      </div>
    );
  };

  const renderVideo = () => {
    const handleTypeChange = (type: 'embed' | 'upload') => {
      onChange({
        ...(value ?? {}),
        type,
      });
    };

    const handleAutoplayChange = (autoplay: boolean) => {
      onChange({
        ...(value ?? {}),
        autoplay,
      });
    };

    const currentType = (value?.type as string) || 'embed';
    const currentAutoplay = Boolean(value?.autoplay ?? false);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.video.videoType')}
            <Select
              value={currentType}
              onChange={(type) => handleTypeChange(type as 'embed' | 'upload')}
              options={[
                { value: 'embed', label: t('sections.manager.config.video.embedVideo') },
                { value: 'upload', label: t('sections.manager.config.video.uploadedVideo') },
              ]}
              className="text-sm"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={currentAutoplay}
              onChange={(e) => handleAutoplayChange(e.target.checked)}
            />
            {t('sections.manager.config.video.autoplay')}
            <span className="text-xs text-gray-500">{t('sections.manager.config.video.autoplayDescription')}</span>
          </label>
        </div>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.video.contentDescription')}
        </p>
      </div>
    );
  };

  const renderStats = () => {
    const handleLayoutChange = (layout: 'grid' | 'counter') => {
      onChange({
        ...(value ?? {}),
        layout,
      });
    };

    const handleColumnsChange = (columns: number) => {
      onChange({
        ...(value ?? {}),
        columns,
      });
    };

    const currentLayout = (value?.layout as string) || 'grid';
    const currentColumns = ensureNumber(value?.columns, 4);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.config.stats.layoutStyle')}
            <Select
              value={currentLayout}
              onChange={(layout) => handleLayoutChange(layout as 'grid' | 'counter')}
              options={[
                { value: 'grid', label: t('sections.manager.config.stats.gridLayout') },
                { value: 'counter', label: t('sections.manager.config.stats.animatedCounter') },
              ]}
              className="text-sm"
            />
          </label>

          {currentLayout === 'grid' && (
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('sections.manager.config.stats.numberOfColumns')}
              <Input
                type="number"
                min={1}
                max={6}
                value={currentColumns}
                onChange={(e) => handleColumnsChange(Number(e.target.value))}
                className="text-sm"
                inputSize="md"
              />
              <span className="text-xs text-gray-500">{t('sections.manager.config.stats.columnsDescription')}</span>
            </label>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {t('sections.manager.config.stats.contentDescription')}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">Section configuration</h4>
          <Button variant="ghost" size="sm" onClick={() => setJsonView(true)}>Raw JSON</Button>
        </div>

      {type === SectionType.HERO_SLIDER && renderHeroSlider()}
      {type === SectionType.FEATURED_PRODUCTS && (
        <FeaturedProductsConfigEditor value={value || {}} onChange={onChange} />
      )}
        {type === SectionType.PRODUCTS_BY_CATEGORY && renderProductsByCategory()}
        {type === SectionType.NEWS && renderNews()}
        {type === SectionType.CUSTOM_HTML && renderCustomHtml()}
        {type === SectionType.BANNER && renderBanner()}
        {type === SectionType.TESTIMONIALS && renderTestimonials()}
        {type === SectionType.CTA && renderCta()}
        {type === SectionType.FEATURES && renderFeatures()}
        {type === SectionType.GALLERY && renderGallery()}
        {type === SectionType.TEAM && renderTeam()}
        {type === SectionType.CONTACT_FORM && renderContactForm()}
        {type === SectionType.VIDEO && renderVideo()}
        {type === SectionType.STATS && renderStats()}

        {![
          SectionType.HERO_SLIDER,
          SectionType.FEATURED_PRODUCTS,
          SectionType.PRODUCTS_BY_CATEGORY,
          SectionType.NEWS,
          SectionType.CUSTOM_HTML,
          SectionType.BANNER,
          SectionType.TESTIMONIALS,
          SectionType.CTA,
          SectionType.FEATURES,
          SectionType.GALLERY,
          SectionType.TEAM,
          SectionType.CONTACT_FORM,
          SectionType.VIDEO,
          SectionType.STATS,
        ].includes(type) && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">No dedicated editor for this type yet. Switch to raw JSON mode.</p>
            <Button variant="ghost" size="sm" onClick={() => setJsonView(true)}>Open JSON editor</Button>
          </div>
        )}
      </div>

    </>
  );
};

const HeroSliderLocaleEditor: React.FC<HeroSliderLocaleEditorProps> = ({ locale, config, onConfigChange, hasParseError }) => {
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsMediaManagerOpen(false);
    setActiveSlideIndex(null);
  }, [locale]);

  const slides = Array.isArray(config?.slides) ? (config.slides as HeroSlideConfig[]) : [];

  const applySlides = (nextSlides: HeroSlideConfig[]) => {
    const sanitizedConfig: Record<string, unknown> = { ...config };
    if (nextSlides.length > 0) {
      sanitizedConfig.slides = nextSlides;
    } else {
      delete sanitizedConfig.slides;
    }
    onConfigChange(sanitizedConfig);
  };

  const updateSlide = (index: number, field: string, val: unknown) => {
    const nextSlides = slides.map((slide, idx) => (idx === index ? { ...slide, [field]: val } : slide));
    applySlides(nextSlides);
  };

  const addSlide = () => {
    applySlides([
      ...slides,
      {
        id: `slide-${Date.now()}`,
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        ctaLabel: '',
        ctaUrl: '',
      },
    ]);
  };

  const removeSlide = (index: number) => {
    applySlides(slides.filter((_, idx) => idx !== index));
  };

  const handleMediaClose = () => {
    setIsMediaManagerOpen(false);
    setActiveSlideIndex(null);
  };

  const handleOpenMediaManager = (index: number) => {
    setActiveSlideIndex(index);
    setIsMediaManagerOpen(true);
  };

  const handleMediaSelect = (selection: any) => {
    if (activeSlideIndex === null) {
      handleMediaClose();
      return;
    }

    const selected = Array.isArray(selection) ? selection[0] : selection;
    if (!selected || typeof selected.url !== 'string') {
      handleMediaClose();
      return;
    }

    const nextSlides = slides.map((slide, idx) => (idx === activeSlideIndex ? { ...slide, imageUrl: selected.url } : slide));
    applySlides(nextSlides);
    handleMediaClose();
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">Slides for {locale.toUpperCase()}</h4>
          <p className="text-xs text-gray-500">Manage locale-specific campaigns and creatives.</p>
          {hasParseError && (
            <p className="text-xs text-red-500 mt-1">
              Existing override contains invalid JSON. Saving slides will replace it for this locale.
            </p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={addSlide} startIcon={<FiPlus className="w-4 h-4" />}>Add slide</Button>
      </div>

      {slides.length === 0 && (
        <p className="text-xs text-gray-500">No slides configured yet. Add your first slide for this locale.</p>
      )}

      <div className="space-y-3">
        {slides.map((slide, idx) => {
          const slideId = typeof slide.id === 'string' ? slide.id : `hero-slide-${idx}`;
          const imageUrl = typeof slide.imageUrl === 'string' ? slide.imageUrl : '';

          return (
            <div key={slideId} className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Slide #{idx + 1}</p>
                <Button variant="ghost" size="sm" onClick={() => removeSlide(idx)} startIcon={<FiTrash2 className="w-4 h-4" />}>
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Title"
                  value={(slide.title as string) || ''}
                  onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                  className="text-sm"
                  inputSize="md"
                />
                <Input
                  placeholder="Subtitle"
                  value={(slide.subtitle as string) || ''}
                  onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                  className="text-sm"
                  inputSize="md"
                />
                <div className="md:col-span-2">
                  <TextArea
                    rows={3}
                    placeholder="Description"
                    value={(slide.description as string) || ''}
                    onChange={(e) => updateSlide(idx, 'description', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <span className="text-sm font-medium text-gray-600">Slide image</span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center justify-center w-full sm:w-48 h-32 border border-dashed border-gray-300 bg-white rounded-md overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Slide ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-gray-400">
                          <ImageIcon className="w-10 h-10" />
                          <span className="text-xs">No image selected</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenMediaManager(idx)}
                        >
                          {imageUrl ? 'Change image' : 'Select image'}
                        </Button>
                        {imageUrl && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => updateSlide(idx, 'imageUrl', '')}
                            startIcon={<FiTrash2 className="w-4 h-4" />}
                          >
                            Remove image
                          </Button>
                        )}
                      </div>
                      <Input
                        value={imageUrl}
                        placeholder="Image URL will appear after selection"
                        readOnly
                        className="text-sm"
                        inputSize="md"
                      />
                    </div>
                  </div>
                </div>
                <Input
                  placeholder="CTA Label"
                  value={(slide.ctaLabel as string) || ''}
                  onChange={(e) => updateSlide(idx, 'ctaLabel', e.target.value)}
                  className="text-sm"
                  inputSize="md"
                />
                <Input
                  placeholder="CTA URL"
                  value={(slide.ctaUrl as string) || ''}
                  onChange={(e) => updateSlide(idx, 'ctaUrl', e.target.value)}
                  className="text-sm"
                  inputSize="md"
                />
              </div>
            </div>
          );
        })}
      </div>

      <MediaManager
        isOpen={isMediaManagerOpen}
        onClose={handleMediaClose}
        onSelect={handleMediaSelect}
        multiple={false}
        accept="image/*"
        title={`Select slide image (${locale.toUpperCase()})`}
      />
    </div>
  );
};

interface FeaturedProductsConfigEditorProps {
  value: Record<string, unknown>;
  onChange: ConfigChangeHandler;
}

const mapProductToOption = (product: any): ProductOption => {
  let priceLabel: string | null = null;
  if (product?.priceRange) {
    priceLabel = product.priceRange;
  } else if (product?.lowestPrice != null && product?.highestPrice != null && product.lowestPrice !== product.highestPrice) {
    priceLabel = `${currencyFormatter.format(product.lowestPrice)} – ${currencyFormatter.format(product.highestPrice)}`;
  } else if (product?.lowestPrice != null) {
    priceLabel = currencyFormatter.format(product.lowestPrice);
  }

  const primaryImage = product?.primaryImage || product?.imageUrls?.[0] || product?.media?.[0]?.url || null;

  return {
    value: product.id,
    label: product.name || 'Unnamed product',
    sku: product.sku,
    image: primaryImage,
    priceLabel,
    brandName: product?.brand?.name ?? null,
  };
};

const FeaturedProductsConfigEditor: React.FC<FeaturedProductsConfigEditorProps> = ({ value, onChange }) => {
  const selectedIds = Array.isArray(value?.productIds) ? (value.productIds as string[]) : [];
  const [optionsMap, setOptionsMap] = useState<Record<string, ProductOption>>({});
  const [searchOptions, setSearchOptions] = useState<ProductOption[]>([]);
  const [previewOptions, setPreviewOptions] = useState<ProductOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const menuPortalTarget = typeof window !== 'undefined' ? window.document.body : undefined;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setSearchOptions([]);
  }, [debouncedSearch]);

  const productsQuery = trpc.adminProducts.list.useQuery(
    {
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      isActive: true,
    },
  );

  useEffect(() => {
    const payload = (productsQuery.data as any)?.data;
    if (!payload) {
      if (!productsQuery.isFetching && !productsQuery.isLoading) {
        setSearchOptions((prev) => (page === 1 ? [] : prev));
        setHasMore(false);
      }
      return;
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    const mapped = items.map(mapProductToOption);

    setOptionsMap((prev) => {
      const next = { ...prev };
      mapped.forEach((option) => {
        next[option.value] = option;
      });
      return next;
    });

    setSearchOptions((prev) => {
      if (page === 1) {
        return mapped;
      }
      const existing = new Map(prev.map((option) => [option.value, option]));
      mapped.forEach((option) => {
        if (!existing.has(option.value)) {
          existing.set(option.value, option);
        }
      });
      return Array.from(existing.values());
    });

    setHasMore(payload.page < payload.totalPages);
    setPreviewOptions(mapped.slice(0, value?.limit || 4));
  }, [productsQuery.data, page, productsQuery.isFetching, productsQuery.isLoading]);

  useEffect(() => {
    const missing = selectedIds.filter((id) => !optionsMap[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const { trpcClient } = await import('../../utils/trpc');
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const response = await trpcClient.adminProducts.detail.query({ id });
              const product = (response as any)?.data;
              if (!product) return null;
              return mapProductToOption(product);
            } catch (error) {
              console.error('Failed to fetch product detail', error);
              return null;
            }
          })
        );
        if (cancelled) return;
        const filtered = results.filter(Boolean) as ProductOption[];
        if (filtered.length > 0) {
          setOptionsMap((prev) => {
            const next = { ...prev };
            filtered.forEach((option) => {
              next[option.value] = option;
            });
            return next;
          });
        }
      } catch (error) {
        console.error('Failed to load selected products', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedIds.join(',')]);

  const allOptions = useMemo(() => {
    const map = new Map<string, ProductOption>();
    searchOptions.forEach((option) => {
      map.set(option.value, option);
    });
    selectedIds.forEach((id) => {
      const option = optionsMap[id];
      if (option) {
        map.set(id, option);
      }
    });
    return Array.from(map.values());
  }, [searchOptions, selectedIds, optionsMap]);

  const selectedOptions = useMemo(() => {
    return selectedIds.map((id) => optionsMap[id] || { value: id, label: `Product ${id}` });
  }, [optionsMap, selectedIds]);

  const productSelectStyles = useMemo(
    () => ({
      control: (provided: any, state: any) => ({
        ...provided,
        minHeight: '46px',
        borderRadius: '12px',
        borderColor: state.isFocused ? '#4f46e5' : '#e5e7eb',
        boxShadow: state.isFocused
          ? '0 0 0 4px rgba(99, 102, 241, 0.18)'
          : '0 1px 2px rgba(15, 23, 42, 0.05)',
        backgroundColor: state.isDisabled ? '#f3f4f6' : '#ffffff',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        '&:hover': {
          borderColor: '#4f46e5',
        },
      }),
      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
      menu: (base: any) => ({
        ...base,
        zIndex: 9999,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
      }),
      option: (base: any, state: any) => ({
        ...base,
        padding: '10px 14px',
        backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : '#fff',
        color: state.isSelected ? '#fff' : '#1f2937',
      }),
      multiValue: (base: any) => ({
        ...base,
        backgroundColor: '#eef2ff',
        borderRadius: '9999px',
        padding: '2px 6px',
      }),
      multiValueLabel: (base: any) => ({
        ...base,
        color: '#4338ca',
        fontWeight: 500,
      }),
      multiValueRemove: (base: any) => ({
        ...base,
        color: '#4338ca',
        borderRadius: '9999px',
        ':hover': {
          backgroundColor: '#c7d2fe',
          color: '#312e81',
        },
      }),
    }),
    [],
  );

  const loadMore = useCallback(() => {
    if (hasMore && !productsQuery.isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, productsQuery.isFetching]);

  const handleSelectionChange = (items: readonly ProductOption[] | null) => {
    const ids = (items ?? []).map((item) => item.value);
    onChange({
      ...(value ?? {}),
      productIds: ids,
    });
  };

  const handleDisplayStyleChange = (next: string) => {
    onChange({
      ...(value ?? {}),
      displayStyle: next,
    });
  };

  const handleItemsPerRowChange = (next: number) => {
    onChange({
      ...(value ?? {}),
      itemsPerRow: next,
    });
  };

  const MenuList = (props: MenuListProps<ProductOption>) => (
    <selectComponents.MenuList {...props}>
      {props.children}
      {hasMore && (
        <div className="px-2 pb-2">
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              loadMore();
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-2"
            disabled={productsQuery.isFetching}
          >
            {productsQuery.isFetching ? 'Loading...' : 'Load more products'}
          </button>
        </div>
      )}
    </selectComponents.MenuList>
  );

  const formatOptionLabel = (option: ProductOption, { context }: { context: 'menu' | 'value' }) => {
    const image = option.image;
    if (context === 'menu') {
      return (
        <div className="flex items-center gap-3 text-inherit">
          {image ? (
            <img src={image} alt={option.label} className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-xs opacity-80">
              {option.sku ? `SKU: ${option.sku}` : 'No SKU'}
              {option.brandName ? ` · ${option.brandName}` : ''}
              {option.priceLabel ? ` · ${option.priceLabel}` : ''}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {image ? (
          <img src={image} alt={option.label} className="w-6 h-6 rounded object-cover" />
        ) : (
          <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-500">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
        )}
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Featured products</label>
        <SelectComponent<ProductOption, true>
          isMulti
          placeholder="Search and select products..."
          value={selectedOptions}
          onChange={(items) => handleSelectionChange(items as ProductOption[])}
          options={allOptions}
          inputValue={searchTerm}
          onInputChange={(value, actionMeta) => {
            if (actionMeta.action === 'input-change') {
              setSearchTerm(value);
            }
            return value;
          }}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          isLoading={productsQuery.isLoading && page === 1}
          isClearable={false}
          loadingMessage={() => 'Loading products...'}
          noOptionsMessage={() => (debouncedSearch ? 'No products found' : 'Start typing to search products')}
          styles={productSelectStyles}
          components={{ MenuList }}
          formatOptionLabel={formatOptionLabel}
          menuPortalTarget={menuPortalTarget}
          menuPlacement="auto"
          className="react-select-container"
          classNamePrefix="react-select"
          onMenuScrollToBottom={() => {
            loadMore();
          }}
        />
        <p className="text-xs text-gray-500">
          Products appear in the order selected. Remove and re-add to adjust ordering.
        </p>
      </div>

      <div className="space-y-3">
        {selectedOptions.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500">
            No products selected yet.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedOptions.map((option, index) => (
              <div
                key={option.value}
                className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 bg-white"
              >
                {option.image ? (
                  <img src={option.image} alt={option.label} className="w-12 h-12 rounded-md object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {index + 1}. {option.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {option.sku ? `SKU: ${option.sku}` : 'No SKU'}
                    {option.brandName ? ` · ${option.brandName}` : ''}
                    {option.priceLabel ? ` · ${option.priceLabel}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Display style
          <select
            className="border rounded-md px-3.5 py-2.5 text-sm !h-11"
            value={(value?.displayStyle as string) || 'grid'}
            onChange={(e) => handleDisplayStyleChange(e.target.value)}
          >
            <option value="grid">Grid</option>
            <option value="carousel">Carousel</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Items per row
          <Input
            type="number"
            min={1}
            max={6}
            value={ensureNumber(value?.itemsPerRow, 4)}
            onChange={(e) => handleItemsPerRowChange(Number(e.target.value) || 1)}
            className="text-sm w-20"
            inputSize="md"
          />
        </label>
      </div>
    </div>
  );
};

interface NewsByCategoryConfigEditorProps {
  value: Record<string, unknown>;
  onChange: ConfigChangeHandler;
}

type NewsByCategoryStrategy = 'latest' | 'most_viewed' | 'featured';

interface NewsByCategoryAdminRow {
  id: string;
  categoryId?: string;
  title: string;
  strategy: NewsByCategoryStrategy;
  limit: number;
  displayStyle: 'grid' | 'carousel';
}

interface NewsCategorySelectOption extends SelectOption {
  searchText: string;
  categoryName: string;
}

const DEFAULT_NEWS_LIMIT = 4;

const NEWS_STRATEGY_OPTIONS: Array<{ value: NewsByCategoryStrategy; label: string }> = [
  { value: 'latest', label: 'Tin mới nhất' },
  { value: 'most_viewed', label: 'Xem nhiều nhất' },
  { value: 'featured', label: 'Biên tập đề xuất' },
];

const createNewsRowId = () => `news-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createDefaultNewsRow = (): NewsByCategoryAdminRow => ({
  id: createNewsRowId(),
  categoryId: undefined,
  title: '',
  strategy: 'latest',
  limit: DEFAULT_NEWS_LIMIT,
  displayStyle: 'grid',
});

const normalizeNewsStrategy = (value: unknown): NewsByCategoryStrategy => {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  switch (raw) {
    case 'most_viewed':
    case 'popular':
    case 'views':
      return 'most_viewed';
    case 'featured':
    case 'editor_pick':
      return 'featured';
    default:
      return 'latest';
  }
};

const flattenNewsCategoryOptions = (categories: any[], prefix = ''): NewsCategorySelectOption[] => {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.flatMap((category: any) => {
    const label = prefix ? `${prefix} › ${category?.name ?? ''}` : category?.name ?? '';
    const searchPieces = [category?.name, category?.id, category?.slug, prefix]
      .map((piece) => (typeof piece === 'string' ? piece.trim().toLowerCase() : ''))
      .filter(Boolean);

    const currentOption: NewsCategorySelectOption = {
      value: category?.id ?? '',
      label: label || category?.id || 'Unknown category',
      searchText: searchPieces.join(' '),
      categoryName: typeof category?.name === 'string' ? category.name : label || category?.id || '',
    };

    const children = flattenNewsCategoryOptions(category?.children, label || category?.name || '');
    return [currentOption, ...children];
  });
};

const parseNewsRowsFromValue = (raw: Record<string, unknown>): NewsByCategoryAdminRow[] => {
  const rawRows = Array.isArray(raw?.rows) ? (raw.rows as any[]) : [];

  if (rawRows.length > 0) {
    return rawRows.map((row, index) => {
      const normalizedId = typeof row?.id === 'string' && row.id.trim().length > 0 ? row.id : `${createNewsRowId()}-${index}`;
      const displayStyle = (row?.displayStyle === 'carousel') ? 'carousel' : 'grid';
      return {
        id: normalizedId,
        categoryId: typeof row?.categoryId === 'string' && row.categoryId.trim().length > 0 ? row.categoryId : undefined,
        title: typeof row?.title === 'string' ? row.title : '',
        strategy: normalizeNewsStrategy(row?.strategy),
        limit: ensureNumber(row?.limit, DEFAULT_NEWS_LIMIT),
        displayStyle,
      };
    });
  }

  const legacyCategories = Array.isArray(raw?.categories)
    ? (raw.categories as unknown[]).filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  const legacyLimit = ensureNumber(raw?.limit, DEFAULT_NEWS_LIMIT);
  const legacyStrategy = normalizeNewsStrategy(raw?.strategy);

  if (legacyCategories.length > 0) {
    return legacyCategories.map((categoryId, index) => ({
      id: `${createNewsRowId()}-${index}`,
      categoryId,
      title: '',
      strategy: legacyStrategy,
      limit: legacyLimit,
      displayStyle: 'grid',
    }));
  }

  return [createDefaultNewsRow()];
};

const sanitizeNewsConfigValue = (
  base: Record<string, unknown>,
  rows: NewsByCategoryAdminRow[],
): Record<string, unknown> => {
  const sanitizedRows = rows.map((row) => {
    const trimmedTitle = typeof row.title === 'string' ? row.title.trim() : '';
    return {
      id: row.id,
      categoryId: row.categoryId,
      title: trimmedTitle || undefined,
      strategy: row.strategy,
      limit: row.limit,
      displayStyle: row.displayStyle,
    };
  });

  const next: Record<string, unknown> = { ...(base ?? {}) };
  delete next.categories;
  delete next.limit;
  delete next.strategy;
  delete next.displayStyle;

  next.rows = sanitizedRows;

  if (sanitizedRows.length > 0) {
    next.limit = sanitizedRows[0]?.limit ?? DEFAULT_NEWS_LIMIT;
    next.categories = sanitizedRows
      .map((row) => row.categoryId)
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    next.strategy = sanitizedRows[0]?.strategy ?? 'latest';
  } else {
    next.limit = DEFAULT_NEWS_LIMIT;
    next.categories = [];
    next.strategy = 'latest';
  }

  return next;
};

const newsRowsAreEqual = (a: NewsByCategoryAdminRow[], b: NewsByCategoryAdminRow[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  return a.every((row, index) => {
    const other = b[index];
    if (!other) return false;
    if (row.id !== other.id) return false;
    if (row.categoryId !== other.categoryId) return false;
    if (row.title !== other.title) return false;
    if (row.strategy !== other.strategy) return false;
    if (row.limit !== other.limit) return false;
    if (row.displayStyle !== other.displayStyle) return false;
    return true;
  });
};

const NewsByCategoryConfigEditor: React.FC<NewsByCategoryConfigEditorProps> = ({ value, onChange }) => {
  const { data: categoriesData, isLoading: categoriesLoading } = trpc.adminPostCategories.getCategories.useQuery();

  const categoryOptions = useMemo<NewsCategorySelectOption[]>(() => {
    const categories = (categoriesData as any)?.data;
    return flattenNewsCategoryOptions(categories);
  }, [categoriesData]);

  const [rows, setRows] = useState<NewsByCategoryAdminRow[]>(() => parseNewsRowsFromValue(value));

  useEffect(() => {
    const nextRows = parseNewsRowsFromValue(value);
    setRows((prev) => (newsRowsAreEqual(prev, nextRows) ? prev : nextRows));
  }, [value]);

  const applyUpdate = useCallback(
    (nextRows: NewsByCategoryAdminRow[]) => {
      setRows(nextRows);
      const nextValue = sanitizeNewsConfigValue(value, nextRows);
      onChange(nextValue);
    },
    [onChange, value],
  );

  const handleAddRow = useCallback(() => {
    applyUpdate([...rows, createDefaultNewsRow()]);
  }, [applyUpdate, rows]);

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      const filtered = rows.filter((row) => row.id !== rowId);
      applyUpdate(filtered.length > 0 ? filtered : [createDefaultNewsRow()]);
    },
    [applyUpdate, rows],
  );

  const handleRowChange = useCallback(
    (rowId: string, nextRow: NewsByCategoryAdminRow) => {
      const updated = rows.map((row) => (row.id === rowId ? nextRow : row));
      applyUpdate(updated);
    },
    [applyUpdate, rows],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-gray-700">Danh mục tin tức</h4>
        <p className="text-xs text-gray-500">Chọn danh mục và cách hiển thị bài viết cho từng danh mục.</p>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <NewsCategoryRowEditor
            key={row.id}
            index={index}
            row={row}
            categoryOptions={categoryOptions}
            categoriesLoading={categoriesLoading}
            onChange={(nextRow) => handleRowChange(row.id, nextRow)}
            onRemove={() => handleRemoveRow(row.id)}
            canRemove={rows.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddRow}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <FiPlus className="w-4 h-4" />
        Thêm danh mục tin tức
      </button>
    </div>
  );
};

interface NewsCategoryRowEditorProps {
  index: number;
  row: NewsByCategoryAdminRow;
  categoryOptions: NewsCategorySelectOption[];
  categoriesLoading: boolean;
  onChange: (row: NewsByCategoryAdminRow) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const NewsCategoryRowEditor: React.FC<NewsCategoryRowEditorProps> = ({
  index,
  row,
  categoryOptions,
  categoriesLoading,
  onChange,
  onRemove,
  canRemove,
}) => {
  const { t } = useTranslation();

  const selectedCategoryOption = useMemo<NewsCategorySelectOption | null>(() => {
    if (!row.categoryId) {
      return null;
    }
    const existing = categoryOptions.find((option) => option.value === row.categoryId);
    if (existing) {
      return existing;
    }
    const fallbackLabel = `ID: ${row.categoryId}`;
    return {
      value: row.categoryId,
      label: fallbackLabel,
      searchText: fallbackLabel.toLowerCase(),
      categoryName: fallbackLabel,
    };
  }, [categoryOptions, row.categoryId]);

  const categoryFilterOption = useCallback(
    (candidate: FilterOptionOption<NewsCategorySelectOption>, rawInput: string) => {
      const search = rawInput.trim().toLowerCase();
      if (!search) return true;
      const option = candidate.data;
      return (
        option.searchText.includes(search) ||
        option.label.toLowerCase().includes(search) ||
        option.value.toLowerCase().includes(search)
      );
    },
    [],
  );

  const formatCategoryOptionLabel = useCallback(
    (option: NewsCategorySelectOption, { context }: { context: 'menu' | 'value' }) => {
      if (context === 'menu') {
        return (
          <div className="flex flex-col text-inherit">
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-xs opacity-80">ID: {option.value}</span>
          </div>
        );
      }
      return <span>{option.label}</span>;
    },
    [],
  );

  const menuPortalTarget = typeof window !== 'undefined' ? window.document.body : undefined;

  const handleCategoryChange = (option: NewsCategorySelectOption | null) => {
    const sanitized = option?.value || undefined;
    const categoryTitle = option?.categoryName?.trim() || '';
    const hasCustomTitle = typeof row.title === 'string' && row.title.trim().length > 0;
    const shouldAutofillTitle = Boolean(sanitized) && (!hasCustomTitle || row.categoryId !== sanitized);
    onChange({
      ...row,
      categoryId: sanitized,
      title: sanitized ? (shouldAutofillTitle ? categoryTitle : row.title) : '',
    });
  };

  const handleTitleChange = (nextTitle: string) => {
    onChange({
      ...row,
      title: nextTitle,
    });
  };

  const handleStrategyChange = (nextStrategy: string) => {
    const normalized = normalizeNewsStrategy(nextStrategy);
    onChange({
      ...row,
      strategy: normalized,
    });
  };

  const handleLimitChange = (nextValue: number) => {
    const sanitized = Number.isFinite(nextValue) && nextValue > 0 ? Math.floor(nextValue) : DEFAULT_NEWS_LIMIT;
    onChange({
      ...row,
      limit: sanitized,
    });
  };

  const handleDisplayStyleChange = (nextStyle: 'grid' | 'carousel') => {
    onChange({
      ...row,
      displayStyle: nextStyle,
    });
  };

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white/90 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">Danh mục #{index + 1}</p>
          <p className="text-xs text-gray-500">{t('sections.manager.newsByCategory.rowDescription', 'Chọn danh mục và cấu hình hiển thị cho mục tin tức.')}</p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            {t('common.actions.remove', 'Xóa')}
          </button>
        )}
      </div>

      <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Danh mục</label>
          <SelectComponent
            isClearable
            isDisabled={categoriesLoading}
            isLoading={categoriesLoading}
            options={categoryOptions}
            value={selectedCategoryOption}
            onChange={(option) => handleCategoryChange(option as NewsCategorySelectOption | null)}
            placeholder={categoriesLoading ? 'Đang tải danh mục...' : 'Chọn danh mục tin tức'}
            filterOption={categoryFilterOption}
            formatOptionLabel={formatCategoryOptionLabel}
            menuPortalTarget={menuPortalTarget}
            classNamePrefix="react-select"
            styles={{
              control: (provided) => ({
                ...provided,
                height: '44px',
                minHeight: '44px',
              }),
              valueContainer: (provided) => ({
                ...provided,
                height: '44px',
                minHeight: '44px',
              }),
              indicatorsContainer: (provided) => ({
                ...provided,
                height: '44px',
              }),
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tiêu đề hiển thị</label>
          <Input
            value={row.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Ví dụ: Tin tức nổi bật"
            className="text-sm"
            inputSize="md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Cách lấy bài viết</label>
          <Select
            value={row.strategy}
            onChange={handleStrategyChange}
            options={NEWS_STRATEGY_OPTIONS}
            placeholder="Chọn cách lấy bài viết"
            size="md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Số lượng bài viết</label>
          <Input
            type="number"
            min={1}
            value={row.limit}
            onChange={(event) => handleLimitChange(Number(event.target.value))}
            className="text-sm w-24"
            inputSize="md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Kiểu hiển thị</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 h-11"
            value={row.displayStyle}
            onChange={(event) => handleDisplayStyleChange(event.target.value as 'grid' | 'carousel')}
          >
            <option value="grid">Grid</option>
            <option value="carousel">Carousel</option>
          </select>
        </div>
      </div>
    </div>
  );
};

interface ProductsByCategoryConfigEditorProps {
  value: Record<string, unknown>;
  onChange: ConfigChangeHandler;
}

type ProductsByCategoryStrategy = 'latest' | 'featured' | 'bestsellers' | 'custom';
type ProductsByCategoryDisplayStyle = 'grid' | 'carousel';

interface ProductsByCategoryAdminRow {
  id: string;
  categoryId?: string;
  title: string;
  strategy: ProductsByCategoryStrategy;
  productIds: string[];
  limit: number;
  displayStyle: ProductsByCategoryDisplayStyle;
}

const DEFAULT_ROW_LIMIT = 6;

interface CategorySelectOption extends SelectOption {
  searchText: string;
  categoryName: string;
}

const STRATEGY_SELECT_OPTIONS: Array<{ value: ProductsByCategoryStrategy; label: string; disabled?: boolean }> = [
  { value: 'latest', label: 'Sản phẩm mới nhất' },
  { value: 'featured', label: 'Sản phẩm nổi bật' },
  { value: 'bestsellers', label: 'Bán chạy nhất (đang phát triển)', disabled: true },
  { value: 'custom', label: 'Tùy chọn sản phẩm' },
];

const createRowId = () => `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeStrategyValue = (value: unknown): ProductsByCategoryStrategy => {
  const raw = typeof value === 'string' ? value.trim() : '';
  switch (raw) {
    case 'featured':
      return 'featured';
    case 'bestsellers':
      return 'bestsellers';
    case 'custom':
      return 'custom';
    case 'most_viewed':
      return 'featured';
    default:
      return 'latest';
  }
};

const normalizeDisplayStyle = (value: unknown): ProductsByCategoryDisplayStyle => {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return raw === 'carousel' ? 'carousel' : 'grid';
};

const createDefaultRow = (): ProductsByCategoryAdminRow => ({
  id: createRowId(),
  categoryId: undefined,
  title: '',
  strategy: 'latest',
  productIds: [],
  limit: DEFAULT_ROW_LIMIT,
  displayStyle: 'grid',
});

const flattenCategoryOptions = (categories: any[], prefix = ''): CategorySelectOption[] => {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.flatMap((category: any) => {
    const label = prefix ? `${prefix} › ${category.name}` : category.name;
    const searchPieces = [category?.name, category?.id, category?.slug, prefix]
      .map((piece) => (typeof piece === 'string' ? piece.trim().toLowerCase() : ''))
      .filter(Boolean);

    const currentOption: CategorySelectOption = {
      value: category.id,
      label,
      searchText: searchPieces.join(' '),
      categoryName: typeof category?.name === 'string' ? category.name : label,
    };

    const children = flattenCategoryOptions(category.children, label);
    return [currentOption, ...children];
  });
};

const parseRowsFromValue = (raw: Record<string, unknown>): ProductsByCategoryAdminRow[] => {
  const rawRows = Array.isArray(raw?.rows) ? (raw.rows as any[]) : [];
  const globalDisplayStyle = normalizeDisplayStyle(raw?.displayStyle);

  if (rawRows.length > 0) {
    return rawRows.map((row, index) => {
      const id = typeof row?.id === 'string' && row.id.trim().length > 0 ? row.id : createRowId();
      const strategy = normalizeStrategyValue(row?.strategy);
      const productIds = Array.isArray(row?.productIds)
        ? row.productIds.filter((idValue: unknown): idValue is string => typeof idValue === 'string' && idValue.trim().length > 0)
        : [];
      const limit = ensureNumber(row?.limit, DEFAULT_ROW_LIMIT);
      const displayStyle = normalizeDisplayStyle((row as any)?.displayStyle ?? globalDisplayStyle);

      return {
        id: index === 0 ? id : `${id}-${index}`,
        categoryId: typeof row?.categoryId === 'string' ? row.categoryId : undefined,
        title: typeof row?.title === 'string' ? row.title : '',
        strategy,
        productIds,
        limit,
        displayStyle,
      };
    });
  }

  const legacyCategoryId = typeof raw?.categoryId === 'string' ? raw.categoryId : undefined;
  const legacyProductIds = Array.isArray(raw?.productIds)
    ? (raw.productIds as unknown[]).filter((idValue): idValue is string => typeof idValue === 'string' && idValue.trim().length > 0)
    : [];
  const legacySort = typeof raw?.sort === 'string' ? raw.sort : 'latest';
  const legacyDisplayStyle = normalizeDisplayStyle(raw?.displayStyle);

  return [{
    id: createRowId(),
    categoryId: legacyCategoryId,
    title: '',
    strategy: normalizeStrategyValue(legacySort),
    productIds: legacyProductIds,
    limit: ensureNumber((raw?.limit as number) ?? DEFAULT_ROW_LIMIT, DEFAULT_ROW_LIMIT),
    displayStyle: legacyDisplayStyle,
  }];
};

const sanitizeConfigValue = (
  base: Record<string, unknown>,
  rows: ProductsByCategoryAdminRow[],
): Record<string, unknown> => {
  const sanitizedRows = rows.map((row) => {
    const trimmedTitle = typeof row.title === 'string' ? row.title.trim() : '';
    return {
      id: row.id,
      categoryId: row.categoryId,
      title: trimmedTitle || undefined,
      strategy: row.strategy,
      productIds: row.productIds,
      limit: row.limit,
      displayStyle: row.displayStyle,
    };
  });

  const next: Record<string, unknown> = { ...(base ?? {}) };
  delete next.categoryId;
  delete next.productIds;
  delete next.sort;
  delete next.limit;
  delete next.displayStyle;

  next.rows = sanitizedRows;

  return next;
};

const rowsAreEqual = (
  a: ProductsByCategoryAdminRow[],
  b: ProductsByCategoryAdminRow[],
): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  return a.every((row, index) => {
    const other = b[index];
    if (!other) return false;
    if (row.id !== other.id) return false;
    if (row.categoryId !== other.categoryId) return false;
    if (row.title !== other.title) return false;
    if (row.strategy !== other.strategy) return false;
    if (row.limit !== other.limit) return false;
    if (row.displayStyle !== other.displayStyle) return false;
    if (row.productIds.length !== other.productIds.length) return false;
    return row.productIds.every((id, idx) => id === other.productIds[idx]);
  });
};

const ProductsByCategoryConfigEditor: React.FC<ProductsByCategoryConfigEditorProps> = ({ value, onChange }) => {
  const { data: categoriesData, isLoading: categoriesLoading } = trpc.adminProductCategories.getTree.useQuery({
    includeInactive: false,
  });

  const categoryOptions = useMemo<CategorySelectOption[]>(() => {
    const categories = (categoriesData as any)?.data;
    return flattenCategoryOptions(categories);
  }, [categoriesData]);

  const [rows, setRows] = useState<ProductsByCategoryAdminRow[]>(() => parseRowsFromValue(value));

  useEffect(() => {
    const nextRows = parseRowsFromValue(value);
    setRows((prev) => (rowsAreEqual(prev, nextRows) ? prev : nextRows));
  }, [value]);

  const applyUpdate = useCallback(
    (nextRows: ProductsByCategoryAdminRow[]) => {
      setRows(nextRows);
      const nextValue = sanitizeConfigValue(value, nextRows);
      onChange(nextValue);
    },
    [onChange, value],
  );

  const handleAddRow = useCallback(() => {
    applyUpdate([...rows, createDefaultRow()]);
  }, [applyUpdate, rows]);

  const handleRemoveRow = useCallback(
    (rowId: string) => {
      const filtered = rows.filter((row) => row.id !== rowId);
      applyUpdate(filtered.length > 0 ? filtered : [createDefaultRow()]);
    },
    [applyUpdate, rows],
  );

  const handleRowChange = useCallback(
    (rowId: string, nextRow: ProductsByCategoryAdminRow) => {
      const updated = rows.map((row) => (row.id === rowId ? nextRow : row));
      applyUpdate(updated);
    },
    [applyUpdate, rows],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-gray-700">Danh mục hiển thị</h4>
        <p className="text-xs text-gray-500">Thêm nhiều danh mục để hiển thị sản phẩm nổi bật theo từng nhóm.</p>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <CategoryRowEditor
            key={row.id}
            index={index}
            row={row}
            categoryOptions={categoryOptions}
            categoriesLoading={categoriesLoading}
            onChange={(nextRow) => handleRowChange(row.id, nextRow)}
            onRemove={() => handleRemoveRow(row.id)}
            canRemove={rows.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddRow}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <FiPlus className="w-4 h-4" />
        Thêm danh mục
      </button>

    </div>
  );
};

interface CategoryRowEditorProps {
  index: number;
  row: ProductsByCategoryAdminRow;
  categoryOptions: CategorySelectOption[];
  categoriesLoading: boolean;
  onChange: (row: ProductsByCategoryAdminRow) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const CategoryRowEditor: React.FC<CategoryRowEditorProps> = ({
  index,
  row,
  categoryOptions,
  categoriesLoading,
  onChange,
  onRemove,
  canRemove,
}) => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const selectedIds = row.productIds;
  const isCustomStrategy = row.strategy === 'custom';

  const selectedCategoryOption = useMemo<CategorySelectOption | null>(() => {
    if (!row.categoryId) {
      return null;
    }
    const existing = categoryOptions.find((option) => option.value === row.categoryId);
    if (existing) {
      return existing;
    }
    const fallbackLabel = `ID: ${row.categoryId}`;
    return {
      value: row.categoryId,
      label: fallbackLabel,
      searchText: [fallbackLabel, row.categoryId.toLowerCase()].join(' '),
      categoryName: fallbackLabel,
    };
  }, [categoryOptions, row.categoryId]);

  const categoryFilterOption = useCallback(
    (candidate: FilterOptionOption<CategorySelectOption>, rawInput: string) => {
      const search = rawInput.trim().toLowerCase();
      if (!search) return true;
      const option = candidate.data;
      return (
        option.searchText.includes(search) ||
        option.label.toLowerCase().includes(search) ||
        option.value.toLowerCase().includes(search)
      );
    },
    [],
  );

  const formatCategoryOptionLabel = useCallback(
    (option: CategorySelectOption, { context }: { context: 'menu' | 'value' }) => {
      if (context === 'menu') {
        return (
          <div className="flex flex-col text-inherit">
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-xs opacity-80">ID: {option.value}</span>
          </div>
        );
      }
      return <span>{option.label}</span>;
    },
    [],
  );

  const [optionsMap, setOptionsMap] = useState<Record<string, ProductOption>>({});
  const [searchOptions, setSearchOptions] = useState<ProductOption[]>([]);
  const [previewOptions, setPreviewOptions] = useState<ProductOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const menuPortalTarget = typeof window !== 'undefined' ? window.document.body : undefined;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setOptionsMap({});
    setSearchOptions([]);
    setPage(1);
    setHasMore(false);
    setPreviewOptions([]);
  }, [row.categoryId, row.strategy, row.id]);

  useEffect(() => {
    setPage(1);
    setSearchOptions([]);
  }, [debouncedSearch, row.categoryId, row.strategy]);

  const productsQuery = trpc.adminProducts.list.useQuery(
    {
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      isActive: true,
      categoryId: row.categoryId || undefined,
    },
    {
      enabled: Boolean(row.categoryId),
    },
  );

  useEffect(() => {
    if (!row.categoryId) {
      setOptionsMap({});
      setSearchOptions([]);
      setHasMore(false);
      setPreviewOptions([]);
      return;
    }

    const payload = (productsQuery.data as any)?.data;
    if (!payload) {
      if (!productsQuery.isFetching && !productsQuery.isLoading && page === 1) {
        setSearchOptions([]);
      }
      setHasMore(false);
      setPreviewOptions([]);
      return;
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    const mapped = items.map(mapProductToOption);

    if (isCustomStrategy) {
      setOptionsMap((prev) => {
        const next = { ...prev };
        mapped.forEach((option) => {
          next[option.value] = option;
        });
        return next;
      });
    }

    setSearchOptions((prev) => {
      if (page === 1) {
        return mapped;
      }
      const existing = new Map(prev.map((option) => [option.value, option]));
      mapped.forEach((option) => {
        if (!existing.has(option.value)) {
          existing.set(option.value, option);
        }
      });
      return Array.from(existing.values());
    });

    setHasMore(payload.page < payload.totalPages);
    setPreviewOptions(mapped.slice(0, row.limit));
  }, [isCustomStrategy, row.categoryId, row.limit, productsQuery.data, productsQuery.isFetching, productsQuery.isLoading, page]);

  useEffect(() => {
    if (!isCustomStrategy || selectedIds.length === 0) {
      return;
    }

    const missing = selectedIds.filter((id) => !optionsMap[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const { trpcClient } = await import('../../utils/trpc');
        const fetched = await Promise.all(
          missing.map(async (id) => {
            try {
              const response = await trpcClient.adminProducts.detail.query({ id });
              const product = (response as any)?.data;
              return product ? mapProductToOption(product) : null;
            } catch (error) {
              console.error('Failed to fetch product detail', error);
              return null;
            }
          }),
        );
        if (cancelled) return;
        const filtered = fetched.filter(Boolean) as ProductOption[];
        if (filtered.length > 0) {
          setOptionsMap((prev) => {
            const next = { ...prev };
            filtered.forEach((option) => {
              next[option.value] = option;
            });
            return next;
          });
        }
      } catch (error) {
        console.error('Failed to load selected products', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isCustomStrategy, selectedIds.join(','), optionsMap]);

  const allOptions = useMemo(() => {
    const map = new Map<string, ProductOption>();
    searchOptions.forEach((option) => {
      map.set(option.value, option);
    });
    selectedIds.forEach((idValue) => {
      const option = optionsMap[idValue];
      if (option) {
        map.set(idValue, option);
      }
    });
    return Array.from(map.values());
  }, [searchOptions, selectedIds, optionsMap]);

  const selectedOptions = useMemo(() => selectedIds.map((idValue) => optionsMap[idValue] || { value: idValue, label: `Product ${idValue}` }), [optionsMap, selectedIds]);

  const productSelectStyles = useMemo(
    () => ({
      control: (provided: any, state: any) => ({
        ...provided,
        minHeight: '46px',
        borderRadius: '12px',
        borderColor: state.isFocused ? '#4f46e5' : '#e5e7eb',
        boxShadow: 'none',
        backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        '&:hover': {
          borderColor: '#4f46e5',
        },
      }),
      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
      menu: (base: any) => ({
        ...base,
        zIndex: 9999,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
      }),
      option: (base: any, state: any) => ({
        ...base,
        padding: '10px 14px',
        backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : '#fff',
        color: state.isSelected ? '#fff' : '#1f2937',
      }),
      multiValue: (base: any) => ({
        ...base,
        backgroundColor: '#eef2ff',
        borderRadius: '9999px',
        padding: '2px 6px',
      }),
      multiValueLabel: (base: any) => ({
        ...base,
        color: '#4338ca',
        fontWeight: 500,
      }),
      multiValueRemove: (base: any) => ({
        ...base,
        color: '#4338ca',
        borderRadius: '9999px',
        ':hover': {
          backgroundColor: '#c7d2fe',
          color: '#312e81',
        },
      }),
    }),
    [],
  );

  const loadMore = useCallback(() => {
    if (!isCustomStrategy || !row.categoryId) {
      return;
    }
    if (hasMore && !productsQuery.isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, productsQuery.isFetching, isCustomStrategy, row.categoryId]);

  const MenuList = (props: MenuListProps<ProductOption>) => (
    <selectComponents.MenuList {...props}>
      {props.children}
      {hasMore && (
        <div className="px-2 pb-2">
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              loadMore();
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-2"
            disabled={productsQuery.isFetching}
          >
            {productsQuery.isFetching ? 'Loading...' : 'Load more products'}
          </button>
        </div>
      )}
    </selectComponents.MenuList>
  );

  const formatOptionLabel = (option: ProductOption, { context }: { context: 'menu' | 'value' }) => {
    const image = option.image;
    if (context === 'menu') {
      return (
        <div className="flex items-center gap-3">
          {image ? (
            <img src={image} alt={option.label} className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{option.label}</span>
            <span className="text-xs text-gray-500">
              {option.sku ? `SKU: ${option.sku}` : 'No SKU'}
              {option.brandName ? ` · ${option.brandName}` : ''}
              {option.priceLabel ? ` · ${option.priceLabel}` : ''}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {image ? (
          <img src={image} alt={option.label} className="w-6 h-6 rounded object-cover" />
        ) : (
          <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-500">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
        )}
        <span>{option.label}</span>
      </div>
    );
  };

  const handleCategoryChange = (option: CategorySelectOption | null) => {
    const sanitized = option?.value || undefined;
    const categoryTitle = option?.categoryName?.trim() || '';
    const hasCustomTitle = typeof row.title === 'string' && row.title.trim().length > 0;
    const shouldAutofillTitle = Boolean(sanitized) && (!hasCustomTitle || row.categoryId !== sanitized);
    onChange({
      ...row,
      categoryId: sanitized,
      title: sanitized ? (shouldAutofillTitle ? categoryTitle : row.title) : '',
      productIds: [],
    });
    setSearchTerm('');
    setDebouncedSearch('');
  };

  const handleStrategyChange = (nextStrategy: ProductsByCategoryStrategy) => {
    if (nextStrategy === 'bestsellers') {
      addToast({
        type: 'info',
        title: t('sections.manager.productsByCategory.bestsellersComingSoonTitle'),
        description: t('sections.manager.productsByCategory.bestsellersComingSoonDescription'),
      });
      return;
    }
    onChange({
      ...row,
      strategy: nextStrategy,
      productIds: nextStrategy === 'custom' ? row.productIds : [],
    });
  };

  const handleDisplayStyleChange = (nextStyle: ProductsByCategoryDisplayStyle) => {
    onChange({
      ...row,
      displayStyle: nextStyle,
    });
  };

  const handleLimitChange = (nextValue: number) => {
    const sanitized = Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1;
    onChange({
      ...row,
      limit: sanitized,
    });
  };

  const handleSelectionChange = (items: readonly ProductOption[] | null) => {
    const ids = (items ?? []).map((item) => item.value);
    onChange({
      ...row,
      productIds: ids,
    });
  };

  const handleTitleChange = (nextTitle: string) => {
    onChange({
      ...row,
      title: nextTitle,
    });
  };

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white/90 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">Danh mục #{index + 1}</p>
          <p className="text-xs text-gray-500">Chọn danh mục và kiểu hiển thị nội dung sản phẩm.</p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Chiến lược hiển thị
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={row.strategy}
              onChange={(event) => handleStrategyChange(event.target.value as ProductsByCategoryStrategy)}
            >
              {STRATEGY_SELECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Kiểu hiển thị
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={row.displayStyle}
              onChange={(event) => handleDisplayStyleChange(event.target.value as ProductsByCategoryDisplayStyle)}
            >
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
            </select>
          </label>
          {canRemove && (
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 invisible select-none" aria-hidden="true">
                placeholder
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="mt-0 h-[35.5px] px-3"
                onClick={onRemove}
                startIcon={<FiTrash2 className="w-4 h-4" />}
              >
                Xóa
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 px-5 py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <label className="lg:col-span-12 flex flex-col gap-2 text-sm text-gray-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tiêu đề hiển thị</span>
            <Input
              type="text"
              value={row.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Nhập tiêu đề hiển thị"
              className="text-sm"
              inputSize="md"
            />
            <span className="text-xs text-gray-500">Tự động gợi ý theo danh mục, có thể chỉnh sửa.</span>
          </label>
          <label className="lg:col-span-8 flex flex-col gap-2 text-sm text-gray-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Danh mục</span>
            <SearchSelect<CategorySelectOption>
              isClearable
              isSearchable
              isDisabled={categoriesLoading}
              isLoading={categoriesLoading}
              options={categoryOptions}
              value={selectedCategoryOption}
              onChange={(option) => handleCategoryChange(option as CategorySelectOption | null)}
              placeholder={categoriesLoading ? 'Đang tải danh mục...' : 'Chọn danh mục'}
              filterOption={categoryFilterOption}
              formatOptionLabel={formatCategoryOptionLabel}
              menuPortalTarget={menuPortalTarget}
              menuPlacement="auto"
              components={{ IndicatorSeparator: () => null }}
              noOptionsMessage={() => 'Không tìm thấy danh mục'}
              size="md"
            />
          </label>
          <label className="lg:col-span-4 flex flex-col gap-2 text-sm text-gray-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Số lượng sản phẩm</span>
            <Input
              type="number"
              min={1}
              value={row.limit}
              onChange={(event) => handleLimitChange(Number(event.target.value) || 1)}
              className="text-sm"
              inputSize="md"
            />
          </label>
        </div>

        {isCustomStrategy && row.categoryId ? (
          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-700">Chọn sản phẩm</span>
            <SelectComponent<ProductOption, true>
              isMulti
              placeholder="Tìm kiếm và chọn sản phẩm..."
              value={selectedOptions}
              onChange={(items) => handleSelectionChange(items as ProductOption[])}
              options={allOptions}
              inputValue={searchTerm}
              onInputChange={(value, actionMeta) => {
                if (actionMeta.action === 'input-change') {
                  setSearchTerm(value);
                }
                return value;
              }}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              isLoading={productsQuery.isLoading && page === 1}
              isClearable={false}
              loadingMessage={() => 'Đang tải sản phẩm...'}
              noOptionsMessage={() => (debouncedSearch ? 'Không tìm thấy sản phẩm' : 'Nhập từ khóa để tìm kiếm')}
              styles={productSelectStyles}
              components={{ MenuList }}
              formatOptionLabel={formatOptionLabel}
              menuPortalTarget={menuPortalTarget}
              menuPlacement="auto"
              className="react-select-container"
              classNamePrefix="react-select"
              onMenuScrollToBottom={() => {
                loadMore();
              }}
            />
            <p className="text-xs text-gray-500">Chỉ hiển thị các sản phẩm thuộc danh mục đã chọn.</p>

            {selectedOptions.length > 0 && (
              <div className="space-y-2">
                {selectedOptions.map((option, order) => (
                  <div
                    key={option.value}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    {option.image ? (
                      <img src={option.image} alt={option.label} className="h-12 w-12 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {order + 1}. {option.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {option.sku ? `SKU: ${option.sku}` : 'Không có SKU'}
                        {option.brandName ? ` · ${option.brandName}` : ''}
                        {option.priceLabel ? ` · ${option.priceLabel}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {row.strategy === 'custom' && !row.categoryId && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                <p className="text-xs text-gray-600">Chọn danh mục trước khi thêm sản phẩm cụ thể.</p>
              </div>
            )}
            {previewOptions.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {previewOptions.map((option, order) => (
                  <div
                    key={`${row.id}-preview-${option.value}`}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    {option.image ? (
                      <img src={option.image} alt={option.label} className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {order + 1}. {option.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {option.sku ? `SKU: ${option.sku}` : 'Không có SKU'}
                        {option.brandName ? ` · ${option.brandName}` : ''}
                        {option.priceLabel ? ` · ${option.priceLabel}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                {row.categoryId
                  ? 'Không tồn tại sản phẩm trong danh mục này.'
                  : 'Chọn danh mục để xem trước sản phẩm sẽ hiển thị.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface SectionFormProps {
  languages: ActiveLanguage[];
  initialState: SectionFormState;
  onSubmit: (payload: SectionFormState) => Promise<void>;
  onClose: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}

const SectionForm: React.FC<SectionFormProps> = ({ languages, initialState, onSubmit, onClose, submitLabel, isSubmitting }) => {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<SectionFormState>(initialState);
  const [activeLocale, setActiveLocale] = useState<string>(() => {
    const defaultLanguage = languages.find((language) => language.isDefault);
    return defaultLanguage?.code || languages[0]?.code || 'en';
  });

  useEffect(() => {
    setFormState(initialState);
  }, [initialState]);

  const translationLocales = languages.length > 0 ? languages.map((language) => language.code) : ['en'];

  const ensureTranslation = (locale: string) => {
    if (!formState.translations[locale]) {
      setFormState((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [locale]: {
            title: '',
            subtitle: '',
            description: '',
            configOverride: '',
          },
        },
      }));
    }
  };

  useEffect(() => {
    translationLocales.forEach(ensureTranslation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationLocales.join(',')]);

  const handleTranslationChange = (locale: string, field: keyof SectionTranslationForm, value: string) => {
    setFormState((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value,
        },
      },
    }));
  };

  const handleConfigOverrideBlur = (locale: string) => {
    const override = formState.translations[locale]?.configOverride || '';
    if (!override) {
      return;
    }
    try {
      JSON.parse(override);
    } catch (error) {
      // Keep previous valid value
    }
  };

  const parseTranslationConfig = (override?: string): { config: Record<string, unknown>; hasError: boolean } => {
    if (!override) {
      return { config: {}, hasError: false };
    }
    try {
      const parsed = JSON.parse(override);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { config: parsed as Record<string, unknown>, hasError: false };
      }
      return { config: {}, hasError: false };
    } catch (error) {
      return { config: {}, hasError: true };
    }
  };

  const stringifyConfig = (config: Record<string, unknown>) => {
    if (!config || Object.keys(config).length === 0) {
      return '';
    }
    return JSON.stringify(config, null, 2);
  };

  const handleTranslationConfigChange = (locale: string, nextConfig: Record<string, unknown>) => {
    setFormState((prev) => {
      const existing = prev.translations[locale] || {
        title: '',
        subtitle: '',
        description: '',
        heroDescription: '',
        configOverride: '',
      };

      return {
        ...prev,
        translations: {
          ...prev.translations,
          [locale]: {
            ...existing,
            configOverride: stringifyConfig(nextConfig),
          },
        },
      };
    });
  };

  const activeTranslationEntry = formState.translations[activeLocale];
  const { config: activeLocaleConfig, hasError: activeLocaleConfigError } = parseTranslationConfig(activeTranslationEntry?.configOverride);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formState);
  };

  const activeTranslation = formState.translations[activeLocale] || {
    title: '',
    subtitle: '',
    description: '',
    heroDescription: '',
    configOverride: '',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t('sections.manager.form.page')}
          value={formState.page}
          onChange={(value) => setFormState((prev) => ({ ...prev, page: value }))}
          options={[...PAGE_OPTIONS, { value: formState.page, label: formState.page.toUpperCase() }].filter(
            (option, index, arr) => arr.findIndex((opt) => opt.value === option.value) === index,
          )}
          required
        />
        <Select
          label={t('sections.manager.form.sectionType')}
          value={formState.type}
          onChange={(value) => setFormState((prev) => ({ ...prev, type: value as SectionType }))}
          options={SECTION_TYPE_OPTIONS}
          required
        />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">{t('sections.manager.form.position')}</span>
          <Input
            type="number"
            min={0}
            value={formState.position ?? ''}
            onChange={(e) => setFormState((prev) => ({ ...prev, position: e.target.value ? Number(e.target.value) : undefined }))}
            placeholder={t('sections.manager.form.autoAssign')}
            className="text-sm w-24"
            inputSize="md"
          />
        </label>
        <div className="flex flex-col justify-end">
          <Toggle
            checked={formState.isEnabled}
            onChange={(checked) => setFormState((prev) => ({ ...prev, isEnabled: checked }))}
            label={t('sections.manager.form.sectionEnabled')}
            description={t('sections.manager.form.sectionEnabledDescription')}
          />
        </div>
      </div>

      <SectionConfigEditor
        type={formState.type}
        value={formState.config || {}}
        onChange={(config) => setFormState((prev) => ({ ...prev, config }))}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.form.translations')}</h4>
          <div className="flex items-center gap-2">
            {translationLocales.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                  activeLocale === locale
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100',
                )}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.form.title')}
            <Input
              value={activeTranslation.title || ''}
              onChange={(e) => handleTranslationChange(activeLocale, 'title', e.target.value)}
              className="text-sm"
              inputSize="md"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.form.subtitle')}
            <Input
              value={activeTranslation.subtitle || ''}
              onChange={(e) => handleTranslationChange(activeLocale, 'subtitle', e.target.value)}
              className="text-sm"
              inputSize="md"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.form.description')}
            <TextArea
              rows={4}
              value={activeTranslation.description || ''}
              onChange={(e) => handleTranslationChange(activeLocale, 'description', e.target.value)}
            />
          </label>
          {formState.type === SectionType.HERO_SLIDER && (
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('sections.manager.form.heroDescription')}
              <TextArea
                rows={4}
                value={activeTranslation.heroDescription || ''}
                onChange={(e) => handleTranslationChange(activeLocale, 'heroDescription', e.target.value)}
                placeholder={t('sections.manager.form.heroDescriptionPlaceholder')}
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('sections.manager.form.configOverride')}
            <TextArea
              rows={6}
              value={activeTranslation.configOverride || ''}
              onChange={(e) => handleTranslationChange(activeLocale, 'configOverride', e.target.value)}
              onBlur={() => handleConfigOverrideBlur(activeLocale)}
              className="font-mono text-xs"
              placeholder={t('sections.manager.form.configOverridePlaceholder')}
            />
          </label>
        </div>

        {formState.type === SectionType.HERO_SLIDER && (
          <HeroSliderLocaleEditor
            locale={activeLocale}
            config={activeLocaleConfig}
            onConfigChange={(nextConfig) => handleTranslationConfigChange(activeLocale, nextConfig)}
            hasParseError={activeLocaleConfigError}
          />
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} type="button">{t('sections.manager.form.cancel')}</Button>
        <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export const SectionsManager: React.FC<SectionsManagerProps> = ({ page, onPageChange }) => {
  const { t } = useTranslation();
  const { sections, languages, sectionsQuery, languagesQuery, createSection, updateSection, deleteSection, reorderSections } = useSectionsManager(page);
  const { addToast } = useToast();
  const [localSections, setLocalSections] = useState<AdminSection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AdminSection | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    const sorted = [...sections].sort((a, b) => a.position - b.position);
    setLocalSections(sorted);
  }, [sections]);

  const defaultLanguage = useMemo(() => languages.find((language) => language.isDefault)?.code || languages[0]?.code || 'en', [languages]);

  const handleOpenCreate = () => {
    setEditingSection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (section: AdminSection) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleDelete = async (section: AdminSection) => {
    if (!window.confirm(t('sections.manager.deleteConfirm'))) {
      return;
    }
    try {
      await deleteSection.mutateAsync({ id: section.id });
      addToast({ type: 'success', title: t('sections.manager.sectionDeleted'), description: t('sections.manager.sectionRemoved', { sectionType: SECTION_TYPE_LABELS[section.type] }) });
    } catch (error: any) {
      addToast({ type: 'error', title: t('sections.manager.deleteFailed'), description: error.message || t('sections.manager.unableToDelete') });
    }
  };

  const handleToggleEnabled = async (section: AdminSection, isEnabled: boolean) => {
    try {
      await updateSection.mutateAsync({ id: section.id, data: { isEnabled } });
      addToast({ type: 'success', title: t('sections.manager.sectionUpdated'), description: t(`sections.manager.section${isEnabled ? 'Enabled' : 'Disabled'}`, { sectionType: SECTION_TYPE_LABELS[section.type] }) });
    } catch (error: any) {
      addToast({ type: 'error', title: t('sections.manager.updateFailed'), description: error.message || t('sections.manager.unableToUpdateStatus') });
    }
  };

  const handleReorder = async (newOrder: AdminSection[]) => {
    setLocalSections(newOrder);
    try {
      await reorderSections.mutateAsync({
        page,
        sections: newOrder.map((section, index) => ({ id: section.id, position: index })),
      });
      addToast({ type: 'success', title: t('sections.manager.orderUpdated'), description: t('sections.manager.sectionOrderSaved') });
    } catch (error: any) {
      addToast({ type: 'error', title: t('sections.manager.reorderFailed'), description: error.message || t('sections.manager.unableToReorder') });
    }
  };

  const resetDragState = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleRowDragStart = useCallback((event: React.DragEvent<HTMLTableRowElement>, sectionId: string) => {
    if (reorderSections.isPending) {
      event.preventDefault();
      return;
    }
    setDraggedId(sectionId);
    setDragOverId(sectionId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', sectionId);
  }, [reorderSections.isPending]);

  const handleRowDragOver = useCallback((event: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    event.preventDefault();
    if (!draggedId || draggedId === targetId) {
      return;
    }
    setDragOverId(targetId);
  }, [draggedId]);

  const handleRowDrop = useCallback((event: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    event.preventDefault();
    if (!draggedId || draggedId === targetId) {
      resetDragState();
      return;
    }

    const sourceIndex = localSections.findIndex((section) => section.id === draggedId);
    const targetIndex = localSections.findIndex((section) => section.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) {
      resetDragState();
      return;
    }

    const updated = [...localSections];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    void handleReorder(updated);
    resetDragState();
  }, [draggedId, localSections, handleReorder, resetDragState]);

  const handleRowDragLeave = useCallback((targetId: string) => {
    if (dragOverId === targetId) {
      setDragOverId(null);
    }
  }, [dragOverId]);

  const handleRowDragEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  const handleFormSubmit = async (state: SectionFormState) => {
    const translationsPayload = Object.entries(state.translations).map(([locale, translation]) => ({
      locale,
      title: translation.title || undefined,
      subtitle: translation.subtitle || undefined,
      description: translation.description || undefined,
      heroDescription: translation.heroDescription || undefined,
      configOverride: translation.configOverride ? safeParseJson(translation.configOverride) : undefined,
    }));

    if (editingSection) {
      try {
        await updateSection.mutateAsync({
          id: editingSection.id,
          data: {
            page: state.page,
            type: state.type,
            isEnabled: state.isEnabled,
            position: state.position,
            config: state.config,
            translations: translationsPayload,
          },
        });
        addToast({ type: 'success', title: t('sections.manager.sectionSaved'), description: t('sections.manager.changesApplied') });
        setIsModalOpen(false);
      } catch (error: any) {
        addToast({ type: 'error', title: t('sections.manager.updateFailed'), description: error.message || t('sections.manager.unableToUpdate') });
      }
      return;
    }

    try {
      await createSection.mutateAsync({
        page: state.page,
        type: state.type,
        isEnabled: state.isEnabled,
        position: state.position,
        config: state.config,
        translations: translationsPayload,
      });
      addToast({ type: 'success', title: t('sections.manager.sectionCreated'), description: t('sections.manager.sectionAvailable') });
      setIsModalOpen(false);
    } catch (error: any) {
      addToast({ type: 'error', title: t('sections.manager.createFailed'), description: error.message || t('sections.manager.unableToCreate') });
    }
  };

  const initialFormState: SectionFormState = editingSection
    ? {
        page: editingSection.page,
        type: editingSection.type,
        isEnabled: editingSection.isEnabled,
        position: editingSection.position,
        config: editingSection.config || {},
        translations: editingSection.translations.reduce<Record<string, SectionTranslationForm>>((acc, translation) => {
          acc[translation.locale] = {
            title: translation.title || '',
            subtitle: translation.subtitle || '',
            description: translation.description || '',
            heroDescription: translation.heroDescription || '',
            configOverride: translation.configOverride ? JSON.stringify(translation.configOverride, null, 2) : '',
          };
          return acc;
        }, {}),
      }
    : {
        page,
        type: SectionType.HERO_SLIDER,
        isEnabled: true,
        config: {},
        translations: {},
      };

  const isLoading = sectionsQuery.isLoading || languagesQuery.isLoading;

  const sectionColumns = useMemo<ReorderableColumn<AdminSection>[]>(() => [
    {
      id: 'section',
      header: t('sections.manager.tableHeaders.title'),
      accessor: (section, index) => {
        const translation = section.translations.find((trans) => trans.locale === defaultLanguage) || section.translations[0];
        return (
          <div className="flex items-center gap-3">
            <DragHandle
              aria-label={`Reorder ${SECTION_TYPE_LABELS[section.type]}`}
              disabled={reorderSections.isPending}
              isDragging={draggedId === section.id}
              label={index + 1}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{translation?.title || '—'}</span>
              <span className="text-xs text-gray-500">{(translation?.locale || defaultLanguage).toUpperCase()}</span>
            </div>
          </div>
        );
      },
      hideable: false,
    },
    {
      id: 'type',
      header: t('sections.manager.tableHeaders.type'),
      accessor: (section) => (
        <span className="text-sm font-medium text-gray-700">{SECTION_TYPE_LABELS[section.type]}</span>
      ),
      hideable: true,
    },
    {
      id: 'status',
      header: t('sections.manager.tableHeaders.enabled'),
      accessor: (section) => (
        <Toggle
          data-drag-ignore
          checked={section.isEnabled}
          onChange={(checked) => handleToggleEnabled(section, checked)}
          size="sm"
          aria-label={`Toggle ${SECTION_TYPE_LABELS[section.type]}`}
        />
      ),
      align: 'center',
      hideable: false,
    },
    {
      id: 'updatedAt',
      header: t('sections.manager.tableHeaders.updated'),
      accessor: 'updatedAt',
      type: 'datetime',
      hideable: true,
    },
    {
      id: 'actions',
      header: t('sections.manager.tableHeaders.actions'),
      accessor: (section) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" data-drag-ignore>
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: t('sections.manager.edit'),
              icon: <FiEdit className="w-4 h-4" />,
              onClick: () => handleEdit(section),
            },
            {
              label: t('sections.manager.delete'),
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handleDelete(section),
              className: 'text-red-600 dark:text-red-400',
            },
          ]}
        />
      ),
      align: 'right',
      hideable: false,
    },
  ], [t, defaultLanguage, reorderSections.isPending, draggedId, handleToggleEnabled, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label={t('sections.manager.form.page')}
            value={page}
            onChange={onPageChange}
            options={PAGE_OPTIONS}
          />
        <Button
          variant="ghost"
          size="md"
          onClick={() => sectionsQuery.refetch()}
          startIcon={<FiRefreshCw className="w-4 h-4" />}
        >
            {t('sections.manager.refresh')}
          </Button>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          startIcon={<FiPlus className="w-4 h-4" />}
        >
          {t('sections.manager.newSection')}
        </Button>
      </div>

      <ReorderableTable<AdminSection>
        tableId="sections-table"
        columns={sectionColumns}
        data={localSections}
        isLoading={isLoading}
        emptyMessage={t('sections.manager.noSections')}
        showColumnVisibility={false}
        showSearch={false}
        showFilter={false}
        enableRowHover={true}
        density="normal"
        dragState={{
          disabled: reorderSections.isPending,
          draggedId,
          dragOverId,
        }}
        onDragStart={(event, section, _index) => handleRowDragStart(event, section.id)}
        onDragOver={(event, section, _index) => handleRowDragOver(event, section.id)}
        onDrop={(event, section, _index) => handleRowDrop(event, section.id)}
        onDragLeave={(_event, section, _index) => handleRowDragLeave(section.id)}
        onDragEnd={(_event, _section, _index) => {
          handleRowDragEnd();
        }}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingSection ? t('sections.manager.modal.editTitle') : t('sections.manager.modal.createTitle')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('sections.manager.modal.description')}
            </p>
          </div>
          <SectionForm
            languages={languages}
            initialState={initialFormState}
            onSubmit={handleFormSubmit}
            onClose={() => setIsModalOpen(false)}
            submitLabel={editingSection ? t('sections.manager.form.saveChanges') : t('sections.manager.form.create')}
            isSubmitting={createSection.isPending || updateSection.isPending}
          />
        </div>
      </Modal>
    </div>
  );
};

const safeParseJson = (value: string) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
};

export default SectionsManager;
