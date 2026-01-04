import React, { useState } from 'react';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { Button } from '../../common/Button';
import { JsonEditor } from '../../common/JsonEditor';
import { SectionType } from '@shared/enums/section.enums';
import { SectionConfigEditorProps } from './types';

// Editors
import { HeroSliderConfigEditor } from './editors/HeroSliderConfigEditor';
import { FeaturedProductsConfigEditor } from './editors/FeaturedProductsEditor';
import { ProductsByCategoryConfigEditor } from './editors/ProductsByCategoryEditor';
import { NewsByCategoryConfigEditor } from './editors/NewsByCategoryEditor';
import { CustomHtmlEditor } from './editors/CustomHtmlEditor';
import { BannerEditor } from './editors/BannerEditor';
import { TestimonialsEditor } from './editors/TestimonialsEditor';
import { CtaEditor } from './editors/CtaEditor';
import { FeaturesEditor } from './editors/FeaturesEditor';
import { GalleryEditor } from './editors/GalleryEditor';
import { TeamEditor } from './editors/TeamEditor';
import { ContactFormEditor } from './editors/ContactFormEditor';
import { VideoEditor } from './editors/VideoEditor';
import { StatsEditor } from './editors/StatsEditor';
import { BrandShowcaseEditor } from './editors/BrandShowcaseEditor';
import { WhyChooseUsEditor } from './editors/WhyChooseUsEditor';

export const SectionConfigEditor: React.FC<SectionConfigEditorProps> = ({ type, value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [jsonView, setJsonView] = useState(false);

    if (jsonView) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.rawJson')}</h4>
                    <Button variant="ghost" size="sm" onClick={() => setJsonView(false)}>
                        {t('sections.manager.visualEditor')}
                    </Button>
                </div>
                <div className="h-96 border rounded-md overflow-hidden">
                    <JsonEditor
                        value={JSON.stringify(value, null, 2)}
                        onChange={(val) => {
                            try {
                                const parsed = JSON.parse(val);
                                onChange(parsed);
                            } catch (e) {
                                // Ignore parse errors while typing
                            }
                        }}
                        readOnly={false}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.config.header')}</h4>
                <Button variant="ghost" size="sm" onClick={() => setJsonView(true)}>
                    {t('sections.manager.rawJson')}
                </Button>
            </div>

            {type === SectionType.HERO_SLIDER && <HeroSliderConfigEditor value={value} onChange={onChange} />}
            {type === SectionType.FEATURED_PRODUCTS && <FeaturedProductsConfigEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.PRODUCTS_BY_CATEGORY && <ProductsByCategoryConfigEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.NEWS && <NewsByCategoryConfigEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.CUSTOM_HTML && <CustomHtmlEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.BANNER && <BannerEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.TESTIMONIALS && <TestimonialsEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.CTA && <CtaEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.FEATURES && <FeaturesEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.GALLERY && <GalleryEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.TEAM && <TeamEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.CONTACT_FORM && <ContactFormEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.VIDEO && <VideoEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.STATS && <StatsEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.BRAND_SHOWCASE && <BrandShowcaseEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.WHY_CHOOSE_US && <WhyChooseUsEditor value={value || {}} onChange={onChange} />}

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
                SectionType.BRAND_SHOWCASE,
                SectionType.WHY_CHOOSE_US,
            ].includes(type) && (
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500">{t('sections.manager.configEditor.noDedicatedEditor')}</p>
                        <Button variant="ghost" size="sm" onClick={() => setJsonView(true)}>
                            {t('sections.manager.configEditor.openJsonEditor')}
                        </Button>
                    </div>
                )}
        </div>
    );
};
