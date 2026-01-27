'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useMenu, MenuItem, MenuTranslation } from '../../hooks/useMenu';
import { MenuType } from '@shared/enums/menu.enums';
import { useSettings } from '../../hooks/useSettings';
import Container from '../common/Container';
import { UnifiedIcon } from '../common/UnifiedIcon';
import { Button } from '@heroui/react';

const BrandMenuBar: React.FC = () => {
    const { treeData, isLoading } = useMenu('brand_header');
    const locale = useLocale();

    const getLocalizedContent = (item: MenuItem | null | undefined, key: keyof MenuTranslation) => {
        if (!item) return '';
        const translation = item.translations?.find(t => t.locale === locale) ||
            item.translations?.find(t => t.locale === 'en');
        return (translation?.[key] as string) || '';
    };

    const { logoItem, textItem, buttonItems } = useMemo(() => {
        if (!treeData) return { logoItem: null, textItem: null, buttonItems: [] };

        // Helper to check for image in config
        const hasImage = (item: MenuItem) => {
            const img = item.config?.image;
            return typeof img === 'string' && img.length > 0;
        };

        const logo = treeData.find(
            (item) => (hasImage(item) && (item.type === MenuType.LINK || item.type === MenuType.BRAND)) || item.type === MenuType.LOGO
        );

        const text = treeData.find((item) => item.type === MenuType.CUSTOM_HTML);

        const buttons = treeData.filter(
            (item) => item.type === MenuType.CALL_BUTTON
        );

        return { logoItem: logo, textItem: text, buttonItems: buttons };
    }, [treeData]);

    // Use useSettings to get the asset URL if it's a LOGO type
    const { getSetting } = useSettings();
    const logoUrl = logoItem?.url || '/';

    const logoImage = useMemo(() => {
        if (!logoItem) return '';
        if (logoItem.type === MenuType.LOGO) {
            const assetKey = logoItem.config?.brandAssetKey as string || 'site.logo';
            return getSetting(assetKey) || '';
        }
        return (logoItem.config?.image as string) || '';
    }, [logoItem, getSetting]);

    const textContent = getLocalizedContent(textItem, 'customHtml') || getLocalizedContent(textItem, 'label');

    if (isLoading) {
        return null;
    }

    if (!logoItem && !textItem && buttonItems.length === 0) {
        return null;
    }

    const showLogoTitle = logoItem?.config?.showTitle !== false;

    return (
        <div className="w-full bg-[#FFBC00] dark:bg-yellow-600 text-gray-900 border-b border-yellow-600/20">
            <Container>
                <div className="flex flex-col md:flex-row items-center justify-between py-2 md:py-3 gap-4 md:gap-8 min-h-[80px]">

                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        {logoItem && (
                            <Link href={logoUrl} target={logoItem.target} className="flex items-center gap-3">
                                {logoImage ? (
                                    <img
                                        src={logoImage}
                                        alt={getLocalizedContent(logoItem, 'label') || 'Brand Logo'}
                                        className="h-12 md:h-16 object-contain"
                                    />
                                ) : (
                                    // Fallback if no image found but title is shown, or just empty
                                    null
                                )}
                                {showLogoTitle && (
                                    <span className="text-xl font-bold uppercase tracking-tight text-[#D32F2F]">
                                        {getLocalizedContent(logoItem, 'label') || 'Quasar'}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Text Section (Center) */}
                    {textItem && textContent && (
                        <div
                            className="flex-grow text-center px-4 [&_p]:m-0 [&_p]:leading-tight"
                            dangerouslySetInnerHTML={{ __html: textContent }}
                        />
                    )}

                    {/* Call Buttons Section (Right) */}
                    <div className="flex-shrink-0 flex flex-wrap justify-center items-center gap-3">
                        {buttonItems.map((btn) => {
                            const label = getLocalizedContent(btn, 'label');
                            const description = getLocalizedContent(btn, 'description');
                            const phone = (btn.config?.callButtonNumber as string) || btn.url || '';
                            const displayNumber = phone.replace('tel:', '');

                            const bgColor = btn.backgroundColor || '#0060AF';
                            const hoverColor = btn.backgroundColor ? btn.backgroundColor : '#004e90'; // Simplified hover for custom colors
                            const textColor = btn.textColor || '#ffffff';
                            const paddingY = btn.config?.paddingY ? `${btn.config.paddingY}px` : undefined;

                            return (
                                <Button
                                    key={btn.id}
                                    as={Link}
                                    href={phone.startsWith('tel:') ? phone : `tel:${phone}`}
                                    className="font-semibold rounded-full pl-2 pr-6 min-w-[180px] border-2 border-white/20 shadow-md transition-colors h-auto"
                                    style={{
                                        backgroundColor: bgColor,
                                        color: textColor,
                                        paddingTop: paddingY,
                                        paddingBottom: paddingY,
                                        ...(paddingY ? {} : { height: '3rem' }) // Fallback to h-12 (3rem) if no padding set
                                    }}
                                    startContent={
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/40 bg-white/10">
                                            <UnifiedIcon icon={btn.icon || 'phone'} size={18} color={textColor} />
                                        </div>
                                    }
                                >
                                    <div className="flex flex-col items-start leading-none py-1 gap-0.5">
                                        <span className="text-[11px] opacity-90 font-normal uppercase tracking-wide">
                                            {label}
                                        </span>
                                        <span className="text-lg font-bold">
                                            {displayNumber}
                                        </span>
                                    </div>
                                </Button>
                            );
                        })}
                    </div>

                </div>
            </Container>
        </div>
    );
};

export default BrandMenuBar;
