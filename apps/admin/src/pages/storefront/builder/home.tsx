import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiHome, FiLayout, FiRefreshCw, FiSave } from 'react-icons/fi';
import { BaseLayout } from '@admin/components/layout';
import { withAdminSeo } from '@admin/components/SEO';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useSectionsManager } from '@admin/hooks/useSectionsManager';
import { SectionForm } from '@admin/components/sections/manager/SectionForm';
import { Button } from '@admin/components/common/Button';
import { useToast } from '@admin/contexts/ToastContext';
import type { HomeBuilderSectionState } from '@admin/types/storefront-builder';
import type { BuilderSyncDraftMessage } from '@shared/types/storefront-builder.types';
import {
  buildReorderInput,
  buildSectionUpdateInput,
  createBuilderSections,
  getUpdateTasks,
  isAllowedOrigin,
  parseBuilderSelectSectionMessage,
  toDraftSectionState,
} from '@admin/utils/storefront-home-builder';

const HOME_PAGE = 'home';

const StorefrontHomeBuilderPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const { sections, sectionsQuery, languages, languagesQuery, updateSection, reorderSections } = useSectionsManager(HOME_PAGE);

  const [draftSections, setDraftSections] = useState<HomeBuilderSectionState[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [publishingErrors, setPublishingErrors] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const initialPreviewOrigin = useMemo(
    () => (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, ''),
    [],
  );
  const [previewOrigin, setPreviewOrigin] = useState(initialPreviewOrigin);

  useEffect(() => {
    if (initialPreviewOrigin || typeof window === 'undefined') {
      return;
    }
    setPreviewOrigin(window.location.origin.replace(/\/$/, ''));
  }, [initialPreviewOrigin]);

  useEffect(() => {
    if (sectionsQuery.isLoading) {
      return;
    }
    const nextSections = createBuilderSections(sections);
    setDraftSections(nextSections);
    setPublishingErrors({});
    if (nextSections.length > 0) {
      setSelectedSectionId((prev) => prev && nextSections.some((section) => section.id === prev) ? prev : nextSections[0].id);
    } else {
      setSelectedSectionId(null);
    }
  }, [sections, sectionsQuery.isLoading]);

  const orderedCurrentSectionIds = useMemo(
    () => [...sections].sort((a, b) => a.position - b.position).map((section) => section.id),
    [sections],
  );
  const orderedDraftSectionIds = useMemo(
    () => draftSections.map((section) => section.id),
    [draftSections],
  );

  const hasOrderChanged = useMemo(() => {
    if (orderedCurrentSectionIds.length !== orderedDraftSectionIds.length) {
      return true;
    }
    return orderedCurrentSectionIds.some((id, index) => id !== orderedDraftSectionIds[index]);
  }, [orderedCurrentSectionIds, orderedDraftSectionIds]);

  const updateTasks = useMemo(() => getUpdateTasks(sections, draftSections), [sections, draftSections]);
  const isDirty = hasOrderChanged || updateTasks.length > 0;

  const selectedSection = useMemo(
    () => draftSections.find((section) => section.id === selectedSectionId) || null,
    [draftSections, selectedSectionId],
  );

  const previewUrl = useMemo(() => {
    if (!previewOrigin) {
      return '';
    }
    const base = previewOrigin.replace(/\/$/, '');
    const adminOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const query = adminOrigin ? `?adminOrigin=${encodeURIComponent(adminOrigin)}` : '';
    return `${base}/preview/home-builder${query}`;
  }, [previewOrigin]);

  const handleDraftSectionChange = useCallback((sectionId: string, nextSection: HomeBuilderSectionState) => {
    setDraftSections((prev) => prev.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }
      const merged = { ...nextSection, position: section.position };
      const sameSection = JSON.stringify(section.formState) === JSON.stringify(merged.formState)
        && section.isEnabled === merged.isEnabled
        && section.type === merged.type
        && section.page === merged.page;
      return sameSection ? section : merged;
    }));
    setPublishingErrors((prev) => {
      if (!prev[sectionId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  }, []);

  const handleDragStart = useCallback((sectionId: string) => {
    setDraggingId(sectionId);
  }, []);

  const handleDrop = useCallback((targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    setDraftSections((prev) => {
      const from = prev.findIndex((item) => item.id === draggingId);
      const to = prev.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((item, index) => ({ ...item, position: index }));
    });
    setDraggingId(null);
  }, [draggingId]);

  const resetDraft = useCallback(() => {
    const nextSections = createBuilderSections(sections);
    setDraftSections(nextSections);
    setPublishingErrors({});
    setSelectedSectionId(nextSections[0]?.id || null);
  }, [sections]);

  const syncPreview = useCallback(() => {
    if (!iframeRef.current?.contentWindow || !previewOrigin) {
      return;
    }
    const message: BuilderSyncDraftMessage = {
      type: 'BUILDER_SYNC_DRAFT',
      payload: {
        page: HOME_PAGE,
        selectedSectionId,
        draft: {
          page: HOME_PAGE,
          sections: draftSections.map(toDraftSectionState),
        },
      },
    };
    iframeRef.current.contentWindow.postMessage(message, previewOrigin);
  }, [draftSections, previewOrigin, selectedSectionId]);

  useEffect(() => {
    syncPreview();
  }, [syncPreview]);

  const handlePublish = useCallback(async () => {
    if (!isDirty || isPublishing) {
      return;
    }
    setIsPublishing(true);
    setPublishingErrors({});

    const nextErrors: Record<string, string> = {};
    const tasks = getUpdateTasks(sections, draftSections);

    for (const task of tasks) {
      try {
        await updateSection.mutateAsync(buildSectionUpdateInput(task.id, task.draft));
      } catch (error) {
        const message = error instanceof Error ? error.message : t('sections.manager.unableToUpdate', 'Unable to update');
        nextErrors[task.id] = message;
      }
    }

    if (Object.keys(nextErrors).length === 0) {
      try {
        await reorderSections.mutateAsync(buildReorderInput(HOME_PAGE, draftSections));
      } catch (error) {
        nextErrors._reorder = error instanceof Error ? error.message : t('sections.manager.unableToReorder', 'Unable to reorder');
      }
    }

    setPublishingErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      addToast({
        type: 'error',
        title: t('storefront.builder.publishFailed', 'Publish failed'),
        description: t('storefront.builder.publishFailedDescription', 'Some sections failed to update. Fix and publish again.'),
      });
      setIsPublishing(false);
      return;
    }

    await sectionsQuery.refetch();
    addToast({
      type: 'success',
      title: t('storefront.builder.publishSuccess', 'Published'),
      description: t('storefront.builder.publishSuccessDescription', 'Storefront home sections are now live.'),
    });
    setIsPublishing(false);
  }, [addToast, draftSections, isDirty, isPublishing, reorderSections, sections, sectionsQuery, t, updateSection]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!previewOrigin || event.source !== iframeRef.current?.contentWindow) {
        return;
      }
      if (!isAllowedOrigin(event.origin, previewOrigin)) {
        return;
      }
      const message = parseBuilderSelectSectionMessage(event.data);
      if (!message || message.payload.page !== HOME_PAGE) {
        return;
      }
      setSelectedSectionId(message.payload.sectionId);
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [previewOrigin]);

  const isLoading = sectionsQuery.isLoading || languagesQuery.isLoading;

  return (
    <BaseLayout
      title={t('storefront.builder.home.title', 'Storefront home builder')}
      description={t('storefront.builder.home.description', 'Reorder and edit homepage sections with live preview before publishing.')}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
          icon: <FiHome className="h-4 w-4" />,
        },
        {
          label: t('storefront.builder.home.nav', 'Home builder'),
          icon: <FiLayout className="h-4 w-4" />,
        },
      ]}
      actions={[
        {
          label: t('storefront.builder.actions.reset', 'Reset'),
          onClick: resetDraft,
          icon: <FiRefreshCw />,
          disabled: !isDirty || isPublishing,
        },
        {
          label: t('storefront.builder.actions.publish', 'Publish'),
          onClick: handlePublish,
          primary: true,
          icon: <FiSave />,
          disabled: !isDirty || isPublishing,
        },
      ]}
    >
      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          {t('common.loading', 'Loading...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {t('storefront.builder.sectionsTitle', 'Home sections')}
                </h3>
                <span className="text-xs text-gray-500">{draftSections.length}</span>
              </div>
              <div className="space-y-2">
                {draftSections.map((section) => {
                  const title = section.formState.translations?.vi?.title
                    || section.formState.translations?.en?.title
                    || section.type;
                  const isSelected = selectedSectionId === section.id;
                  const hasError = Boolean(publishingErrors[section.id]);
                  return (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => handleDragStart(section.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(section.id)}
                      onClick={() => setSelectedSectionId(section.id)}
                      className={[
                        'cursor-pointer rounded-lg border px-3 py-2 transition-colors',
                        isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50',
                        draggingId === section.id ? 'opacity-50' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-gray-900">{title}</p>
                        <span className="text-xs text-gray-500">{section.position + 1}</span>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{section.type}</p>
                      {hasError && (
                        <p className="mt-1 text-xs text-red-600">{publishingErrors[section.id]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {publishingErrors._reorder && (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {publishingErrors._reorder}
                </p>
              )}
            </div>

            {selectedSection && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SectionForm
                  languages={languages}
                  initialState={selectedSection.formState}
                  onSubmit={async () => Promise.resolve()}
                  onCancel={() => setSelectedSectionId(null)}
                  onChange={(nextFormState) => {
                    handleDraftSectionChange(selectedSection.id, {
                      ...selectedSection,
                      page: nextFormState.page,
                      type: nextFormState.type,
                      isEnabled: nextFormState.isEnabled,
                      config: nextFormState.config,
                      translations: nextFormState.translations,
                      formState: nextFormState,
                    });
                  }}
                  submitLabel={t('common.save', 'Save')}
                  isSubmitting={false}
                  showActions={false}
                  formId={`home-builder-form-${selectedSection.id}`}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {previewOrigin ? (
              <iframe
                ref={iframeRef}
                key={previewUrl}
                title="Storefront home builder preview"
                src={previewUrl}
                className="h-[calc(100vh-220px)] min-h-[720px] w-full rounded-lg border border-gray-100"
                onLoad={syncPreview}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                {t('storefront.builder.previewMissingOrigin', 'Set NEXT_PUBLIC_SITE_URL to enable live preview.')}
              </div>
            )}
          </div>
        </div>
      )}

      {isPublishing && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {t('storefront.builder.publishing', 'Publishing...')}
        </div>
      )}
    </BaseLayout>
  );
};

export default withAdminSeo(StorefrontHomeBuilderPage, {
  title: 'Storefront home builder | Quasar Admin',
  description: 'Reorder and edit storefront home sections in a draft preview before publishing.',
  path: '/storefront/builder/home',
});
