import { useMemo } from 'react';
import { trpc } from '@admin/utils/trpc';
import { SECTION_TYPE_LABELS, SectionType } from '@shared/enums/section.enums';
import { ApiResponse } from '@backend/trpc/schemas/response.schemas';

export interface AdminSectionTranslation {
  id: string;
  locale: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  heroDescription?: string | null;
  configOverride?: Record<string, unknown> | null;
}

export interface AdminSection {
  id: string;
  page: string;
  type: SectionType;
  position: number;
  isEnabled: boolean;
  config: Record<string, unknown>;
  translations: AdminSectionTranslation[];
  updatedAt: string;
  version: number;
  components?: SectionComponentSummary[];
}

export interface SectionComponentSummary {
  id: string;
  componentKey: string;
  displayName: string;
  parentId?: string | null;
}

export interface ActiveLanguage {
  id: string;
  code: string;
  name: string;
  isDefault?: boolean;
}

type SectionsApiResponse = ApiResponse<AdminSection[]>;
type LanguagesApiResponse = ApiResponse<ActiveLanguage[]>;
type SectionsStatsResponse = ApiResponse<{
  totalSections: number;
  enabledSections: number;
  disabledSections: number;
  totalTypes: number;
}>;

export interface SectionsManagerFilters {
  search?: string;
  type?: SectionType;
  isEnabled?: boolean;
}

export const useSectionsManager = (page: string, filters?: SectionsManagerFilters) => {
  const utils = trpc.useContext();
  const listAllInput = useMemo(() => ({
    page,
    search: filters?.search || undefined,
    type: filters?.type || undefined,
    isEnabled: typeof filters?.isEnabled === 'boolean' ? filters.isEnabled : undefined,
  }), [page, filters?.search, filters?.type, filters?.isEnabled]);

  const sectionsQuery = trpc.sections.listAll.useQuery<SectionsApiResponse>(
    listAllInput,
    { enabled: Boolean(page) },
  );

  const languagesQuery = trpc.adminLanguage.getActiveLanguages.useQuery<LanguagesApiResponse>(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const sectionsStatsQuery = trpc.sections.stats.useQuery<SectionsStatsResponse>(
    listAllInput,
    { enabled: Boolean(page) },
  );

  const sections = useMemo<AdminSection[]>(() => {
    const response = sectionsQuery.data;
    if (!response || !response.data) {
      return [];
    }
    return response.data as unknown as AdminSection[];
  }, [sectionsQuery.data]);

  const languages = useMemo<ActiveLanguage[]>(() => {
    const response = languagesQuery.data;
    if (!response || !response.data) {
      return [];
    }
    return response.data as unknown as ActiveLanguage[];
  }, [languagesQuery.data]);

  const sectionsStats = useMemo(() => {
    const response = sectionsStatsQuery.data;
    if (!response || !response.data) {
      return {
        totalSections: 0,
        enabledSections: 0,
        disabledSections: 0,
        totalTypes: 0,
      };
    }
    return response.data;
  }, [sectionsStatsQuery.data]);

  const createSection = trpc.sections.create.useMutation({
    onSuccess: () => {
      utils.sections.listAll.invalidate(listAllInput);
      utils.sections.stats.invalidate(listAllInput);
    },
  });

  const updateSection = trpc.sections.update.useMutation({
    onSuccess: () => {
      utils.sections.listAll.invalidate(listAllInput);
      utils.sections.stats.invalidate(listAllInput);
    },
  });

  const deleteSection = trpc.sections.delete.useMutation({
    onSuccess: () => {
      utils.sections.listAll.invalidate(listAllInput);
      utils.sections.stats.invalidate(listAllInput);
    },
  });

  const reorderSections = trpc.sections.reorder.useMutation({
    onSuccess: () => {
      utils.sections.listAll.invalidate(listAllInput);
      utils.sections.stats.invalidate(listAllInput);
    },
  });

  const cloneSection = trpc.sections.clone.useMutation({
    onSuccess: () => {
      utils.sections.listAll.invalidate(listAllInput);
      utils.sections.stats.invalidate(listAllInput);
    },
  });

  return {
    sections,
    sectionsQuery,
    sectionsStats,
    sectionsStatsQuery,
    languages,
    languagesQuery,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    cloneSection,
    sectionTypeLabels: SECTION_TYPE_LABELS,
  };
};
