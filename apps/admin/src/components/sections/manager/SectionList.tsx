import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useSectionsManager, AdminSection } from '../../../hooks/useSectionsManager';
import { useToast } from '../../../contexts/ToastContext';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';
import { ReorderableTable, DragHandle, type ReorderableColumn } from '../../common/ReorderableTable';
import { Toggle } from '../../common/Toggle';
import { Dropdown } from '../../common/Dropdown';
import { FiRefreshCw, FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiCopy } from 'react-icons/fi';
import { SectionType } from '@shared/enums/section.enums';

interface SectionListProps {
    page: string;
    onPageChange: (page: string) => void;
}

/**
 * Get consistent badge color for each detail type
 */
const getBadgeColor = (detailKey: string): string => {
    const colorMap: Record<string, string> = {
        height: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        totalImages: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        autoplay: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        layout: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        limit: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        width: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
        category: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
        totalItems: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        totalMembers: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        totalBrands: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        videoUrl: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        columns: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        breakpoint: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    };

    return colorMap[detailKey] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
};

/**
 * Get badge color for section types
 */
const getSectionTypeBadgeColor = (sectionType: SectionType): string => {
    const colorMap: Record<SectionType, string> = {
        [SectionType.HERO_SLIDER]: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        [SectionType.PRODUCT_LIST]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        [SectionType.FEATURED_PRODUCTS]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        [SectionType.PRODUCTS_BY_CATEGORY]: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
        [SectionType.NEWS]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        [SectionType.CUSTOM_HTML]: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
        [SectionType.BANNER]: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
        [SectionType.SIDE_BANNERS]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
        [SectionType.TESTIMONIALS]: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        [SectionType.CTA]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        [SectionType.FEATURES]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        [SectionType.GALLERY]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        [SectionType.TEAM]: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
        [SectionType.CONTACT_FORM]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        [SectionType.VIDEO]: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        [SectionType.STATS]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        [SectionType.BRAND_SHOWCASE]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        [SectionType.WHY_CHOOSE_US]: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        [SectionType.PRODUCT_DETAILS]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        [SectionType.NEWS_DETAILS]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        [SectionType.SERVICE_LIST]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    };

    return colorMap[sectionType] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
};

/**
 * Extract section-specific details from config for display
 */
const getSectionDetails = (
    section: AdminSection,
    t: (key: string) => string,
    configOverride?: Record<string, unknown> | null,
): React.ReactNode[] => {
    const config = configOverride ? { ...(section.config || {}), ...configOverride } : (section.config || {});

    switch (section.type) {
        case SectionType.HERO_SLIDER: {
            const details: React.ReactNode[] = [];

            // Height
            if (typeof config.height === 'number') {
                details.push(
                    <span key="height" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('height')}`}>
                            {t('sections.manager.details.height')}
                        </span>
                        <span>{config.height}px</span>
                    </span>
                );
            }

            // Total slides/images
            const slides = Array.isArray(config.slides) ? config.slides : [];
            const totalSlides = slides.length;
            if (totalSlides > 0) {
                details.push(
                    <span key="images" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalImages')}`}>
                            {t('sections.manager.details.totalImages')}
                        </span>
                        <span>{totalSlides}</span>
                    </span>
                );
            }

            // Autoplay
            if (config.autoplay !== undefined) {
                details.push(
                    <span key="autoplay" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('autoplay')}`}>
                            {t('sections.manager.details.autoplay')}
                        </span>
                        <span>{config.autoplay ? t('common.yes') : t('common.no')}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.GALLERY: {
            const details: React.ReactNode[] = [];

            // Total images
            const images = Array.isArray(config.images) ? config.images : [];
            if (images.length > 0) {
                details.push(
                    <span key="images" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalImages')}`}>
                            {t('sections.manager.details.totalImages')}
                        </span>
                        <span>{images.length}</span>
                    </span>
                );
            }

            // Layout
            if (config.layout) {
                details.push(
                    <span key="layout" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('layout')}`}>
                            {t('sections.manager.details.layout')}
                        </span>
                        <span>{String(config.layout)}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.FEATURED_PRODUCTS: {
            const details: React.ReactNode[] = [];

            // Number of products
            if (typeof config.limit === 'number') {
                details.push(
                    <span key="limit" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('limit')}`}>
                            {t('sections.manager.details.limit')}
                        </span>
                        <span>{config.limit}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.PRODUCT_LIST: {
            const details: React.ReactNode[] = [];

            if (typeof config.pageSize === 'number') {
                details.push(
                    <span key="pageSize" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('limit')}`}>
                            {t('sections.manager.details.pageSize')}
                        </span>
                        <span>{config.pageSize}</span>
                    </span>
                );
            }

            if (typeof config.gridColumns === 'number') {
                details.push(
                    <span key="columns" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('columns')}`}>
                            {t('sections.manager.details.columns')}
                        </span>
                        <span>{config.gridColumns}</span>
                    </span>
                );
            }

            if (config.showSidebar !== undefined) {
                details.push(
                    <span key="sidebar" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('layout')}`}>
                            {t('sections.manager.details.sidebar')}
                        </span>
                        <span>{config.showSidebar ? t('common.yes') : t('common.no')}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.SIDE_BANNERS: {
            const details: React.ReactNode[] = [];
            if (typeof config.width === 'number') {
                details.push(
                    <span key="width" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('width')}`}>
                            {t('sections.manager.details.width')}
                        </span>
                        <span>{config.width}px</span>
                    </span>
                );
            }
            if (typeof config.height === 'number') {
                details.push(
                    <span key="height" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('height')}`}>
                            {t('sections.manager.details.height')}
                        </span>
                        <span>{config.height}px</span>
                    </span>
                );
            }
            const cards = Array.isArray(config.cards) ? config.cards : [];
            if (cards.length > 0) {
                details.push(
                    <span key="banners" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalItems')}`}>
                            {t('sections.manager.details.banners')}
                        </span>
                        <span>{cards.length}</span>
                    </span>
                );
            }
            if (typeof config.hideBelowBreakpoint === 'string') {
                details.push(
                    <span key="breakpoint" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('breakpoint')}`}>
                            {t('sections.manager.details.breakpoint')}
                        </span>
                        <span className="uppercase">{config.hideBelowBreakpoint}</span>
                    </span>
                );
            }
            return details;
        }

        case SectionType.PRODUCTS_BY_CATEGORY: {
            const details: React.ReactNode[] = [];

            // Category ID
            if (config.categoryId) {
                details.push(
                    <span key="category" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('category')}`}>
                            {t('sections.manager.details.category')}
                        </span>
                        <span>{String(config.categoryId)}</span>
                    </span>
                );
            }

            // Number of products
            if (typeof config.limit === 'number') {
                details.push(
                    <span key="limit" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('limit')}`}>
                            {t('sections.manager.details.limit')}
                        </span>
                        <span>{config.limit}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.TESTIMONIALS: {
            const details: React.ReactNode[] = [];

            // Total testimonials
            const testimonials = Array.isArray(config.testimonials) ? config.testimonials : [];
            if (testimonials.length > 0) {
                details.push(
                    <span key="items" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalItems')}`}>
                            {t('sections.manager.details.totalItems')}
                        </span>
                        <span>{testimonials.length}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.TEAM: {
            const details: React.ReactNode[] = [];

            // Total team members
            const members = Array.isArray(config.members) ? config.members : [];
            if (members.length > 0) {
                details.push(
                    <span key="members" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalMembers')}`}>
                            {t('sections.manager.details.totalMembers')}
                        </span>
                        <span>{members.length}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.FEATURES: {
            const details: React.ReactNode[] = [];

            // Total features
            const features = Array.isArray(config.features) ? config.features : [];
            if (features.length > 0) {
                details.push(
                    <span key="items" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalItems')}`}>
                            {t('sections.manager.details.totalItems')}
                        </span>
                        <span>{features.length}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.BANNER: {
            const details: React.ReactNode[] = [];

            // Layout/Grid
            if (config.layout) {
                details.push(
                    <span key="layout" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('layout')}`}>
                            {t('sections.manager.details.layout')}
                        </span>
                        <span>{String(config.layout)}</span>
                    </span>
                );
            }

            // Total banners
            const banners = Array.isArray(config.banners) ? config.banners : [];
            if (banners.length > 0) {
                details.push(
                    <span key="items" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalItems')}`}>
                            {t('sections.manager.details.totalItems')}
                        </span>
                        <span>{banners.length}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.STATS: {
            const details: React.ReactNode[] = [];

            // Total stats
            const stats = Array.isArray(config.stats) ? config.stats : [];
            if (stats.length > 0) {
                details.push(
                    <span key="items" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalItems')}`}>
                            {t('sections.manager.details.totalItems')}
                        </span>
                        <span>{stats.length}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.BRAND_SHOWCASE: {
            const details: React.ReactNode[] = [];

            // Total brands
            const brands = Array.isArray(config.brands) ? config.brands : [];
            if (brands.length > 0) {
                details.push(
                    <span key="brands" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalBrands')}`}>
                            {t('sections.manager.details.totalBrands')}
                        </span>
                        <span>{brands.length}</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.VIDEO: {
            const details: React.ReactNode[] = [];

            // Video source
            if (config.videoUrl) {
                const truncatedUrl = String(config.videoUrl).substring(0, 30);
                details.push(
                    <span key="video" className="inline-flex items-center gap-1 max-w-xs">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getBadgeColor('videoUrl')}`}>
                            {t('sections.manager.details.videoUrl')}
                        </span>
                        <span className="truncate">{truncatedUrl}...</span>
                    </span>
                );
            }

            return details;
        }

        case SectionType.WHY_CHOOSE_US: {
            const details: React.ReactNode[] = [];

            // Total cards
            const cards = Array.isArray(config.cards) ? config.cards : [];
            if (cards.length > 0) {
                details.push(
                    <span key="items" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('totalItems')}`}>
                            {t('sections.manager.details.totalItems')}
                        </span>
                        <span>{cards.length}</span>
                    </span>
                );
            }

            // Number of columns
            if (typeof config.columns === 'number') {
                details.push(
                    <span key="columns" className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor('columns')}`}>
                            {t('sections.manager.details.columns')}
                        </span>
                        <span>{config.columns}</span>
                    </span>
                );
            }

            return details;
        }

        default:
            return [];
    }
};

export const SectionList: React.FC<SectionListProps> = ({ page, onPageChange }) => {
    const { t } = useTranslationWithBackend();
    const navigate = useNavigate();
    const { sections, languages, sectionsQuery, languagesQuery, updateSection, deleteSection, reorderSections, cloneSection } = useSectionsManager(page);
    const { addToast } = useToast();
    const [localSections, setLocalSections] = useState<AdminSection[]>([]);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const pageOptions = useMemo(() => [
        { value: 'home', label: t('sections.pages.home') },
        { value: 'news', label: t('sections.pages.news') },
        { value: 'product', label: t('sections.pages.product') },
        { value: 'product_detail', label: t('sections.pages.product_detail') },
        { value: 'news_detail', label: t('sections.pages.news_detail') },
    ], [t]);

    useEffect(() => {
        const sorted = [...sections].sort((a, b) => a.position - b.position);
        setLocalSections(sorted);
    }, [sections]);

    const defaultLanguage = useMemo(() => languages.find((language) => language.isDefault)?.code || languages[0]?.code || 'en', [languages]);

    const handleEditNavigate = useCallback((section: AdminSection) => {
        navigate(`/sections/${section.page}/${section.id}/edit`);
    }, [navigate]);

    const handleDelete = async (section: AdminSection) => {
        if (!window.confirm(t('sections.manager.deleteConfirm'))) {
            return;
        }
        try {
            await deleteSection.mutateAsync({ id: section.id });
            addToast({ type: 'success', title: t('sections.manager.sectionDeleted'), description: t('sections.manager.sectionRemoved', { sectionType: t(`sections.types.${section.type}`) }) });
        } catch (error: any) {
            addToast({ type: 'error', title: t('sections.manager.deleteFailed'), description: error.message || t('sections.manager.unableToDelete') });
        }
    };

    const handleClone = async (section: AdminSection) => {
        try {
            await cloneSection.mutateAsync({ id: section.id });
            addToast({ type: 'success', title: t('sections.manager.sectionCloned'), description: t('sections.manager.sectionCloned') });
        } catch (error: any) {
            addToast({ type: 'error', title: t('sections.manager.cloneFailed'), description: error.message || t('sections.manager.cloneFailed') });
        }
    };

    const handleToggleEnabled = async (section: AdminSection, isEnabled: boolean) => {
        try {
            await updateSection.mutateAsync({ id: section.id, data: { isEnabled } });
            addToast({ type: 'success', title: t('sections.manager.sectionUpdated'), description: t(`sections.manager.section${isEnabled ? 'Enabled' : 'Disabled'}`, { sectionType: t(`sections.types.${section.type}`) }) });
        } catch (error: any) {
            addToast({ type: 'error', title: t('sections.manager.updateFailed'), description: error.message || t('sections.manager.unableToUpdateStatus') });
        }
    };

    const handleReorder = async (newOrder: AdminSection[]) => {
        setLocalSections(newOrder);
        try {
            await reorderSections.mutateAsync({
                page,
                sections: newOrder.map((section, index) => ({ id: section.id, position: index })),
            });
            addToast({ type: 'success', title: t('sections.manager.orderUpdated'), description: t('sections.manager.sectionOrderSaved') });
        } catch (error: any) {
            addToast({ type: 'error', title: t('sections.manager.reorderFailed'), description: error.message || t('sections.manager.unableToReorder') });
        }
    };

    const resetDragState = useCallback(() => {
        setDraggedId(null);
        setDragOverId(null);
    }, []);

    const handleRowDragStart = useCallback((event: React.DragEvent<HTMLTableRowElement>, sectionId: string) => {
        if (reorderSections.isPending) {
            event.preventDefault();
            return;
        }
        setDraggedId(sectionId);
        setDragOverId(sectionId);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', sectionId);
    }, [reorderSections.isPending]);

    const handleRowDragOver = useCallback((event: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
        event.preventDefault();
        if (!draggedId || draggedId === targetId) {
            return;
        }
        setDragOverId(targetId);
    }, [draggedId]);

    const handleRowDrop = useCallback((event: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
        event.preventDefault();
        if (!draggedId || draggedId === targetId) {
            resetDragState();
            return;
        }

        const sourceIndex = localSections.findIndex((section) => section.id === draggedId);
        const targetIndex = localSections.findIndex((section) => section.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) {
            resetDragState();
            return;
        }

        const updated = [...localSections];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);
        void handleReorder(updated);
        resetDragState();
    }, [draggedId, localSections, handleReorder, resetDragState]);

    const handleRowDragLeave = useCallback((targetId: string) => {
        if (dragOverId === targetId) {
            setDragOverId(null);
        }
    }, [dragOverId]);

    const handleRowDragEnd = useCallback(() => {
        resetDragState();
    }, [resetDragState]);

    const isLoading = sectionsQuery.isLoading || languagesQuery.isLoading;

    const sectionColumns = useMemo<ReorderableColumn<AdminSection>[]>(() => [
        {
            id: 'section',
            header: t('sections.manager.tableHeaders.title'),
            accessor: (section, index) => {
                const translation = section.translations.find((trans) => trans.locale === defaultLanguage) || section.translations[0];
                return (
                    <div className="flex items-center gap-3">
                        <DragHandle
                            aria-label={`Reorder ${t(`sections.types.${section.type}`)}`}
                            disabled={reorderSections.isPending}
                            isDragging={draggedId === section.id}
                            label={index + 1}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{translation?.title || '—'}</span>
                            <span className="text-xs text-gray-500">{(translation?.locale || defaultLanguage).toUpperCase()}</span>
                        </div>
                    </div>
                );
            },
            hideable: false,
        },
        {
            id: 'type',
            header: t('sections.manager.tableHeaders.type'),
            accessor: (section) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getSectionTypeBadgeColor(section.type)}`}>
                    {t(`sections.types.${section.type}`)}
                </span>
            ),
            hideable: true,
        },
        {
            id: 'details',
            header: t('sections.manager.tableHeaders.details'),
            accessor: (section) => {
                const translation = section.translations.find((trans) => trans.locale === defaultLanguage) || section.translations[0];
                const details = getSectionDetails(section, t, (translation?.configOverride as Record<string, unknown>) || undefined);
                if (details.length === 0) {
                    return <span className="text-xs text-gray-400">—</span>;
                }

                // Determine grid columns based on number of details
                const gridCols = details.length > 5 ? 'grid-cols-2' : 'grid-cols-1';

                return (
                    <div className={`grid ${gridCols} gap-y-1.5 gap-x-4 text-xs text-gray-600`}>
                        {details.map((detail, index) => (
                            <div key={index} className="whitespace-nowrap">
                                {detail}
                            </div>
                        ))}
                    </div>
                );
            },
            hideable: true,
        },
        {
            id: 'status',
            header: t('sections.manager.tableHeaders.enabled'),
            accessor: (section) => (
                <Toggle
                    data-drag-ignore
                    checked={section.isEnabled}
                    onChange={(checked) => handleToggleEnabled(section, checked)}
                    size="sm"
                    aria-label={`Toggle ${t(`sections.types.${section.type}`)}`}
                />
            ),
            align: 'center',
            hideable: false,
        },
        {
            id: 'updatedAt',
            header: t('sections.manager.tableHeaders.updated'),
            accessor: 'updatedAt',
            type: 'datetime',
            hideable: true,
        },
        {
            id: 'actions',
            header: t('sections.manager.tableHeaders.actions'),
            accessor: (section) => (
                <Dropdown
                    button={
                        <Button variant="ghost" size="sm" data-drag-ignore>
                            <FiMoreVertical className="w-4 h-4" />
                        </Button>
                    }
                    items={[
                        {
                            label: t('sections.manager.edit'),
                            icon: <FiEdit className="w-4 h-4" />,
                            onClick: () => handleEditNavigate(section),
                        },
                        {
                            label: t('sections.manager.clone'),
                            icon: <FiCopy className="w-4 h-4" />,
                            onClick: () => handleClone(section),
                        },
                        {
                            label: t('sections.manager.delete'),
                            icon: <FiTrash2 className="w-4 h-4" />,
                            onClick: () => handleDelete(section),
                            className: 'text-red-600 dark:text-red-400',
                        },
                    ]}
                />
            ),
            align: 'right',
            hideable: false,
        },
    ], [t, defaultLanguage, reorderSections.isPending, draggedId, handleToggleEnabled, handleEditNavigate, handleDelete]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-end gap-3">
                    <Select
                        label={t('sections.manager.form.page')}
                        value={page}
                        onChange={onPageChange}
                        options={pageOptions}
                    />
                    <Button
                        variant="ghost"
                        size="md"
                        onClick={() => sectionsQuery.refetch()}
                        startIcon={<FiRefreshCw className="w-4 h-4" />}
                    >
                        {t('sections.manager.refresh')}
                    </Button>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate(`/sections/${page}/create`)}
                    startIcon={<FiPlus className="w-4 h-4" />}
                >
                    {t('sections.manager.newSection')}
                </Button>
            </div>

            <ReorderableTable<AdminSection>
                tableId="sections-table"
                columns={sectionColumns}
                data={localSections}
                isLoading={isLoading}
                emptyMessage={t('sections.manager.noSections')}
                showColumnVisibility={false}
                showSearch={false}
                showFilter={false}
                enableRowHover={true}
                density="normal"
                dragState={{
                    disabled: reorderSections.isPending,
                    draggedId,
                    dragOverId,
                }}
                onDragStart={(event, section, _index) => handleRowDragStart(event, section.id)}
                onDragOver={(event, section, _index) => handleRowDragOver(event, section.id)}
                onDrop={(event, section, _index) => handleRowDrop(event, section.id)}
                onDragLeave={(_event, section, _index) => handleRowDragLeave(section.id)}
                onDragEnd={(_event, _section, _index) => {
                    handleRowDragEnd();
                }}
            />
        </div>
    );
};
