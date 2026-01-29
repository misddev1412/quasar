import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
    CheckCircle2,
    AlertCircle,
    XCircle,
    Search,
    BarChart3,
    ArrowRight,
    Info
} from 'lucide-react';
import clsx from 'clsx';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';

interface SEORequirement {
    id: string;
    label: string;
    status: 'success' | 'warning' | 'error';
    message: string;
    importance: 'high' | 'medium' | 'low';
}

export const SEOChecklist: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const { watch } = useFormContext();

    // Watch common SEO fields
    const metaTitle = watch('metaTitle') || '';
    const metaDescription = watch('metaDescription') || '';
    const metaKeywords = watch('metaKeywords') || '';
    const slug = watch('slug') || '';
    const content = watch('content') || watch('description') || '';
    const featuredImage = watch('featuredImage');
    const media = watch('media');

    const wordCount = useMemo(() => {
        if (!content) return 0;
        // Strip HTML tags and count words
        const stripped = content.replace(/<[^>]*>?/gm, ' ');
        return stripped.trim().split(/\s+/).filter(Boolean).length;
    }, [content]);

    const requirements = useMemo((): SEORequirement[] => {
        const reqs: SEORequirement[] = [];

        // Meta Title
        if (!metaTitle) {
            reqs.push({
                id: 'title-presence',
                label: t('seo.requirements.title_presence', 'Meta Title Presence'),
                status: 'error',
                message: t('seo.tips.title_missing', 'Add a meta title to improve visibility.'),
                importance: 'high'
            });
        } else if (metaTitle.length < 50 || metaTitle.length > 60) {
            reqs.push({
                id: 'title-length',
                label: t('seo.requirements.title_length', 'Meta Title Length'),
                status: 'warning',
                message: t('seo.tips.title_length', 'Recommended length is 50-60 characters. Current: {{length}}', { length: metaTitle.length }),
                importance: 'medium'
            });
        } else {
            reqs.push({
                id: 'title-ok',
                label: t('seo.requirements.title_ok', 'Meta Title Optimization'),
                status: 'success',
                message: t('seo.tips.title_ok', 'Your meta title is well-optimized.'),
                importance: 'high'
            });
        }

        // Meta Description
        if (!metaDescription) {
            reqs.push({
                id: 'desc-presence',
                label: t('seo.requirements.desc_presence', 'Meta Description Presence'),
                status: 'error',
                message: t('seo.tips.desc_missing', 'Add a meta description to encourage clicks.'),
                importance: 'high'
            });
        } else if (metaDescription.length < 150 || metaDescription.length > 160) {
            reqs.push({
                id: 'desc-length',
                label: t('seo.requirements.desc_length', 'Meta Description Length'),
                status: 'warning',
                message: t('seo.tips.desc_length', 'Recommended length is 150-160 characters. Current: {{length}}', { length: metaDescription.length }),
                importance: 'medium'
            });
        } else {
            reqs.push({
                id: 'desc-ok',
                label: t('seo.requirements.desc_ok', 'Meta Description Optimization'),
                status: 'success',
                message: t('seo.tips.desc_ok', 'Your meta description is well-optimized.'),
                importance: 'high'
            });
        }

        // Slug
        if (!slug) {
            reqs.push({
                id: 'slug-presence',
                label: t('seo.requirements.slug_presence', 'Url Slug Presence'),
                status: 'error',
                message: t('seo.tips.slug_missing', 'A search-friendly URL is essential.'),
                importance: 'high'
            });
        } else if (/[A-Z]/.test(slug) || /\s/.test(slug) || /[^a-z0-9-]/.test(slug)) {
            reqs.push({
                id: 'slug-format',
                label: t('seo.requirements.slug_format', 'Url Slug Format'),
                status: 'warning',
                message: t('seo.tips.slug_format', 'Use lowercase and hyphens for a clean URL.'),
                importance: 'medium'
            });
        } else {
            reqs.push({
                id: 'slug-ok',
                label: t('seo.requirements.slug_ok', 'Url Slug Optimization'),
                status: 'success',
                message: t('seo.tips.slug_ok', 'Your URL is search-friendly.'),
                importance: 'high'
            });
        }

        // Content Length
        const minWords = watch('content') !== undefined ? 300 : 100; // Post vs Product estimate
        if (wordCount < minWords) {
            reqs.push({
                id: 'content-length',
                label: t('seo.requirements.content_length', 'Content Length'),
                status: 'warning',
                message: t('seo.tips.content_short', 'Content seems a bit short. Aim for at least {{min}} words.', { min: minWords }),
                importance: 'medium'
            });
        } else {
            reqs.push({
                id: 'content-ok',
                label: t('seo.requirements.content_ok', 'Content Depth'),
                status: 'success',
                message: t('seo.tips.content_ok', 'Your content has a good depth for SEO.'),
                importance: 'medium'
            });
        }

        // Images
        const hasImage = !!featuredImage || (media && Array.isArray(media) && media.some((m: any) => m.isPrimary || m.url));
        if (!hasImage) {
            reqs.push({
                id: 'image-presence',
                label: t('seo.requirements.image_presence', 'Visual Content'),
                status: 'warning',
                message: t('seo.tips.image_missing', 'Add at least one image to improve engagement.'),
                importance: 'medium'
            });
        } else {
            reqs.push({
                id: 'image-ok',
                label: t('seo.requirements.image_ok', 'Visual Content'),
                status: 'success',
                message: t('seo.tips.image_ok', 'Image present.'),
                importance: 'medium'
            });
        }

        // Keywords
        if (!metaKeywords || (typeof metaKeywords === 'string' && metaKeywords.trim() === '')) {
            reqs.push({
                id: 'keywords-presence',
                label: t('seo.requirements.keywords_presence', 'Keywords Presence'),
                status: 'warning',
                message: t('seo.tips.keywords_missing', 'Define keywords to help search engines understand your topic.'),
                importance: 'low'
            });
        } else {
            reqs.push({
                id: 'keywords-ok',
                label: t('seo.requirements.keywords_ok', 'Keywords Optimization'),
                status: 'success',
                message: t('seo.tips.keywords_ok', 'Keywords are defined.'),
                importance: 'low'
            });
        }

        return reqs;
    }, [metaTitle, metaDescription, slug, wordCount, featuredImage, media, metaKeywords, t, watch]);

    const score = useMemo(() => {
        if (requirements.length === 0) return 0;
        const points = requirements.reduce((acc, req) => {
            let val = 0;
            if (req.status === 'success') val = 1;
            else if (req.status === 'warning') val = 0.5;

            let multiplier = 1;
            if (req.importance === 'high') multiplier = 3;
            else if (req.importance === 'medium') multiplier = 2;

            return acc + (val * multiplier);
        }, 0);

        const maxPoints = requirements.reduce((acc, req) => {
            let multiplier = 1;
            if (req.importance === 'high') multiplier = 3;
            else if (req.importance === 'medium') multiplier = 2;
            return acc + multiplier;
        }, 0);

        return Math.round((points / maxPoints) * 100);
    }, [requirements]);

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-emerald-500 stroke-emerald-500';
        if (s >= 50) return 'text-amber-500 stroke-amber-500';
        return 'text-rose-500 stroke-rose-500';
    };

    const getScoreBg = (s: number) => {
        if (s >= 80) return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/50';
        if (s >= 50) return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800/50';
        return 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-800/50';
    };

    return (
        <div className="space-y-6">
            {/* Score Header */}
            <div className={clsx(
                "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                getScoreBg(score)
            )}>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            {t('seo.score_title', 'SEO Health Score')}
                        </h3>
                        <p className="text-sm opacity-80 max-w-xs">
                            {t('seo.score_description', 'Real-time evaluation of your content based on SEO best practices.')}
                        </p>
                    </div>

                    <div className="relative flex items-center justify-center">
                        {/* SVG Progress Circle */}
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-white/20 dark:text-white/5"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * score) / 100}
                                strokeLinecap="round"
                                className={clsx("transition-all duration-1000 ease-out", getScoreColor(score).split(' ')[1])}
                            />
                        </svg>
                        <span className={clsx("absolute text-2xl font-bold font-mono", getScoreColor(score).split(' ')[0])}>
                            {score}%
                        </span>
                    </div>
                </div>

                {/* Subtle background decoration */}
                <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
                    <Search size={120} />
                </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((req) => (
                    <div
                        key={req.id}
                        className="group flex items-start gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <div className="mt-1 flex-shrink-0">
                            {req.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            {req.status === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                            {req.status === 'error' && <XCircle className="w-5 h-5 text-rose-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                    {req.label}
                                </h4>
                                <div className={clsx(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                    req.importance === 'high' ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" :
                                        req.importance === 'medium' ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                                            "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                )}>
                                    {t(`seo.importance.${req.importance}`, req.importance)}
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                {req.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-900/30">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                    <Info size={16} />
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 leading-tight">
                    <p className="font-semibold mb-0.5">{t('seo.pro_tip_title', 'Pro Content Tip')}</p>
                    {t('seo.pro_tip_desc', 'Use the AI Content Generator to create optimized titles and descriptions automatically.')}
                </div>
            </div>
        </div>
    );
};
