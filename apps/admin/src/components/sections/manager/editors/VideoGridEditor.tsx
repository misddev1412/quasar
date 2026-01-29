import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { Select } from '@admin/components/common/Select';
import { Input } from '@admin/components/common/Input';
import { Button } from '@admin/components/common/Button';
import { MediaUpload } from '@admin/components/common/MediaUpload';
import { ColorSelector } from '@admin/components/common/ColorSelector';
import { ConfigChangeHandler } from '@admin/components/sections/manager/types';

interface VideoItem {
    id: string;
    type: 'embed' | 'upload';
    title?: string;
    description?: string;
    embedUrl?: string;
    uploadUrl?: string;
    posterImage?: string;
}

interface VideoGridEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

const VideoGridEditorComponent: React.FC<VideoGridEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

    const handleValueChange = (path: string, newValue: unknown) => {
        onChange({
            ...(value ?? {}),
            [path]: newValue,
        });
    };

    const videos = (value?.videos as VideoItem[]) || [];

    const handleAddVideo = () => {
        const newVideo: VideoItem = {
            id: `video-${Date.now()}`,
            type: 'embed',
            title: '',
        };
        handleValueChange('videos', [...videos, newVideo]);
        setExpandedVideoId(newVideo.id);
    };

    const handleRemoveVideo = (index: number) => {
        const newVideos = [...videos];
        newVideos.splice(index, 1);
        handleValueChange('videos', newVideos);
    };

    const handleUpdateVideo = (index: number, field: keyof VideoItem, val: unknown) => {
        const newVideos = [...videos];
        newVideos[index] = { ...newVideos[index], [field]: val };
        handleValueChange('videos', newVideos);
    };

    const toggleVideoExpand = (id: string) => {
        setExpandedVideoId(expandedVideoId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            {/* Appearance Settings */}
            <div className="space-y-4 border-b pb-6">
                <h3 className="text-sm font-medium text-gray-900">{t('sections.manager.config.video.settings')}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Select
                        value={(value?.backgroundStyle as string) || 'surface'}
                        onChange={(val) => handleValueChange('backgroundStyle', val)}
                        label={t('sections.manager.brandShowcase.background')}
                        options={[
                            { value: 'surface', label: t('sections.manager.brandShowcase.backgroundSurface') },
                            { value: 'muted', label: t('sections.manager.brandShowcase.backgroundMuted') },
                            { value: 'contrast', label: t('sections.manager.brandShowcase.backgroundContrast') },
                        ]}
                    />
                    <label className="space-y-1">
                        <span className="text-sm text-gray-600">{t('sections.featured_products.config.itemsPerRow')}</span>
                        <Select
                            value={String((value?.itemsPerRow as number) || 3)}
                            onChange={(val) => handleValueChange('itemsPerRow', Number(val))}
                            options={[
                                { value: '1', label: '1' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3' },
                                { value: '4', label: '4' },
                                { value: '5', label: '5' },
                                { value: '6', label: '6' },
                            ]}
                        />
                    </label>
                </div>
            </div>

            {/* Videos List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{t('sections.manager.config.video.videosList')}</h3>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAddVideo}
                        startIcon={<Plus className="w-4 h-4" />}
                    >
                        {t('sections.manager.config.video.addVideo')}
                    </Button>
                </div>

                <div className="space-y-3">
                    {videos.map((video, index) => (
                        <div key={video.id} className="border rounded-lg bg-gray-50 overflow-hidden">
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleVideoExpand(video.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {video.title || t('sections.manager.config.video.untitledVideo')}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                                        {video.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveVideo(index);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="text-gray-400">
                                        {expandedVideoId === video.id ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {expandedVideoId === video.id && (
                                <div className="p-4 border-t bg-white space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="space-y-1">
                                            <span className="text-sm text-gray-600">{t('sections.manager.config.video.title')}</span>
                                            <Input
                                                value={video.title || ''}
                                                onChange={(e) => handleUpdateVideo(index, 'title', e.target.value)}
                                                placeholder={t('sections.manager.config.video.titlePlaceholder')}
                                            />
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-sm text-gray-600">{t('sections.manager.config.video.type')}</span>
                                            <Select
                                                value={video.type}
                                                onChange={(val) => handleUpdateVideo(index, 'type', val)}
                                                options={[
                                                    { value: 'embed', label: t('sections.manager.config.video.embed') },
                                                    { value: 'upload', label: t('sections.manager.config.video.upload') },
                                                ]}
                                            />
                                        </label>
                                    </div>

                                    <label className="block space-y-1">
                                        <span className="text-sm text-gray-600">{t('sections.manager.config.video.description')}</span>
                                        <textarea
                                            value={video.description || ''}
                                            onChange={(e) => handleUpdateVideo(index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm px-3 py-2"
                                            placeholder={t('sections.manager.config.video.descriptionPlaceholder')}
                                        />
                                    </label>

                                    {video.type === 'embed' ? (
                                        <label className="block space-y-1">
                                            <span className="text-sm text-gray-600">{t('sections.manager.config.video.embedUrl')}</span>
                                            <Input
                                                value={video.embedUrl || ''}
                                                onChange={(e) => handleUpdateVideo(index, 'embedUrl', e.target.value)}
                                                placeholder="https://www.youtube.com/embed/..."
                                            />
                                            <p className="text-xs text-gray-500">{t('sections.manager.config.video.embedUrlHelp')}</p>
                                        </label>
                                    ) : (
                                        <div className="space-y-1">
                                            <span className="text-sm text-gray-600">{t('sections.manager.config.video.uploadVideo')}</span>
                                            <MediaUpload
                                                value={video.uploadUrl}
                                                onChange={(url) => handleUpdateVideo(index, 'uploadUrl', url)}
                                                accept="video/*"
                                                label=""
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <span className="text-sm text-gray-600">{t('sections.manager.config.video.posterImage')}</span>
                                        <MediaUpload
                                            value={video.posterImage}
                                            onChange={(url) => handleUpdateVideo(index, 'posterImage', url)}
                                            accept="image/*"
                                            label=""
                                        />
                                        <p className="text-xs text-gray-500">{t('sections.manager.config.video.posterImageHelp')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {videos.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                            {t('sections.manager.config.video.noVideos')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const VideoGridEditor = React.memo(VideoGridEditorComponent);
