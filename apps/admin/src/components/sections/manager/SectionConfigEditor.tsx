import React, { useState } from 'react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { Button } from '@admin/components/common/Button';
import { JsonEditor } from '@admin/components/common/JsonEditor';
import { SectionType } from '@shared/enums/section.enums';
import { SectionConfigEditorProps } from '@admin/components/sections/manager/types';

// Editors
import { HeroSliderConfigEditor } from '@admin/components/sections/manager/editors/HeroSliderConfigEditor';
import { ProductListEditor } from '@admin/components/sections/manager/editors/ProductListEditor';
import { FeaturedProductsConfigEditor } from '@admin/components/sections/manager/editors/FeaturedProductsEditor';
import { ProductsByCategoryConfigEditor } from '@admin/components/sections/manager/editors/ProductsByCategoryEditor';
import { NewsByCategoryEditor } from '@admin/components/sections/manager/editors/NewsByCategoryEditor';
import { CustomHtmlEditor } from '@admin/components/sections/manager/editors/CustomHtmlEditor';
import { BannerEditor } from '@admin/components/sections/manager/editors/BannerEditor';
import { SideBannersEditor } from '@admin/components/sections/manager/editors/SideBannersEditor';
import { TestimonialsEditor } from '@admin/components/sections/manager/editors/TestimonialsEditor';
import { CtaEditor } from '@admin/components/sections/manager/editors/CtaEditor';
import { FeaturesEditor } from '@admin/components/sections/manager/editors/FeaturesEditor';
import { GalleryEditor } from '@admin/components/sections/manager/editors/GalleryEditor';
import { TeamEditor } from '@admin/components/sections/manager/editors/TeamEditor';
import { ContactFormEditor } from '@admin/components/sections/manager/editors/ContactFormEditor';
import { VideoEditor } from '@admin/components/sections/manager/editors/VideoEditor';
import { StatsEditor } from '@admin/components/sections/manager/editors/StatsEditor';
import { BrandShowcaseEditor } from '@admin/components/sections/manager/editors/BrandShowcaseEditor';
import { WhyChooseUsEditor } from '@admin/components/sections/manager/editors/WhyChooseUsEditor';
import { ProductDetailsEditor } from '@admin/components/sections/manager/editors/ProductDetailsEditor';
import { ServiceListEditor } from '@admin/components/sections/manager/editors/ServiceListEditor';
import { IntroductionEditor } from '@admin/components/sections/manager/editors/IntroductionEditor';
import { VideoGridEditor } from '@admin/components/sections/manager/editors/VideoGridEditor';

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
            {type === SectionType.PRODUCT_LIST && <ProductListEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.FEATURED_PRODUCTS && <FeaturedProductsConfigEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.PRODUCTS_BY_CATEGORY && <ProductsByCategoryConfigEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.NEWS && <NewsByCategoryEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.CUSTOM_HTML && <CustomHtmlEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.BANNER && <BannerEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.SIDE_BANNERS && <SideBannersEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.TESTIMONIALS && <TestimonialsEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.CTA && <CtaEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.FEATURES && <FeaturesEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.GALLERY && <GalleryEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.TEAM && <TeamEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.CONTACT_FORM && <ContactFormEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.VIDEO && <VideoEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.VIDEO_GRID && <VideoGridEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.STATS && <StatsEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.BRAND_SHOWCASE && <BrandShowcaseEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.WHY_CHOOSE_US && <WhyChooseUsEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.PRODUCT_DETAILS && <ProductDetailsEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.PRODUCT_DETAILS && <ProductDetailsEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.SERVICE_LIST && <ServiceListEditor value={value || {}} onChange={onChange} />}
            {type === SectionType.INTRODUCTION && <IntroductionEditor value={value || {}} onChange={onChange} />}

            {![
                SectionType.HERO_SLIDER,
                SectionType.PRODUCT_LIST,
                SectionType.FEATURED_PRODUCTS,
                SectionType.PRODUCTS_BY_CATEGORY,
                SectionType.NEWS,
                SectionType.CUSTOM_HTML,
                SectionType.BANNER,
                SectionType.SIDE_BANNERS,
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
                SectionType.PRODUCT_DETAILS,
                SectionType.SERVICE_LIST,
                SectionType.INTRODUCTION,
                SectionType.VIDEO_GRID,
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
