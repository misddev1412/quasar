import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useSectionsManager, AdminSection } from '../../../hooks/useSectionsManager';
import { useToast } from '../../../context/ToastContext';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';
import { ReorderableTable, DragHandle, type ReorderableColumn } from '../../common/ReorderableTable';
import { Toggle } from '../../common/Toggle';
import { Dropdown } from '../../common/Dropdown';
import { FiRefreshCw, FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiCopy } from 'react-icons/fi';

interface SectionListProps {
    page: string;
    onPageChange: (page: string) => void;
}

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
                <span className="text-sm font-medium text-gray-700">{t(`sections.types.${section.type}`)}</span>
            ),
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
