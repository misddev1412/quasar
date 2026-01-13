import React, { useState } from 'react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { ColorSelector } from '@admin/components/common/ColorSelector';
import { MediaManager } from '@admin/components/common/MediaManager';
import { ImageActionButtons } from '@admin/components/common/ImageActionButtons';
import { RevealableUrlInput } from '@admin/components/common/RevealableUrlInput';
import { Select } from '@admin/components/common/Select';
import { Image as ImageIcon } from 'lucide-react';

export type SectionHeadingStyle = 'default' | 'banner';

export interface SectionHeadingConfigData {
    headingStyle?: SectionHeadingStyle;
    headingBackgroundColor?: string;
    headingBackgroundImage?: string;
}

interface SectionHeadingConfigProps {
    data: SectionHeadingConfigData;
    onChange: (data: SectionHeadingConfigData) => void;
}

export const SectionHeadingConfig: React.FC<SectionHeadingConfigProps> = ({ data, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [isMediaOpen, setIsMediaOpen] = useState(false);

    const handleStyleChange = (style: SectionHeadingStyle) => {
        onChange({ ...data, headingStyle: style });
    };

    const handleBackgroundColorChange = (color: string) => {
        onChange({ ...data, headingBackgroundColor: color });
    };

    const handleBackgroundImageChange = (url: string) => {
        onChange({ ...data, headingBackgroundImage: url });
    };

    const handleMediaSelect = (selection: any) => {
        const selected = Array.isArray(selection) ? selection[0] : selection;
        if (selected && typeof selected.url === 'string') {
            handleBackgroundImageChange(selected.url);
        }
        setIsMediaOpen(false);
    };

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
            <label className="flex flex-col gap-1 text-sm text-gray-600">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Heading Style</span>
                <Select
                    value={data.headingStyle || 'default'}
                    onChange={(val) => handleStyleChange((val as SectionHeadingStyle) || 'default')}
                    options={[
                        { value: 'default', label: 'Default' },
                        { value: 'banner', label: 'Banner with Background button' },
                    ]}
                    className="text-sm"
                />
            </label>

            {data.headingStyle === 'banner' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Background Color</span>
                        <ColorSelector
                            value={data.headingBackgroundColor || ''}
                            onChange={handleBackgroundColorChange}
                            placeholder="#ffffff"
                            label="Heading Background"
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Background Image</span>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
                                    {data.headingBackgroundImage ? (
                                        <img src={data.headingBackgroundImage} alt="Heading Background" className="h-full w-full rounded-lg object-cover" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <ImageActionButtons
                                        hasImage={Boolean(data.headingBackgroundImage)}
                                        selectLabel="Select Image"
                                        changeLabel="Change"
                                        removeLabel="Remove"
                                        onSelect={() => setIsMediaOpen(true)}
                                        onRemove={() => handleBackgroundImageChange('')}
                                    />
                                    <RevealableUrlInput
                                        value={data.headingBackgroundImage || ''}
                                        className="text-sm"
                                        inputSize="md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <MediaManager
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={handleMediaSelect}
                multiple={false}
                accept="image/*"
                title="Select Heading Background Image"
            />
        </div>
    );
};
