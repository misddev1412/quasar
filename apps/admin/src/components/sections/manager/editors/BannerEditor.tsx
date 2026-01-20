import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { ColorSelector } from '../../../common/ColorSelector';
import { Select, SelectOption } from '../../../common/Select';
import { MediaManager } from '../../../common/MediaManager';
import { ImageActionButtons } from '../../../common/ImageActionButtons';
import { RevealableUrlInput } from '../../../common/RevealableUrlInput';
import { CategorySelector } from '../../../menus/CategorySelector';
import { ProductSelector } from '../../../menus/ProductSelector';
import {
    BannerCardConfig,
    BannerCardLink,
    BannerLabelTextTransform,
    BannerLinkType,
    ConfigChangeHandler,
} from '../types';
import { buildBannerLinkHref, ensureNumber } from '../utils';

interface BannerEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

const isLabelTextTransform = (value?: string): value is BannerLabelTextTransform => {
    return value === 'none' || value === 'uppercase' || value === 'capitalize' || value === 'lowercase';
};

export const BannerEditor: React.FC<BannerEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [bannerMediaState, setBannerMediaState] = useState<{ isOpen: boolean; cardIndex: number | null }>({
        isOpen: false,
        cardIndex: null,
    });

    const updateConfig = (partial: Record<string, unknown>) => {
        onChange({
            ...(value ?? {}),
            ...partial,
        });
    };

    const cards = Array.isArray(value?.cards) ? (value.cards as BannerCardConfig[]) : [];
    const cardBorderRadius = typeof value?.cardBorderRadius === 'string' ? value.cardBorderRadius : '';
    const cardGap = typeof value?.cardGap === 'string' ? value.cardGap : '';
    const labelBgColorLight = typeof value?.labelBgColorLight === 'string' ? value.labelBgColorLight : '';
    const labelBgColorDark = typeof value?.labelBgColorDark === 'string' ? value.labelBgColorDark : '';
    const labelTextColorLight = typeof value?.labelTextColorLight === 'string' ? value.labelTextColorLight : '';
    const labelTextColorDark = typeof value?.labelTextColorDark === 'string' ? value.labelTextColorDark : '';

    const rawTransform = value?.labelTextTransform as string | undefined;
    const labelTextTransform: BannerLabelTextTransform = isLabelTextTransform(rawTransform)
        ? rawTransform
        : 'none';

    const hideOverlay = Boolean(value?.hideOverlay);
    const hideLabel = Boolean(value?.hideLabel);

    const clampCardCount = (count: number) => Math.min(Math.max(count, 1), 4);
    const rawCount = ensureNumber(value?.cardCount, cards.length > 0 ? cards.length : 1);
    const cardCount = clampCardCount(rawCount);

    const buildCardSlots = (count = cardCount) => {
        const next: BannerCardConfig[] = [];
        for (let i = 0; i < count; i += 1) {
            next.push(cards[i] ? { ...cards[i] } : { id: `banner-card-${i}` });
        }
        return next;
    };

    const normalizedCards = buildCardSlots();

    const handleCardCountChange = (count: number) => {
        const sanitized = clampCardCount(count);
        const nextCards = buildCardSlots(sanitized);
        updateConfig({ cardCount: sanitized, cards: nextCards });
    };

    const handleCardChange = (index: number, payload: Partial<BannerCardConfig>) => {
        const nextCards = buildCardSlots().map((card, idx) => (idx === index ? { ...card, ...payload } : card));
        updateConfig({ cards: nextCards });
    };

    const handleCardLinkChange = (index: number, payload: Partial<BannerCardLink>) => {
        const currentLink = (normalizedCards[index]?.link ?? {}) as BannerCardLink;
        handleCardChange(index, { link: { ...currentLink, ...payload } });
    };

    const handleBannerMediaClose = () => setBannerMediaState({ isOpen: false, cardIndex: null });

    const handleBannerMediaSelect = (selection: any) => {
        if (bannerMediaState.cardIndex === null) {
            handleBannerMediaClose();
            return;
        }

        const selected = Array.isArray(selection) ? selection[0] : selection;
        if (!selected || typeof selected.url !== 'string') {
            handleBannerMediaClose();
            return;
        }

        handleCardChange(bannerMediaState.cardIndex, { imageUrl: selected.url });
        handleBannerMediaClose();
    };

    const handleLinkTypeChange = (index: number, nextType: BannerLinkType) => {
        const resolvedType: BannerLinkType = nextType || 'custom';
        if (resolvedType === 'custom') {
            handleCardLinkChange(index, {
                type: resolvedType,
                referenceId: '',
                href: (normalizedCards[index]?.link?.href as string) || '',
            });
            return;
        }
        handleCardLinkChange(index, { type: resolvedType, referenceId: '', href: '' });
    };

    const handleLinkReferenceChange = (index: number, type: BannerLinkType, referenceId?: string) => {
        const normalizedId = referenceId?.trim() ?? '';
        const nextHref = normalizedId ? buildBannerLinkHref(type, normalizedId) : '';
        handleCardLinkChange(index, { type, referenceId: normalizedId, href: nextHref });
    };

    const linkTypeOptions: SelectOption[] = [
        { value: 'custom', label: t('sections.manager.config.banner.linkTypeCustom') },
        { value: 'category', label: t('sections.manager.config.banner.linkTypeCategory') },
        { value: 'product', label: t('sections.manager.config.banner.linkTypeProduct') },
    ];

    const handleBorderRadiusChange = (radius: string) => {
        const trimmed = radius.trim();
        if (!trimmed) {
            const next = { ...(value ?? {}) };
            delete next.cardBorderRadius;
            onChange(next);
            return;
        }
        updateConfig({ cardBorderRadius: trimmed });
    };

    const handleGapChange = (gapValue: string) => {
        const trimmed = gapValue.trim();
        if (!trimmed) {
            const next = { ...(value ?? {}) };
            delete next.cardGap;
            onChange(next);
            return;
        }
        updateConfig({ cardGap: trimmed });
    };

    type LabelColorKey = 'labelBgColorLight' | 'labelBgColorDark' | 'labelTextColorLight' | 'labelTextColorDark';

    const handleLabelColorChange = (key: LabelColorKey, colorValue?: string) => {
        const trimmed = colorValue?.trim() ?? '';
        if (!trimmed) {
            const next = { ...(value ?? {}) };
            delete next[key];
            onChange(next);
            return;
        }
        updateConfig({ [key]: trimmed } as Record<string, unknown>);
    };

    const handleLabelTextTransformChange = (nextTransform: BannerLabelTextTransform) => {
        updateConfig({ labelTextTransform: nextTransform });
    };

    return (
        <div className="space-y-6">
            <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('sections.manager.config.banner.cardCount')}
                <Select
                    value={String(cardCount)}
                    onChange={(val) => handleCardCountChange(Number(val) || cardCount)}
                    options={[1, 2, 3, 4].map((count) => ({
                        value: String(count),
                        label: t('sections.manager.config.banner.cardCountOption', { count }),
                    }))}
                    className="text-sm"
                />
                <span className="text-xs text-gray-500">{t('sections.manager.config.banner.cardCountDescription')}</span>
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.banner.cardBorderRadius')}
                    <Input
                        value={cardBorderRadius}
                        placeholder={t('sections.manager.config.banner.cardBorderRadiusPlaceholder')}
                        onChange={(e) => handleBorderRadiusChange(e.target.value)}
                        className="text-sm"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.banner.cardBorderRadiusDescription')}</span>
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.banner.cardGap')}
                    <Input
                        value={cardGap}
                        placeholder={t('sections.manager.config.banner.cardGapPlaceholder')}
                        onChange={(e) => handleGapChange(e.target.value)}
                        className="text-sm"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.banner.cardGapDescription')}</span>
                </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <ColorSelector
                        value={labelBgColorLight}
                        placeholder={t('sections.manager.config.banner.labelColorPlaceholder')}
                        onChange={(color) => handleLabelColorChange('labelBgColorLight', color)}
                        label={t('sections.manager.config.banner.labelBackgroundLight')}
                        className="w-full"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.banner.labelColorDescription')}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <ColorSelector
                        value={labelBgColorDark}
                        placeholder={t('sections.manager.config.banner.labelColorPlaceholder')}
                        onChange={(color) => handleLabelColorChange('labelBgColorDark', color)}
                        label={t('sections.manager.config.banner.labelBackgroundDark')}
                        className="w-full"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.banner.labelColorDescription')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <ColorSelector
                        value={labelTextColorLight}
                        placeholder={t('sections.manager.config.banner.labelColorPlaceholder')}
                        onChange={(color) => handleLabelColorChange('labelTextColorLight', color)}
                        label={t('sections.manager.config.banner.labelTextColorLight')}
                        className="w-full"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.banner.labelColorDescription')}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <ColorSelector
                        value={labelTextColorDark}
                        placeholder={t('sections.manager.config.banner.labelColorPlaceholder')}
                        onChange={(color) => handleLabelColorChange('labelTextColorDark', color)}
                        label={t('sections.manager.config.banner.labelTextColorDark')}
                        className="w-full"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.banner.labelColorDescription')}</span>
                </div>
            </div>

            <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('sections.manager.config.banner.labelTextTransform')}
                <Select
                    value={labelTextTransform}
                    onChange={(val) => handleLabelTextTransformChange((val as BannerLabelTextTransform) || 'none')}
                    options={[
                        { value: 'none', label: t('sections.manager.config.banner.labelTextTransformNone') },
                        { value: 'uppercase', label: t('sections.manager.config.banner.labelTextTransformUppercase') },
                        { value: 'capitalize', label: t('sections.manager.config.banner.labelTextTransformCapitalize') },
                        { value: 'lowercase', label: t('sections.manager.config.banner.labelTextTransformLowercase') },
                    ]}
                    className="text-sm"
                />
                <span className="text-xs text-gray-500">{t('sections.manager.config.banner.labelTextTransformDescription')}</span>
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={hideOverlay}
                        onChange={(e) => updateConfig({ hideOverlay: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                        <p>{t('sections.manager.config.banner.hideOverlay')}</p>
                        <p className="text-xs text-gray-500">{t('sections.manager.config.banner.hideOverlayDescription')}</p>
                    </div>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={hideLabel}
                        onChange={(e) => updateConfig({ hideLabel: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                        <p>{t('sections.manager.config.banner.hideLabel')}</p>
                        <p className="text-xs text-gray-500">{t('sections.manager.config.banner.hideLabelDescription')}</p>
                    </div>
                </label>
            </div>

            <div className="space-y-4">
                {normalizedCards.map((card, idx) => {
                    const cardId = typeof card.id === 'string' ? card.id : `banner-card-${idx}`;
                    const imageUrl = typeof card.imageUrl === 'string' ? card.imageUrl : '';
                    const linkConfig = (card.link ?? {}) as BannerCardLink;
                    const openInNewTab = (linkConfig.target ?? '_self') === '_blank';
                    const linkType: BannerLinkType = (linkConfig.type as BannerLinkType) || 'custom';
                    const linkHref = typeof linkConfig.href === 'string' ? linkConfig.href : '';
                    const linkReferenceId = typeof linkConfig.referenceId === 'string' ? linkConfig.referenceId : '';

                    return (
                        <div key={cardId} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {t('sections.manager.config.banner.cardLabel', { index: idx + 1 })}
                                    </p>
                                    <p className="text-xs text-gray-500">{t('sections.manager.config.banner.cardDescription')}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('sections.manager.config.banner.cardImage')}
                                </span>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="flex h-36 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 sm:w-56">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={cardId} className="h-full w-full rounded-lg object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                                <ImageIcon className="h-10 w-10" />
                                                <span className="text-xs">{t('sections.manager.config.banner.noImage')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <ImageActionButtons
                                            hasImage={Boolean(imageUrl)}
                                            selectLabel={t('sections.manager.config.banner.selectImage')}
                                            changeLabel={t('sections.manager.config.banner.changeImage')}
                                            removeLabel={t('sections.manager.config.banner.removeImage')}
                                            onSelect={() => setBannerMediaState({ isOpen: true, cardIndex: idx })}
                                            onRemove={() => handleCardChange(idx, { imageUrl: '' })}
                                        />
                                        <RevealableUrlInput value={imageUrl} className="text-sm" inputSize="md" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="flex flex-col gap-1 text-sm text-gray-600">
                                    {t('sections.manager.config.banner.linkLabel')}
                                    <Input
                                        value={linkConfig.label || ''}
                                        onChange={(e) => handleCardLinkChange(idx, { label: e.target.value })}
                                        className="text-sm"
                                        inputSize="md"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-gray-600">
                                    {t('sections.manager.config.banner.linkType')}
                                    <Select
                                        value={linkType}
                                        onChange={(val) => handleLinkTypeChange(idx, (val as BannerLinkType) || 'custom')}
                                        options={linkTypeOptions}
                                        className="text-sm"
                                    />
                                    <span className="text-xs text-gray-500">{t('sections.manager.config.banner.linkTypeDescription')}</span>
                                </label>
                            </div>

                            {linkType === 'custom' ? (
                                <label className="flex flex-col gap-1 text-sm text-gray-600">
                                    {t('sections.manager.config.banner.linkUrl')}
                                    <Input
                                        value={linkHref}
                                        onChange={(e) => handleCardLinkChange(idx, {
                                            type: 'custom',
                                            referenceId: '',
                                            href: e.target.value,
                                        })}
                                        placeholder={t('sections.manager.config.banner.linkUrlPlaceholder')}
                                        className="text-sm"
                                        inputSize="md"
                                    />
                                </label>
                            ) : null}

                            {linkType === 'category' && (
                                <div className="space-y-1 text-sm text-gray-600">
                                    <span>{t('sections.manager.config.banner.linkCategory')}</span>
                                    <CategorySelector
                                        value={linkReferenceId || undefined}
                                        onChange={(categoryId) => handleLinkReferenceChange(idx, 'category', categoryId)}
                                    />
                                    <p className="text-xs text-gray-500">{t('sections.manager.config.banner.linkResourceDescription')}</p>
                                </div>
                            )}

                            {linkType === 'product' && (
                                <div className="space-y-1 text-sm text-gray-600">
                                    <span>{t('sections.manager.config.banner.linkProduct')}</span>
                                    <ProductSelector
                                        value={linkReferenceId || undefined}
                                        onChange={(productId) => handleLinkReferenceChange(idx, 'product', productId)}
                                    />
                                    <p className="text-xs text-gray-500">{t('sections.manager.config.banner.linkResourceDescription')}</p>
                                </div>
                            )}

                            {linkType !== 'custom' && (
                                <label className="flex flex-col gap-1 text-sm text-gray-600">
                                    {t('sections.manager.config.banner.linkPreview')}
                                    <Input value={linkHref} readOnly className="text-sm" inputSize="md" />
                                </label>
                            )}

                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={openInNewTab}
                                    onChange={(e) => handleCardLinkChange(idx, { target: e.target.checked ? '_blank' : '_self' })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                {t('sections.manager.config.banner.openInNewTab')}
                            </label>
                        </div>
                    );
                })}
            </div>

            <MediaManager
                isOpen={bannerMediaState.isOpen}
                onClose={handleBannerMediaClose}
                onSelect={handleBannerMediaSelect}
                multiple={false}
                accept="image/*"
                title={t('sections.manager.config.banner.mediaManagerTitle')}
            />
        </div>
    );
};
