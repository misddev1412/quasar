import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CreatePageTemplate } from '../../../../components/common/CreatePageTemplate';
import { SectionForm, SectionFormState, buildSectionPayload, sectionToFormState } from '../../../../components/sections/SectionsManager';
import { useSectionsManager, SectionComponentSummary } from '../../../../hooks/useSectionsManager';
import { useToast } from '../../../../contexts/ToastContext';

interface LinkedComponentNode extends SectionComponentSummary {
  children: LinkedComponentNode[];
}

const EditSectionPage: React.FC = () => {
  const { page = 'home', sectionId } = useParams<{ page?: string; sectionId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { sections, sectionsQuery, languages, languagesQuery, updateSection } = useSectionsManager(page);

  const section = sections.find((item) => item.id === sectionId);
  const linkedComponents = section?.components ?? [];
  const linkedComponentTree = useMemo<LinkedComponentNode[]>(() => {
    if (!linkedComponents.length) {
      return [];
    }

    const nodeMap = new Map<string, LinkedComponentNode>();
    const nodes = linkedComponents.map((component) => {
      const node: LinkedComponentNode = {
        ...component,
        parentId: component.parentId ?? null,
        children: [],
      };
      nodeMap.set(node.id, node);
      return node;
    });

    const roots: LinkedComponentNode[] = [];

    nodes.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [linkedComponents]);
  const initialState = useMemo<SectionFormState | null>(() => (section ? sectionToFormState(section) : null), [section]);

  const isLoading = sectionsQuery.isLoading || languagesQuery.isLoading;
  const errorState = sectionsQuery.error || languagesQuery.error || (!isLoading && !section ? { message: t('sections.manager.sectionNotFound') } : null);

  const renderLinkedComponent = (node: LinkedComponentNode, depth = 0): React.ReactElement => {
    const isChild = depth > 0;
    const linkClassName = isChild
      ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 hover:bg-neutral-100 transition-colors'
      : 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-neutral-200 px-4 py-3 hover:bg-neutral-50 transition-colors';

    return (
      <div key={node.id} className="space-y-2">
        <Link to={`/component-configs/${node.id}/edit`} className={linkClassName}>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{node.displayName}</p>
            <p className="text-xs text-neutral-500 truncate">{node.componentKey}</p>
          </div>
          <span className="text-xs font-medium text-primary-600">{t('common.edit', 'Edit')}</span>
        </Link>
        {node.children.length > 0 && (
          <div className="ml-4 border-l border-dashed border-neutral-200 pl-4 space-y-2">
            {node.children.map((child) => renderLinkedComponent(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleCancel = () => {
    navigate(`/sections/${page}`);
  };

  const handleSubmit = async (state: SectionFormState) => {
    if (!sectionId) return;
    try {
      await updateSection.mutateAsync({
        id: sectionId,
        data: buildSectionPayload(state),
      });
      addToast({
        type: 'success',
        title: t('sections.manager.sectionSaved'),
        description: t('sections.manager.changesApplied'),
      });
      navigate(`/sections/${state.page}`);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('sections.manager.updateFailed'),
        description: error?.message || t('sections.manager.unableToUpdate'),
      });
    }
  };

  return (
    <CreatePageTemplate
      title={t('sections.manager.modal.editTitle')}
      description={t('sections.manager.modal.description')}
      icon={<Layout className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('sections.manager.entityName', 'Section')}
      entityNamePlural={t('sections.manager.entityNamePlural', 'Sections')}
      backUrl={`/sections/${page}`}
      onBack={handleCancel}
      isSubmitting={updateSection.isPending}
      isLoading={isLoading}
      error={errorState}
      maxWidth="full"
      mode="update"
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('sections.manager.entityNamePlural', 'Sections'), onClick: handleCancel },
        { label: section ? (section.translations[0]?.title || t('sections.manager.edit', 'Edit')) : t('sections.manager.edit', 'Edit') },
      ]}
    >
      {initialState && languages.length > 0 && (
        <>
          {linkedComponents.length > 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {t('sections.manager.linkedComponents.title', 'Assigned components')}
                </p>
                <p className="text-xs text-neutral-500">
                  {t(
                    'sections.manager.linkedComponents.description',
                    'The defaults for this section come from the components below. Edit them directly to adjust configuration.',
                  )}
                </p>
              </div>
              <div className="space-y-2">
                {linkedComponentTree.map((node) => renderLinkedComponent(node))}
              </div>
            </div>
          )}
          <SectionForm
            languages={languages}
            initialState={initialState}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel={t('sections.manager.form.saveChanges')}
            isSubmitting={updateSection.isPending}
          />
        </>
      )}
    </CreatePageTemplate>
  );
};

export default EditSectionPage;
