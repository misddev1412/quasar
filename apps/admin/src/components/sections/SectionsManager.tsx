import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, GripVertical, ChevronUp, ChevronDown, RefreshCcw, Image as ImageIcon } from 'lucide-react';
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
          Raw JSON Config
          <Button variant="ghost" size="sm" onClick={() => setJsonView(false)}>Use form editor</Button>
        </label>
        <TextArea
          rows={10}
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          className="font-mono text-xs"
        />
        {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
        <Button variant="secondary" size="sm" onClick={handleJsonApply}>Apply JSON</Button>
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
                    className="w-20"
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

  const renderFeaturedProducts = () => {
    const productIds = Array.isArray(value?.productIds) ? (value.productIds as string[]) : [];
    return (
      <div className="space-y-3">
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Product IDs (comma separated)
          <TextArea
            rows={3}
            value={productIds.join(', ')}
            onChange={(e) => handleValueChange('productIds', e.target.value.split(',').map((id) => id.trim()).filter(Boolean))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Display style
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={(value?.displayStyle as string) || 'grid'}
            onChange={(e) => handleValueChange('displayStyle', e.target.value)}
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
            onChange={(e) => handleValueChange('itemsPerRow', Number(e.target.value))}
          />
        </label>
      </div>
    );
  };

  const renderProductsByCategory = () => (
    <div className="space-y-3">
      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Category ID
        <Input
          value={(value?.categoryId as string) || ''}
          onChange={(e) => handleValueChange('categoryId', e.target.value)}
          placeholder="Enter category id"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Limit
        <Input
          type="number"
          min={1}
          value={ensureNumber(value?.limit, 8)}
          onChange={(e) => handleValueChange('limit', Number(e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Sort order
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={(value?.sort as string) || 'newest'}
          onChange={(e) => handleValueChange('sort', e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="bestsellers">Bestsellers</option>
          <option value="price_low_high">Price: Low to High</option>
          <option value="price_high_low">Price: High to Low</option>
        </select>
      </label>
    </div>
  );

  const renderNews = () => (
    <div className="space-y-3">
      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Number of articles
        <Input
          type="number"
          min={1}
          value={ensureNumber(value?.limit, 4)}
          onChange={(e) => handleValueChange('limit', Number(e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Include categories (comma separated IDs)
        <TextArea
          rows={3}
          value={Array.isArray(value?.categories) ? (value.categories as string[]).join(', ') : ''}
          onChange={(e) => handleValueChange('categories', e.target.value.split(',').map((id) => id.trim()).filter(Boolean))}
        />
      </label>
    </div>
  );

  const renderCustomHtml = () => (
    <div className="space-y-2">
      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
        Custom HTML
        <Button variant="ghost" size="sm" onClick={() => setJsonView(true)}>Edit as JSON</Button>
      </label>
      <TextArea
        rows={10}
        value={(value?.html as string) || ''}
        onChange={(e) => handleValueChange('html', e.target.value)}
        className="font-mono text-xs"
      />
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">Section configuration</h4>
          <Button variant="ghost" size="sm" onClick={() => setJsonView(true)}>Raw JSON</Button>
        </div>

        {type === SectionType.HERO_SLIDER && renderHeroSlider()}
        {type === SectionType.FEATURED_PRODUCTS && renderFeaturedProducts()}
        {type === SectionType.PRODUCTS_BY_CATEGORY && renderProductsByCategory()}
        {type === SectionType.NEWS && renderNews()}
        {type === SectionType.CUSTOM_HTML && renderCustomHtml()}

        {![
          SectionType.HERO_SLIDER,
          SectionType.FEATURED_PRODUCTS,
          SectionType.PRODUCTS_BY_CATEGORY,
          SectionType.NEWS,
          SectionType.CUSTOM_HTML,
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
        <Button variant="secondary" size="sm" onClick={addSlide} startIcon={<Plus className="w-4 h-4" />}>Add slide</Button>
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
                <Button variant="ghost" size="sm" onClick={() => removeSlide(idx)} startIcon={<Trash2 className="w-4 h-4" />}>
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Title"
                  value={(slide.title as string) || ''}
                  onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                />
                <Input
                  placeholder="Subtitle"
                  value={(slide.subtitle as string) || ''}
                  onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
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
                            startIcon={<Trash2 className="w-4 h-4" />}
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
                      />
                    </div>
                  </div>
                </div>
                <Input
                  placeholder="CTA Label"
                  value={(slide.ctaLabel as string) || ''}
                  onChange={(e) => updateSlide(idx, 'ctaLabel', e.target.value)}
                />
                <Input
                  placeholder="CTA URL"
                  value={(slide.ctaUrl as string) || ''}
                  onChange={(e) => updateSlide(idx, 'ctaUrl', e.target.value)}
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

interface SectionFormProps {
  languages: ActiveLanguage[];
  initialState: SectionFormState;
  onSubmit: (payload: SectionFormState) => Promise<void>;
  onClose: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}

const SectionForm: React.FC<SectionFormProps> = ({ languages, initialState, onSubmit, onClose, submitLabel, isSubmitting }) => {
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
          label="Page"
          value={formState.page}
          onChange={(value) => setFormState((prev) => ({ ...prev, page: value }))}
          options={[...PAGE_OPTIONS, { value: formState.page, label: formState.page.toUpperCase() }].filter(
            (option, index, arr) => arr.findIndex((opt) => opt.value === option.value) === index,
          )}
          required
        />
        <Select
          label="Section type"
          value={formState.type}
          onChange={(value) => setFormState((prev) => ({ ...prev, type: value as SectionType }))}
          options={SECTION_TYPE_OPTIONS}
          required
        />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Position (optional)</span>
          <Input
            type="number"
            min={0}
            value={formState.position ?? ''}
            onChange={(e) => setFormState((prev) => ({ ...prev, position: e.target.value ? Number(e.target.value) : undefined }))}
            placeholder="Auto assign"
          />
        </label>
        <div className="flex flex-col justify-end">
          <Toggle
            checked={formState.isEnabled}
            onChange={(checked) => setFormState((prev) => ({ ...prev, isEnabled: checked }))}
            label="Section enabled"
            description="Control whether this section is visible on the page"
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
          <h4 className="text-sm font-semibold text-gray-700">Translations</h4>
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
            Title
            <Input
              value={activeTranslation.title || ''}
              onChange={(e) => handleTranslationChange(activeLocale, 'title', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Subtitle
            <Input
              value={activeTranslation.subtitle || ''}
              onChange={(e) => handleTranslationChange(activeLocale, 'subtitle', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Description
            <TextArea
              rows={4}
              value={activeTranslation.description || ''}
              onChange={(e) => handleTranslationChange(activeLocale, 'description', e.target.value)}
            />
          </label>
          {formState.type === SectionType.HERO_SLIDER && (
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              Hero description (per locale)
              <TextArea
                rows={4}
                value={activeTranslation.heroDescription || ''}
                onChange={(e) => handleTranslationChange(activeLocale, 'heroDescription', e.target.value)}
                placeholder="Optional description overrides for the hero slider"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Config override (JSON)
            <TextArea
              rows={6}
              value={activeTranslation.configOverride || ''}
              onChange={(e) => handleTranslationChange(activeLocale, 'configOverride', e.target.value)}
              onBlur={() => handleConfigOverrideBlur(activeLocale)}
              className="font-mono text-xs"
              placeholder={`{\n  "title": "Localized title"\n}`}
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
        <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export const SectionsManager: React.FC<SectionsManagerProps> = ({ page, onPageChange }) => {
  const { sections, languages, sectionsQuery, languagesQuery, createSection, updateSection, deleteSection, reorderSections } = useSectionsManager(page);
  const { addToast } = useToast();
  const [localSections, setLocalSections] = useState<AdminSection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AdminSection | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

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
    if (!window.confirm('Delete this section? This action can be undone by re-creating the section.')) {
      return;
    }
    try {
      await deleteSection.mutateAsync({ id: section.id });
      addToast({ type: 'success', title: 'Section deleted', description: `${SECTION_TYPE_LABELS[section.type]} removed.` });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Delete failed', description: error.message || 'Unable to delete section.' });
    }
  };

  const handleToggleEnabled = async (section: AdminSection, isEnabled: boolean) => {
    try {
      await updateSection.mutateAsync({ id: section.id, data: { isEnabled } });
      addToast({ type: 'success', title: 'Section updated', description: `${SECTION_TYPE_LABELS[section.type]} ${isEnabled ? 'enabled' : 'disabled'}.` });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Update failed', description: error.message || 'Unable to update section status.' });
    }
  };

  const handleReorder = async (newOrder: AdminSection[]) => {
    setLocalSections(newOrder);
    try {
      await reorderSections.mutateAsync({
        page,
        sections: newOrder.map((section, index) => ({ id: section.id, position: index })),
      });
      addToast({ type: 'success', title: 'Order updated', description: 'Section order saved.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Reorder failed', description: error.message || 'Unable to reorder sections.' });
    }
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const sourceIndex = localSections.findIndex((section) => section.id === draggedId);
    const targetIndex = localSections.findIndex((section) => section.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const updated = [...localSections];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    handleReorder(updated);
    setDraggedId(null);
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    const index = localSections.findIndex((section) => section.id === sectionId);
    if (index === -1) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= localSections.length) return;
    const reordered = [...localSections];
    const [item] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, item);
    handleReorder(reordered);
  };

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
        addToast({ type: 'success', title: 'Section saved', description: 'Changes have been applied.' });
        setIsModalOpen(false);
      } catch (error: any) {
        addToast({ type: 'error', title: 'Update failed', description: error.message || 'Unable to update section.' });
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
      addToast({ type: 'success', title: 'Section created', description: 'The section is now available.' });
      setIsModalOpen(false);
    } catch (error: any) {
      addToast({ type: 'error', title: 'Creation failed', description: error.message || 'Unable to create section.' });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Page"
            value={page}
            onChange={onPageChange}
            options={PAGE_OPTIONS}
          />
          <Button
            variant="ghost"
            size="md"
            onClick={() => sectionsQuery.refetch()}
            startIcon={<RefreshCcw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          startIcon={<Plus className="w-4 h-4" />}
        >
          New section
        </Button>
      </div>

      <div className="overflow-hidden border border-gray-100 rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Order</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Title</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Enabled</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Updated</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Loading sections…</td>
              </tr>
            )}

            {!isLoading && localSections.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  No sections configured for this page yet. Create your first section.
                </td>
              </tr>
            )}

            {localSections.map((section, index) => {
              const translation = section.translations.find((trans) => trans.locale === defaultLanguage) || section.translations[0];
              return (
                <tr
                  key={section.id}
                  draggable
                  onDragStart={() => setDraggedId(section.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(section.id)}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    draggedId === section.id ? 'opacity-50' : 'opacity-100',
                  )}
                >
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() => moveSection(section.id, -1)}
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() => moveSection(section.id, 1)}
                        aria-label="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{SECTION_TYPE_LABELS[section.type]}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{translation?.title || '—'}</div>
                    <div className="text-xs text-gray-500">{translation?.locale?.toUpperCase()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      checked={section.isEnabled}
                      onChange={(checked) => handleToggleEnabled(section, checked)}
                      size="sm"
                      aria-label={`Toggle ${SECTION_TYPE_LABELS[section.type]}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(section.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(section)}
                        startIcon={<Edit3 className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(section)}
                        startIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingSection ? 'Edit section' : 'Create new section'}
            </h3>
            <p className="text-sm text-gray-500">
              Configure the section order, translations, and per-type settings.
            </p>
          </div>
          <SectionForm
            languages={languages}
            initialState={initialFormState}
            onSubmit={handleFormSubmit}
            onClose={() => setIsModalOpen(false)}
            submitLabel={editingSection ? 'Save changes' : 'Create section'}
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
