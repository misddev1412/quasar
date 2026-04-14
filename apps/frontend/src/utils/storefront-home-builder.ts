import type { BuilderSyncDraftMessage } from '@shared/types/storefront-builder.types';

export const parseBuilderSyncDraftMessage = (payload: unknown): BuilderSyncDraftMessage | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const message = payload as Partial<BuilderSyncDraftMessage>;
  if (message.type !== 'BUILDER_SYNC_DRAFT') {
    return null;
  }
  const rawPayload = message.payload;
  if (!rawPayload || typeof rawPayload !== 'object') {
    return null;
  }

  const page = (rawPayload as { page?: unknown }).page;
  const selectedSectionId = (rawPayload as { selectedSectionId?: unknown }).selectedSectionId;
  const draft = (rawPayload as { draft?: unknown }).draft;

  if (typeof page !== 'string') {
    return null;
  }
  if (!(typeof selectedSectionId === 'string' || selectedSectionId === null || selectedSectionId === undefined)) {
    return null;
  }
  if (!draft || typeof draft !== 'object') {
    return null;
  }

  const draftPage = (draft as { page?: unknown }).page;
  const draftSections = (draft as { sections?: unknown }).sections;
  if (typeof draftPage !== 'string' || !Array.isArray(draftSections)) {
    return null;
  }

  return {
    type: 'BUILDER_SYNC_DRAFT',
    payload: {
      page,
      selectedSectionId: selectedSectionId ?? null,
      draft: {
        page: draftPage,
        sections: draftSections as BuilderSyncDraftMessage['payload']['draft']['sections'],
      },
    },
  };
};

export const isAllowedOrigin = (eventOrigin: string, allowedOrigin: string): boolean => {
  try {
    return new URL(eventOrigin).origin === new URL(allowedOrigin).origin;
  } catch {
    return false;
  }
};
