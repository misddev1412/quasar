import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Select } from '../../../common/Select';
import { Input } from '../../../common/Input';
import { Button } from '../../../common/Button';
import { MediaUpload } from '../../../common/MediaUpload';
import { ColorSelector } from '../../../common/ColorSelector';
import { ConfigChangeHandler } from '../types';

interface VideoItem {
    id: string;
    type: 'embed' | 'upload';
    title?: string;
    description?: string;
    embedUrl?: string;
    uploadUrl?: string; // For uploaded video URL
    posterImage?: string;
    caption?: string;
    cta?: {
        label?: string;
        href?: string;
        openInNewTab?: boolean;
    };
}

interface VideoEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

const VideoEditorComponent: React.FC<VideoEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

    const handleValueChange = (path: string, newValue: unknown) => {
        onChange({
            ...(value ?? {}),
            [path]: newValue,
});
    };

    const currentAutoplay = Boolean(value?.autoplay ?? false);
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
            {/* Global Settings */}
            <div className="space-y-4 border-b pb-6">
                <h3 className="text-sm font-medium text-gray-900">{t('sections.manager.config.video.settings')}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={currentAutoplay}
                        onChange={(e) => handleValueChange('autoplay', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{t('sections.manager.config.video.autoplay')}</span>
                    <span className="text-xs text-gray-500 ml-1">
                        - {t('sections.manager.config.video.autoplayDescription')}
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ColorSelector
                        value={(value?.backgroundColor as string) || ''}
                        onChange={(color) => handleValueChange('backgroundColor', color)}
                        label={t('sections.manager.config.video.backgroundLight')}
                        placeholder="#0f172a"
                    />
                    <ColorSelector
                        value={(value?.backgroundColorDark as string) || ''}
                        onChange={(color) => handleValueChange('backgroundColorDark', color)}
                        label={t('sections.manager.config.video.backgroundDark')}
                        placeholder="#030712"
                    />
                </div>
                <p className="text-xs text-gray-500">{t('sections.manager.config.video.backgroundHelp')}</p>
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

                                    <label className="block space-y-1">
                                        <span className="text-sm text-gray-600">{t('sections.manager.config.video.caption')}</span>
                                        <Input
                                            value={video.caption || ''}
                                            onChange={(e) => handleUpdateVideo(index, 'caption', e.target.value)}
                                            placeholder={t('sections.manager.config.video.captionPlaceholder')}
                                        />
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="space-y-1">
                                            <span className="text-sm text-gray-600">{t('sections.manager.config.video.ctaLabel')}</span>
                                            <Input
                                                value={video.cta?.label || ''}
                                                onChange={(e) => handleUpdateVideo(index, 'cta', { ...(video.cta || {}), label: e.target.value })}
                                                placeholder={t('sections.manager.config.video.ctaLabelPlaceholder')}
                                            />
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-sm text-gray-600">{t('sections.manager.config.video.ctaLink')}</span>
                                            <Input
                                                value={video.cta?.href || ''}
                                                onChange={(e) => handleUpdateVideo(index, 'cta', { ...(video.cta || {}), href: e.target.value })}
                                                placeholder="/collections/..."
                                            />
                                        </label>
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(video.cta?.openInNewTab)}
                                            onChange={(e) => handleUpdateVideo(index, 'cta', { ...(video.cta || {}), openInNewTab: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        {t('sections.manager.config.video.ctaOpenInNewTab')}
                                    </label>
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

export const VideoEditor = React.memo(VideoEditorComponent);
