import React, { useState, useEffect } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Button } from '../../../common/Button';
import { Input } from '../../../common/Input';
import { MediaManager } from '../../../common/MediaManager';
import { ImageActionButtons } from '../../../common/ImageActionButtons';
import { RevealableUrlInput } from '../../../common/RevealableUrlInput';
import { Image as ImageIcon } from 'lucide-react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { HeroSlideConfig, HeroSliderLocaleEditorProps } from '../types';
import { TextArea } from '../common';

export const HeroSliderLocaleEditor: React.FC<HeroSliderLocaleEditorProps> = ({ locale, config, onConfigChange, hasParseError }) => {
    const { t } = useTranslationWithBackend();
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
                    <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.heroSlider.slidesFor', { locale: locale.toUpperCase() })}</h4>
                    <p className="text-xs text-gray-500">{t('sections.manager.heroSlider.manageLocaleCampaigns')}</p>
                    {hasParseError && (
                        <p className="text-xs text-red-500 mt-1">
                            {t('sections.manager.heroSlider.jsonError')}
                        </p>
                    )}
                </div>
                <Button variant="secondary" size="sm" onClick={addSlide} startIcon={<FiPlus className="w-4 h-4" />}>{t('sections.manager.heroSlider.addSlide')}</Button>
            </div>

            {slides.length === 0 && (
                <p className="text-xs text-gray-500">{t('sections.manager.heroSlider.noSlides')}</p>
            )}

            <div className="space-y-3">
                {slides.map((slide, idx) => {
                    const slideId = typeof slide.id === 'string' ? slide.id : `hero-slide-${idx}`;
                    const imageUrl = typeof slide.imageUrl === 'string' ? slide.imageUrl : '';

                    return (
                        <div key={slideId} className="border rounded-lg p-4 space-y-3 bg-white">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">{t('sections.manager.heroSlider.slideTitle', { index: idx + 1 })}</p>
                                <Button variant="ghost" size="sm" onClick={() => removeSlide(idx)} startIcon={<FiTrash2 className="w-4 h-4" />}>
                                    {t('sections.manager.heroSlider.remove')}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                    placeholder={t('sections.manager.heroSlider.titlePlaceholder')}
                                    value={(slide.title as string) || ''}
                                    onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                                    className="text-sm"
                                    inputSize="md"
                                />
                                <Input
                                    placeholder={t('sections.manager.heroSlider.subtitlePlaceholder')}
                                    value={(slide.subtitle as string) || ''}
                                    onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                                    className="text-sm"
                                    inputSize="md"
                                />
                                <div className="md:col-span-2">
                                    <TextArea
                                        rows={3}
                                        placeholder={t('sections.manager.heroSlider.descriptionPlaceholder')}
                                        value={(slide.description as string) || ''}
                                        onChange={(e) => updateSlide(idx, 'description', e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <span className="text-sm font-medium text-gray-600">{t('sections.manager.heroSlider.slideImage')}</span>
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
                                                    <span className="text-xs">{t('sections.manager.heroSlider.noImageSelected')}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <ImageActionButtons
                                                hasImage={Boolean(imageUrl)}
                                                selectLabel={t('sections.manager.heroSlider.selectImage')}
                                                changeLabel={t('sections.manager.heroSlider.changeImage')}
                                                removeLabel={t('sections.manager.heroSlider.removeImage')}
                                                onSelect={() => handleOpenMediaManager(idx)}
                                                onRemove={() => updateSlide(idx, 'imageUrl', '')}
                                                className="sm:justify-start"
                                            />
                                            <RevealableUrlInput
                                                value={imageUrl}
                                                placeholder={t('sections.manager.heroSlider.imagePlaceholder')}
                                                className="text-sm"
                                                inputSize="md"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Input
                                    placeholder={t('sections.manager.heroSlider.ctaLabel')}
                                    value={(slide.ctaLabel as string) || ''}
                                    onChange={(e) => updateSlide(idx, 'ctaLabel', e.target.value)}
                                    className="text-sm"
                                    inputSize="md"
                                />
                                <Input
                                    placeholder={t('sections.manager.heroSlider.ctaUrl')}
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
                title={t('sections.manager.heroSlider.selectSlideImage', { locale: locale.toUpperCase() })}
            />
        </div>
    );
};
