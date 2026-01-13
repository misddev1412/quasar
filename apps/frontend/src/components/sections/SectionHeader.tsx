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
    headingTextColor?: string;
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
    className,
    theme,
}) => {
    // Determine effective text colors based on theme
    const isDarkTheme = theme === 'dark';
    const headingTextStyle = headingTextColor ? { color: headingTextColor } : undefined;

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

    if (headingStyle === 'banner') {
        return (
            <div
                className={cn('mb-8 rounded-xl px-6 py-3 md:mb-10 md:px-10 md:py-4', className)}
                style={{
                    backgroundColor: headingBackgroundColor || '#f3f4f6',
                    minHeight: 56,
                }}
            >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-3xl" style={headingTextStyle}>
                        {subtitle && (
                            <p className="text-sm font-semibold uppercase tracking-wider">
                                {subtitle}
                            </p>
                        )}

                        {title && (
                        <h2 className="mb-0 text-2xl font-bold md:text-3xl" style={headingTextStyle}>
                            {title}
                        </h2>
                        )}

                        {description && (
                            <p className="text-base md:text-lg">
                                {description}
                            </p>
                        )}
                    </div>

                    {ctaLink && ctaLabel && (
                        <Link
                            href={ctaLink}
                            className={cn(
                                "inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                            )}
                            style={headingTextStyle}
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
                        <h2
                            className={cn(
                                "mb-0 text-3xl font-bold md:text-4xl",
                                getTitleColor()
                            )}
                            style={headingTextStyle}
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
                        "group inline-flex items-center gap-2 text-sm font-semibold transition-colors",
                        isDarkTheme ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    )}
                    style={headingTextStyle}
                >
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    );
};
