import React from 'react';
import Link from 'next/link';
import { cn } from '../../utils/cn';
import { ArrowRight } from 'lucide-react';

export type SectionHeadingStyle = 'default' | 'banner';

export interface SectionHeaderProps {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaLabel?: string;
    ctaLink?: string;
    headingStyle?: SectionHeadingStyle;
    headingBackgroundColor?: string;
    headingBackgroundImage?: string;
    className?: string;
    theme?: 'light' | 'dark';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    description,
    ctaLabel,
    ctaLink,
    headingStyle = 'default',
    headingBackgroundColor,
    headingBackgroundImage,
    className,
    theme,
}) => {
    // Determine effective text colors based on theme or background image
    const isDarkTheme = theme === 'dark';
    const hasBackgroundImage = Boolean(headingBackgroundImage);

    // Banner style overrides theme if background image is present (forces white text)
    // Default style uses theme if provided, otherwise system dark mode

    // Helper to get text color classes
    const getTitleColor = () => {
        if (headingStyle === 'banner' && hasBackgroundImage) return "text-white";
        if (isDarkTheme) return "text-white";
        return "text-gray-900 dark:text-gray-100";
    };

    const getDescriptionColor = () => {
        if (headingStyle === 'banner' && hasBackgroundImage) return "text-white/80";
        if (isDarkTheme) return "text-gray-300";
        return "text-gray-600 dark:text-gray-400";
    };

    const getSubtitleColor = () => {
        if (headingStyle === 'banner' && hasBackgroundImage) return "text-white/90";
        if (isDarkTheme) return "text-blue-300";
        return "text-blue-600 dark:text-blue-400";
    };

    if (headingStyle === 'banner') {
        return (
            <div
                className={cn('relative mb-10 overflow-hidden rounded-2xl px-6 py-12 md:px-12 md:py-16 text-center', className)}
                style={{
                    backgroundColor: headingBackgroundColor || '#f3f4f6',
                    backgroundImage: headingBackgroundImage ? `url(${headingBackgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay for better text readability if background image is present */}
                {headingBackgroundImage && (
                    <div className="absolute inset-0 bg-black/40" />
                )}

                <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                    {subtitle && (
                        <p className={cn(
                            "text-sm font-semibold uppercase tracking-wider",
                            getSubtitleColor()
                        )}>
                            {subtitle}
                        </p>
                    )}

                    {title && (
                        <h2 className={cn(
                            "text-3xl font-bold md:text-4xl",
                            getTitleColor()
                        )}>
                            {title}
                        </h2>
                    )}

                    {description && (
                        <p className={cn(
                            "max-w-2xl text-lg",
                            getDescriptionColor()
                        )}>
                            {description}
                        </p>
                    )}

                    {ctaLink && ctaLabel && (
                        <Link
                            href={ctaLink}
                            className={cn(
                                "mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all hover:gap-3",
                                headingBackgroundImage
                                    ? "bg-white text-gray-900 hover:bg-white/90"
                                    : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90"
                            )}
                        >
                            {ctaLabel}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("mb-8 md:mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
            <div className="max-w-3xl">
                {subtitle && (
                    <p className={cn(
                        "mb-2 text-sm font-bold uppercase tracking-widest",
                        getSubtitleColor()
                    )}>
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 className={cn(
                        "text-3xl font-bold md:text-4xl",
                        getTitleColor()
                    )}>
                        {title}
                    </h2>
                )}
                {description && (
                    <p className={cn(
                        "mt-3 text-lg",
                        getDescriptionColor()
                    )}>
                        {description}
                    </p>
                )}
            </div>

            {ctaLink && ctaLabel && (
                <Link
                    href={ctaLink}
                    className={cn(
                        "group inline-flex items-center gap-2 text-sm font-semibold transition-colors",
                        isDarkTheme ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    )}
                >
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    );
};
