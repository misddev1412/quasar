import type { AdminSection, AdminSectionTranslation } from '@admin/hooks/useSectionsManager';
import { buildSectionPayload, sectionToFormState, safeParseJson } from '@admin/components/sections/manager/SectionForm';
import type {
  BuilderSelectSectionMessage,
  DraftSectionState,
} from '@shared/types/storefront-builder.types';
import type { HomeBuilderSectionState, HomeBuilderUpdateTask } from '@admin/types/storefront-builder';

const normalizeObject = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeObject);
  }
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const entries = Object.keys(source)
      .sort()
      .map((key) => [key, normalizeObject(source[key])]);
    return Object.fromEntries(entries);
  }
  return value;
};

const serializeComparable = (value: unknown): string => JSON.stringify(normalizeObject(value));

const toComparableTranslation = (translation: AdminSectionTranslation) => ({
  locale: translation.locale,
  title: translation.title ?? undefined,
  subtitle: translation.subtitle ?? undefined,
  description: translation.description ?? undefined,
  heroDescription: translation.heroDescription ?? undefined,
  configOverride: translation.configOverride ?? undefined,
});

const toComparableDraftTranslation = (
  locale: string,
  translation: DraftSectionState['translations'][string] | undefined,
) => ({
  locale,
  title: translation?.title || undefined,
  subtitle: translation?.subtitle || undefined,
  description: translation?.description || undefined,
  heroDescription: translation?.heroDescription || undefined,
  configOverride: translation?.configOverride ? safeParseJson(translation.configOverride) : undefined,
});

export const createBuilderSections = (sections: AdminSection[]): HomeBuilderSectionState[] => {
  return [...sections]
    .sort((a, b) => a.position - b.position)
    .map((section, index) => {
      const formState = sectionToFormState(section);
      return {
        id: section.id,
        page: formState.page,
        type: formState.type,
        isEnabled: formState.isEnabled,
        position: index,
        config: formState.config,
        translations: formState.translations,
        formState,
      };
    });
};

export const toDraftSectionState = (section: HomeBuilderSectionState): DraftSectionState => ({
  id: section.id,
  page: section.page,
  type: section.type,
  isEnabled: section.isEnabled,
  position: section.position,
  config: section.config,
  translations: section.translations,
});

export const hasSectionChanged = (current: AdminSection, draft: HomeBuilderSectionState): boolean => {
  const currentComparable = {
    page: current.page,
    type: current.type,
    isEnabled: current.isEnabled,
    config: current.config ?? {},
    translations: [...(current.translations || [])]
      .map(toComparableTranslation)
      .sort((a, b) => a.locale.localeCompare(b.locale)),
  };

  const draftComparable = {
    page: draft.formState.page,
    type: draft.formState.type,
    isEnabled: draft.formState.isEnabled,
    config: draft.formState.config ?? {},
    translations: Object.keys(draft.formState.translations || {})
      .sort((a, b) => a.localeCompare(b))
      .map((locale) => toComparableDraftTranslation(locale, draft.formState.translations[locale])),
  };

  return serializeComparable(currentComparable) !== serializeComparable(draftComparable);
};

export const getUpdateTasks = (
  currentSections: AdminSection[],
  draftSections: HomeBuilderSectionState[],
): HomeBuilderUpdateTask[] => {
  const currentById = new Map(currentSections.map((section) => [section.id, section]));
  return draftSections
    .map((draft) => {
      const current = currentById.get(draft.id);
      if (!current) {
        return null;
      }
      return hasSectionChanged(current, draft) ? { id: draft.id, current, draft } : null;
    })
    .filter((item): item is HomeBuilderUpdateTask => item !== null);
};

export const buildReorderInput = (page: string, draftSections: HomeBuilderSectionState[]) => ({
  page,
  sections: draftSections.map((section, index) => ({
    id: section.id,
    position: index,
  })),
});

export const parseBuilderSelectSectionMessage = (payload: unknown): BuilderSelectSectionMessage | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const message = payload as Partial<BuilderSelectSectionMessage>;
  if (message.type !== 'BUILDER_SELECT_SECTION') {
    return null;
  }
  const rawPayload = message.payload;
  if (!rawPayload || typeof rawPayload !== 'object') {
    return null;
  }
  const page = (rawPayload as { page?: unknown }).page;
  const sectionId = (rawPayload as { sectionId?: unknown }).sectionId;
  if (typeof page !== 'string') {
    return null;
  }
  if (!(typeof sectionId === 'string' || sectionId === null)) {
    return null;
  }
  return {
    type: 'BUILDER_SELECT_SECTION',
    payload: { page, sectionId },
  };
};

export const isAllowedOrigin = (eventOrigin: string, allowedOrigin: string): boolean => {
  try {
    return new URL(eventOrigin).origin === new URL(allowedOrigin).origin;
  } catch {
    return false;
  }
};

export const buildSectionUpdateInput = (sectionId: string, draft: HomeBuilderSectionState) => ({
  id: sectionId,
  data: buildSectionPayload(draft.formState),
});
