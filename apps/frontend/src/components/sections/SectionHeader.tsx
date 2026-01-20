import React from 'react';
import Link from 'next/link';
import { cn } from '../../utils/cn';
import { ArrowRight } from 'lucide-react';

export type SectionHeadingStyle = 'default' | 'banner' | 'curved';
export type SectionHeadingTextTransform = 'none' | 'uppercase' | 'capitalize' | 'lowercase';
export type SectionHeadingTitleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SectionHeaderProps {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaLabel?: string;
    ctaLink?: string;
    headingStyle?: SectionHeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
    headingTextTransform?: SectionHeadingTextTransform;
    headingTitleSize?: SectionHeadingTitleSize;
    headingBarHeight?: number;
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
    headingTextColor,
    headingTextTransform,
    headingTitleSize,
    headingBarHeight,
    className,
    theme,
}) => {
    // Determine effective text colors based on theme
    const isDarkTheme = theme === 'dark';
    const headingTextStyle = headingTextColor ? { color: headingTextColor } : undefined;
    const headingTransformStyle =
        headingTextTransform && headingTextTransform !== 'none' ? { textTransform: headingTextTransform } : undefined;

    const mergeStyles = (base?: React.CSSProperties, extra?: React.CSSProperties) => {
        if (base && extra) return { ...base, ...extra };
        return base || extra;
    };

    const titleSizeClassMap: Record<SectionHeadingTitleSize, string> = {
        xs: 'text-lg md:text-xl',
        sm: 'text-xl md:text-2xl',
        md: 'text-2xl md:text-3xl',
        lg: 'text-3xl md:text-4xl',
        xl: 'text-4xl md:text-5xl',
    };

    const resolvedTitleSize: SectionHeadingTitleSize =
        headingTitleSize || (headingStyle === 'banner' ? 'md' : 'lg');
    const titleSizeClass = titleSizeClassMap[resolvedTitleSize] || titleSizeClassMap.lg;

    // Helper to get text color classes
    const getTitleColor = () => {
        if (isDarkTheme) return "text-white";
        return "text-gray-900 dark:text-gray-100";
    };

    const getDescriptionColor = () => {
        if (isDarkTheme) return "text-gray-300";
        return "text-gray-600 dark:text-gray-400";
    };

    const getSubtitleColor = () => {
        if (isDarkTheme) return "text-blue-300";
        return "text-blue-600 dark:text-blue-400";
    };

    if (headingStyle === 'curved') {
        const titleStyle = mergeStyles(headingTextStyle, headingTransformStyle);
        const resolvedBarHeight = 4; // Height of the bottom border in px

        return (
            <div className={cn("mb-8 md:mb-10", className)}>
                <div className="flex items-end justify-between">
                    <div className="relative">
                        {/* The Tab Shape */}
                        <div
                            className="relative z-10 flex items-center px-6 py-2 rounded-tl-2xl rounded-tr-[2rem] ltr:rounded-tr-[2rem] rtl:rounded-tl-[2rem] rtl:rounded-tr-none"
                            style={{
                                backgroundColor: headingBackgroundColor || '#f97316', // Default to orange if not set
                                color: headingTextColor || '#ffffff',
                            }}
                        >
                            {title && (
                                <h2 className={cn('mb-0 font-bold uppercase text-white', titleSizeClass)} style={titleStyle}>
                                    {title}
                                </h2>
                            )}
                        </div>

                        {/* Curve smoothing element (optional visual polish, keeping it simple for now with rounded-tr-[2rem]) */}
                    </div>

                    {ctaLink && ctaLabel && (
                        <div className="mb-2">
                            <Link
                                href={ctaLink}
                                className={cn(
                                    "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                )}
                            >
                                {ctaLabel}
                                <span className="text-xs">-&gt;</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Full width bottom border */}
                <div
                    className="w-full"
                    style={{
                        height: `${resolvedBarHeight}px`,
                        backgroundColor: headingBackgroundColor || '#f97316',
                        marginTop: '-1px' // Overlap slightly to ensure seamless connection
                    }}
                />

                {description && (
                    <p className={cn(
                        "mt-4 text-lg",
                        getDescriptionColor()
                    )}>
                        {description}
                    </p>
                )}
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
                    <h2
                        className={cn(
                            "mb-0 font-bold",
                            titleSizeClass,
                            getTitleColor()
                        )}
                        style={mergeStyles(headingTextStyle, headingTransformStyle)}
                    >
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
                        "group inline-flex items-center gap-2 text-sm font-bold transition-colors",
                        isDarkTheme ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    )}
                    style={mergeStyles(headingTextStyle, headingTransformStyle)}
                >
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    );
};
