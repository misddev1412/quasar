import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';
import { SectionForm, SectionFormState, buildSectionPayload } from '../../../components/sections/SectionsManager';
import { useSectionsManager } from '../../../hooks/useSectionsManager';
import { useToast } from '../../../contexts/ToastContext';
import { SectionType } from '@shared/enums/section.enums';

const CreateSectionPage: React.FC = () => {
  const { page = 'home' } = useParams<{ page?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { languages, languagesQuery, createSection } = useSectionsManager(page);

  const initialFormState = useMemo<SectionFormState>(() => ({
    page,
    type: SectionType.HERO_SLIDER,
    isEnabled: true,
    config: {},
    translations: {},
  }), [page]);

  const handleCancel = () => {
    navigate(`/sections/${page}`);
  };

  const handleSubmit = async (state: SectionFormState) => {
    try {
      await createSection.mutateAsync(buildSectionPayload(state));
      addToast({
        type: 'success',
        title: t('sections.manager.sectionCreated'),
        description: t('sections.manager.sectionAvailable'),
      });
      navigate(`/sections/${state.page}`);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('sections.manager.createFailed'),
        description: error?.message || t('sections.manager.unableToCreate'),
      });
    }
  };

  return (
    <CreatePageTemplate
      title={t('sections.manager.modal.createTitle')}
      description={t('sections.manager.modal.description')}
      icon={<Layout className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('sections.manager.entityName', 'Section')}
      entityNamePlural={t('sections.manager.entityNamePlural', 'Sections')}
      backUrl={`/sections/${page}`}
      onBack={handleCancel}
      isSubmitting={createSection.isPending}
      isLoading={languagesQuery.isLoading}
      error={languagesQuery.error}
      maxWidth="full"
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('sections.manager.entityNamePlural', 'Sections'), onClick: handleCancel },
        { label: t('sections.manager.newSection', 'New section') },
      ]}
    >
      {(!languagesQuery.isLoading || languages.length > 0) && (
        <SectionForm
          languages={languages}
          initialState={initialFormState}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={t('sections.manager.form.create')}
          isSubmitting={createSection.isPending}
        />
      )}
    </CreatePageTemplate>
  );
};

export default CreateSectionPage;
