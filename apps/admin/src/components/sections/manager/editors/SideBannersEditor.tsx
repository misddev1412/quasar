import React from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import Textarea from '../../../common/Textarea';
import { Select } from '../../../common/Select';
import { ImageActionButtons } from '../../../common/ImageActionButtons';
import { MediaManager } from '../../../common/MediaManager';
import { Switch } from '../../../common/Switch';
import { ConfigChangeHandler } from '../types';

type SideBannerBreakpoint = 'lg' | 'xl' | '2xl';

interface SideBannerCardConfig {
    id?: string;
    slot?: 'left' | 'right';
    label?: string;
    title?: string;
    description?: string;
    highlight?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    imageUrl?: string;
    background?: string;
    textColor?: string;
    badgeBackground?: string;
    badgeTextColor?: string;
    footerBackground?: string;
    footerTextColor?: string;
}

interface SideBannersEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

const defaultCardSlots: Array<'left' | 'right'> = ['left', 'right'];

const normalizeCards = (cardsValue: unknown): SideBannerCardConfig[] => {
    const cards = Array.isArray(cardsValue) ? cardsValue.slice(0, 2) : [];
    const normalized = cards.map((card) => {
        if (card && typeof card === 'object') {
            const slotValue = (card as SideBannerCardConfig).slot;
            return {
                ...card,
                slot: slotValue === 'right' ? 'right' : slotValue === 'left' ? 'left' : undefined,
            };
        }
        return {};
    }) as SideBannerCardConfig[];

    while (normalized.length < 2) {
        const slot = defaultCardSlots[normalized.length] ?? 'left';
        normalized.push({
            id: `side-banner-${slot}`,
            slot,
        });
    }

    return normalized.map((card, index) => ({
        ...card,
        id: typeof card.id === 'string' && card.id.trim() ? card.id : `side-banner-${defaultCardSlots[index] ?? 'left'}`,
        slot: card.slot ?? defaultCardSlots[index] ?? 'left',
    }));
};

export const SideBannersEditor: React.FC<SideBannersEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [mediaState, setMediaState] = React.useState<{ isOpen: boolean; cardIndex: number | null }>({
        isOpen: false,
        cardIndex: null,
    });

    const updateConfig = (partial: Record<string, unknown>) => {
        onChange({
            ...(value ?? {}),
            ...partial,
        });
    };

    const handleNumericChange = (field: 'width' | 'height' | 'gap', nextValue: string) => {
        const trimmed = nextValue.trim();
        if (!trimmed) {
            const next = { ...(value ?? {}) };
            delete next[field];
            onChange(next);
            return;
        }
        const parsed = Number(trimmed);
        if (!Number.isNaN(parsed)) {
            updateConfig({ [field]: parsed });
        }
    };

    const handleBreakpointChange = (nextBreakpoint: SideBannerBreakpoint) => {
        updateConfig({ hideBelowBreakpoint: nextBreakpoint });
    };

    const cards = normalizeCards(value?.cards);
    const cardBorderRadiusValue = typeof value?.cardBorderRadius === 'string' ? value.cardBorderRadius : '';
    const showCtaButton = value?.showCtaButton !== false;
    const imageOverlayEnabled = value?.imageOverlayEnabled !== false;

    const handleCardBorderRadiusChange = (radius: string) => {
        const trimmed = radius.trim();
        if (!trimmed) {
            const next = { ...(value ?? {}) };
            delete next.cardBorderRadius;
            onChange(next);
            return;
        }
        updateConfig({ cardBorderRadius: trimmed });
    };

    const handleCardChange = (index: number, key: keyof SideBannerCardConfig, nextValue?: string) => {
        const updatedCards = cards.map((card, cardIndex) => {
            if (cardIndex !== index) {
                return card;
            }
            const updated: SideBannerCardConfig = { ...card };
            const trimmed = nextValue?.trim() ?? '';
            if (!trimmed && key !== 'slot') {
                delete updated[key];
            } else {
                updated[key] = (key === 'slot' ? (nextValue as SideBannerCardConfig['slot']) : trimmed) as never;
            }
            return updated;
        });

        updateConfig({ cards: updatedCards });
    };

    const widthValue = typeof value?.width === 'number' ? String(value.width) : '';
    const heightValue = typeof value?.height === 'number' ? String(value.height) : '';
    const gapValue = typeof value?.gap === 'number' ? String(value.gap) : '';
    const breakpointValue =
        typeof value?.hideBelowBreakpoint === 'string' ? (value.hideBelowBreakpoint as SideBannerBreakpoint) : 'xl';

    const breakpointOptions = [
        { value: 'lg', label: t('sections.manager.config.sideBanners.breakpointLg') },
        { value: 'xl', label: t('sections.manager.config.sideBanners.breakpointXl') },
        { value: '2xl', label: t('sections.manager.config.sideBanners.breakpoint2Xl') },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.sideBanners.width')}
                    <Input
                        type="number"
                        value={widthValue}
                        onChange={(event) => handleNumericChange('width', event.target.value)}
                        placeholder="140"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">
                        {t('sections.manager.config.sideBanners.widthDescription')}
                    </span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.sideBanners.height')}
                    <Input
                        type="number"
                        value={heightValue}
                        onChange={(event) => handleNumericChange('height', event.target.value)}
                        placeholder="470"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">
                        {t('sections.manager.config.sideBanners.heightDescription')}
                    </span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.sideBanners.gap')}
                    <Input
                        type="number"
                        value={gapValue}
                        onChange={(event) => handleNumericChange('gap', event.target.value)}
                        placeholder="24"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">
                        {t('sections.manager.config.sideBanners.gapDescription')}
                    </span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.sideBanners.breakpoint')}
                    <Select
                        value={breakpointValue}
                        onChange={(valueOption) => handleBreakpointChange(valueOption as SideBannerBreakpoint)}
                        options={breakpointOptions}
                        className="text-sm"
                    />
                    <span className="text-xs text-gray-500">
                        {t('sections.manager.config.sideBanners.breakpointDescription')}
                    </span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.sideBanners.cardBorderRadius')}
                    <Input
                        value={cardBorderRadiusValue}
                        onChange={(event) => handleCardBorderRadiusChange(event.target.value)}
                        placeholder={t('sections.manager.config.sideBanners.cardBorderRadiusPlaceholder')}
                    />
                    <span className="text-xs text-gray-500">
                        {t('sections.manager.config.sideBanners.cardBorderRadiusDescription')}
                    </span>
                </label>
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <span>{t('sections.manager.config.sideBanners.showCtaButton')}</span>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200/80 p-3">
                        <div className="text-xs text-gray-500 pr-3">
                            {t('sections.manager.config.sideBanners.showCtaButtonDescription')}
                        </div>
                        <Switch
                            checked={showCtaButton}
                            onChange={(checked) => updateConfig({ showCtaButton: checked })}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <span>{t('sections.manager.config.sideBanners.imageOverlayEnabled')}</span>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200/80 p-3">
                        <div className="text-xs text-gray-500 pr-3">
                            {t('sections.manager.config.sideBanners.imageOverlayDescription')}
                        </div>
                        <Switch
                            checked={imageOverlayEnabled}
                            onChange={(checked) => updateConfig({ imageOverlayEnabled: checked })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {cards.map((card, index) => (
                    <div key={card.id || index} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">
                                {t('sections.manager.config.sideBanners.cardLabel', {
                                    slot:
                                        (card.slot === 'right'
                                            ? t('sections.manager.config.sideBanners.slotRight')
                                            : t('sections.manager.config.sideBanners.slotLeft')) || '',
                                })}
                            </p>
                            <div className="w-40">
                                <Select
                                    value={card.slot ?? defaultCardSlots[index]}
                                    onChange={(slot) => handleCardChange(index, 'slot', slot)}
                                    options={[
                                        { value: 'left', label: t('sections.manager.config.sideBanners.slotLeft') },
                                        { value: 'right', label: t('sections.manager.config.sideBanners.slotRight') },
                                    ]}
                                    className="text-sm"
                                />
                                <span className="text-xs text-gray-500">
                                    {t('sections.manager.config.sideBanners.slotDescription')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex flex-col gap-1 text-xs text-gray-600">
                                {t('sections.manager.config.sideBanners.label')}
                                <Input
                                    value={card.label || ''}
                                    onChange={(event) => handleCardChange(index, 'label', event.target.value)}
                                    placeholder="FLASH SALE"
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-xs text-gray-600">
                                {t('sections.manager.config.sideBanners.titleField')}
                                <Input
                                    value={card.title || ''}
                                    onChange={(event) => handleCardChange(index, 'title', event.target.value)}
                                    placeholder={t('sections.manager.config.sideBanners.titlePlaceholder')}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-xs text-gray-600">
                                {t('sections.manager.config.sideBanners.descriptionField')}
                                <Textarea
                                    rows={3}
                                    value={card.description || ''}
                                    onChange={(event) => handleCardChange(index, 'description', event.target.value)}
                                    placeholder={t('sections.manager.config.sideBanners.descriptionPlaceholder')}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-xs text-gray-600">
                                {t('sections.manager.config.sideBanners.highlight')}
                                <Input
                                    value={card.highlight || ''}
                                    onChange={(event) => handleCardChange(index, 'highlight', event.target.value)}
                                    placeholder={t('sections.manager.config.sideBanners.highlightPlaceholder')}
                                />
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1 text-xs text-gray-600">
                                    {t('sections.manager.config.sideBanners.ctaLabel')}
                                    <Input
                                        value={card.ctaLabel || ''}
                                        onChange={(event) => handleCardChange(index, 'ctaLabel', event.target.value)}
                                        placeholder={t('sections.manager.config.sideBanners.ctaLabelPlaceholder')}
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-xs text-gray-600">
                                    {t('sections.manager.config.sideBanners.ctaUrl')}
                                    <Input
                                        value={card.ctaUrl || ''}
                                        onChange={(event) => handleCardChange(index, 'ctaUrl', event.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-1 text-xs text-gray-600">
                                {t('sections.manager.config.sideBanners.background')}
                                <Input
                                    value={card.background || ''}
                                    onChange={(event) => handleCardChange(index, 'background', event.target.value)}
                                    placeholder={t('sections.manager.config.sideBanners.backgroundPlaceholder')}
                                />
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1 text-xs text-gray-600">
                                    {t('sections.manager.config.sideBanners.textColor')}
                                    <Input
                                        value={card.textColor || ''}
                                        onChange={(event) => handleCardChange(index, 'textColor', event.target.value)}
                                        placeholder="#ffffff"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-xs text-gray-600">
                                    {t('sections.manager.config.sideBanners.badgeBackground')}
                                    <Input
                                        value={card.badgeBackground || ''}
                                        onChange={(event) => handleCardChange(index, 'badgeBackground', event.target.value)}
                                        placeholder="rgba(255,255,255,0.18)"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1 text-xs text-gray-600">
                                    {t('sections.manager.config.sideBanners.badgeTextColor')}
                                    <Input
                                        value={card.badgeTextColor || ''}
                                        onChange={(event) => handleCardChange(index, 'badgeTextColor', event.target.value)}
                                        placeholder="#ffffff"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-xs text-gray-600">
                                    {t('sections.manager.config.sideBanners.footerBackground')}
                                    <Input
                                        value={card.footerBackground || ''}
                                        onChange={(event) => handleCardChange(index, 'footerBackground', event.target.value)}
                                        placeholder="rgba(255,255,255,0.9)"
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-1 text-xs text-gray-600">
                                {t('sections.manager.config.sideBanners.footerTextColor')}
                                <Input
                                    value={card.footerTextColor || ''}
                                    onChange={(event) => handleCardChange(index, 'footerTextColor', event.target.value)}
                                    placeholder="#0f172a"
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-xs text-gray-600">
                                {t('sections.manager.config.sideBanners.imageField')}
                                <div className="space-y-2">
                                    <Input
                                        value={card.imageUrl || ''}
                                        onChange={(event) => handleCardChange(index, 'imageUrl', event.target.value)}
                                        placeholder={t('sections.manager.config.sideBanners.imagePlaceholder')}
                                    />
                                    <ImageActionButtons
                                        hasImage={Boolean(card.imageUrl)}
                                        selectLabel={t('sections.manager.config.sideBanners.selectImage')}
                                        changeLabel={t('sections.manager.config.sideBanners.changeImage')}
                                        removeLabel={t('sections.manager.config.sideBanners.removeImage')}
                                        onSelect={() => setMediaState({ isOpen: true, cardIndex: index })}
                                        onRemove={() => handleCardChange(index, 'imageUrl', '')}
                                    />
                                </div>
                                {card.imageUrl && (
                                    <div className="h-32 w-full overflow-hidden rounded-lg border border-dashed border-gray-200 bg-gray-50 mt-2">
                                        <img src={card.imageUrl} alt="preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            <MediaManager
                isOpen={mediaState.isOpen}
                onClose={() => setMediaState({ isOpen: false, cardIndex: null })}
                onSelect={(selection) => {
                    const selected = Array.isArray(selection) ? selection[0] : selection;
                    if (selected?.url && mediaState.cardIndex !== null) {
                        handleCardChange(mediaState.cardIndex, 'imageUrl', selected.url);
                    }
                    setMediaState({ isOpen: false, cardIndex: null });
                }}
                accept="image/*"
                title={t('sections.manager.config.sideBanners.mediaTitle')}
            />
        </div>
    );
};
