import React, { useState } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Select } from '../../../common/Select';
import { Button } from '../../../common/Button';
import { MediaManager } from '../../../common/MediaManager';
import { ImageActionButtons } from '../../../common/ImageActionButtons';
import { TextArea } from '../common';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface GalleryEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const GalleryEditor: React.FC<GalleryEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [galleryMediaState, setGalleryMediaState] = useState<{ isOpen: boolean; imageIndex: number | null }>({
        isOpen: false,
        imageIndex: null,
    });

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

    const handleGutterChange = (gutter: string) => {
        onChange({
            ...(value ?? {}),
            gutter,
        });
    };

    const handleAddImage = () => {
        const images = (value?.images as unknown[]) ?? [];
        const newImage = {
            id: `gallery-${Date.now()}`,
            imageUrl: '',
            label: '',
            description: '',
            link: {
                label: '',
                href: '',
            },
        };
        onChange({
            ...(value ?? {}),
            images: [...images, newImage],
        });
    };

    const handleImageChange = (index: number, imageData: Record<string, unknown>) => {
        const images = [...((value?.images as unknown[]) ?? [])];
        images[index] = {
            ...(images[index] as Record<string, unknown>),
            ...imageData,
        };
        onChange({
            ...(value ?? {}),
            images,
        });
    };

    const handleImageLinkChange = (index: number, linkData: Record<string, unknown>) => {
        const images = [...((value?.images as unknown[]) ?? [])];
        const currentImage = images[index] as Record<string, unknown>;
        images[index] = {
            ...currentImage,
            link: {
                ...((currentImage.link as Record<string, unknown>) ?? {}),
                ...linkData,
            },
        };
        onChange({
            ...(value ?? {}),
            images,
        });
    };

    const handleRemoveImage = (index: number) => {
        const images = [...((value?.images as unknown[]) ?? [])];
        images.splice(index, 1);
        onChange({
            ...(value ?? {}),
            images,
        });
    };

    const handleOpenGalleryMedia = (index: number) => {
        setGalleryMediaState({ isOpen: true, imageIndex: index });
    };

    const handleGalleryMediaClose = () => {
        setGalleryMediaState({ isOpen: false, imageIndex: null });
    };

    const handleGalleryMediaSelect = (selected: { url: string } | { url: string }[]) => {
        if (galleryMediaState.imageIndex === null) {
            handleGalleryMediaClose();
            return;
        }

        const selectedFile = Array.isArray(selected) ? selected[0] : selected;
        if (!selectedFile) {
            handleGalleryMediaClose();
            return;
        }

        handleImageChange(galleryMediaState.imageIndex, { imageUrl: selectedFile.url });
        handleGalleryMediaClose();
    };

    const currentLayout = (value?.layout as string) || 'grid';
    const currentColumns = ensureNumber(value?.columns, 3);
    const currentGutter = (value?.gutter as string) || '1.25rem';
    const images = (value?.images as Record<string, unknown>[]) ?? [];

    return (
        <div className="space-y-6">
            {/* Layout Configuration */}
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

            <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('sections.manager.config.gallery.gap')}
                <Input
                    value={currentGutter}
                    onChange={(e) => handleGutterChange(e.target.value)}
                    placeholder="1.25rem"
                    className="text-sm"
                    inputSize="md"
                />
                <span className="text-xs text-gray-500">{t('sections.manager.config.gallery.gapDescription')}</span>
            </label>

            {/* Gallery Images */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                        {t('sections.manager.config.gallery.title')}
                    </label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        startIcon={<FiPlus className="h-4 w-4" />}
                        onClick={handleAddImage}
                    >
                        {t('sections.manager.config.gallery.addImage')}
                    </Button>
                </div>

                {images.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">{t('sections.manager.config.gallery.noImages')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {images.map((image, idx) => {
                            const imageUrl = (image.imageUrl as string) || '';
                            const label = (image.label as string) || '';
                            const description = (image.description as string) || '';
                            const link = (image.link as Record<string, unknown>) ?? {};
                            const linkLabel = (link.label as string) || '';
                            const linkHref = (link.href as string) || '';

                            return (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            {t('sections.manager.config.gallery.imageTitle', { index: idx + 1 })}
                                        </h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            startIcon={<FiTrash2 className="h-4 w-4" />}
                                            onClick={() => handleRemoveImage(idx)}
                                        >
                                            {t('sections.manager.config.gallery.remove')}
                                        </Button>
                                    </div>

                                    {/* Image Selection */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-600">
                                            {t('sections.manager.config.gallery.imageUrl')}
                                        </label>
                                        {imageUrl && (
                                            <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-gray-200">
                                                <img
                                                    src={imageUrl}
                                                    alt={label || `Gallery image ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <ImageActionButtons
                                            hasImage={Boolean(imageUrl)}
                                            selectLabel={t('sections.manager.config.gallery.selectImage')}
                                            changeLabel={t('sections.manager.config.gallery.changeImage')}
                                            removeLabel={t('sections.manager.config.gallery.removeImage')}
                                            onSelect={() => handleOpenGalleryMedia(idx)}
                                            onRemove={() => handleImageChange(idx, { imageUrl: '' })}
                                        />
                                        <Input value={imageUrl} readOnly className="text-sm" inputSize="md" />
                                    </div>

                                    {/* Image Details */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                                            {t('sections.manager.config.gallery.label')}
                                            <Input
                                                value={label}
                                                onChange={(e) => handleImageChange(idx, { label: e.target.value })}
                                                placeholder={t('sections.manager.config.gallery.labelPlaceholder')}
                                                className="text-sm"
                                                inputSize="md"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                                            {t('sections.manager.config.gallery.description')}
                                            <TextArea
                                                value={description}
                                                onChange={(e) => handleImageChange(idx, { description: e.target.value })}
                                                placeholder={t('sections.manager.config.gallery.descriptionPlaceholder')}
                                                className="text-sm"
                                                rows={2}
                                            />
                                        </label>
                                    </div>

                                    {/* Link Configuration */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                                            {t('sections.manager.config.gallery.linkLabel')}
                                            <Input
                                                value={linkLabel}
                                                onChange={(e) => handleImageLinkChange(idx, { label: e.target.value })}
                                                placeholder={t('sections.manager.config.gallery.linkLabelPlaceholder')}
                                                className="text-sm"
                                                inputSize="md"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                                            {t('sections.manager.config.gallery.linkUrl')}
                                            <Input
                                                value={linkHref}
                                                onChange={(e) => handleImageLinkChange(idx, { href: e.target.value })}
                                                placeholder={t('sections.manager.config.gallery.linkUrlPlaceholder')}
                                                className="text-sm"
                                                inputSize="md"
                                            />
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <MediaManager
                isOpen={galleryMediaState.isOpen}
                onClose={handleGalleryMediaClose}
                onSelect={handleGalleryMediaSelect}
                multiple={false}
                accept="image/*"
                title={t('sections.manager.config.gallery.selectMedia')}
            />
        </div>
    );
};
