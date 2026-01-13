import React from 'react';
import { ColorSelector } from '@admin/components/common/ColorSelector';
import { Select } from '@admin/components/common/Select';

export type SectionHeadingStyle = 'default' | 'banner';

export interface SectionHeadingConfigData {
    headingStyle?: SectionHeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
}

interface SectionHeadingConfigProps {
    data: SectionHeadingConfigData;
    onChange: (data: SectionHeadingConfigData) => void;
}

export const SectionHeadingConfig: React.FC<SectionHeadingConfigProps> = ({ data, onChange }) => {
    const handleStyleChange = (style: SectionHeadingStyle) => {
        onChange({ ...data, headingStyle: style });
    };

    const handleBackgroundColorChange = (color: string) => {
        onChange({ ...data, headingBackgroundColor: color });
    };

    const handleTextColorChange = (color: string) => {
        onChange({ ...data, headingTextColor: color });
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
                        { value: 'banner', label: 'Color Bar' },
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
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Text Color</span>
                        <ColorSelector
                            value={data.headingTextColor || ''}
                            onChange={handleTextColorChange}
                            placeholder="#111827"
                            label="Heading Text"
                            className="w-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
