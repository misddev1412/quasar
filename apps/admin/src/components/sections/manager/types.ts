import { SectionType } from '@shared/enums/section.enums';

export interface SectionsManagerProps {
    page: string;
    onPageChange: (page: string) => void;
}

export interface SectionTranslationForm {
    title?: string;
    subtitle?: string;
    description?: string;
    heroDescription?: string;
    configOverride?: string;
}

export interface HeroSlideConfig {
    id?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    [key: string]: unknown;
}

export type BannerLinkType = 'custom' | 'category' | 'product';

export interface BannerCardLink {
    href?: string;
    label?: string;
    target?: '_self' | '_blank';
    type?: BannerLinkType;
    referenceId?: string;
}

export interface BannerCardConfig {
    id?: string;
    imageUrl?: string;
    link?: BannerCardLink;
}

export interface HeroSliderLocaleEditorProps {
    locale: string;
    config: Record<string, unknown>;
    onConfigChange: (nextConfig: Record<string, unknown>) => void;
    hasParseError?: boolean;
}

export interface ProductOption {
    value: string;
    label: string;
    sku?: string | null;
    image?: string | null;
    priceLabel?: string | null;
    brandName?: string | null;
}

export interface CustomBrandSummary {
    id: string;
    name: string;
    description?: string | null;
    logo?: string | null;
}

export interface SectionFormState {
    page: string;
    type: SectionType;
    isEnabled: boolean;
    position?: number;
    config: Record<string, unknown>;
    translations: Record<string, SectionTranslationForm>;
}

export type ConfigChangeHandler = (value: Record<string, unknown>) => void;

export type SectionConfigEditorProps = {
    type: SectionType;
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
};

export interface SelectOption {
    label: string;
    value: string;
    [key: string]: any;
}
