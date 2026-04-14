import { SectionType } from '../enums/section.enums';

export interface DraftSectionTranslationState {
  title?: string;
  subtitle?: string;
  description?: string;
  heroDescription?: string;
  configOverride?: string;
}

export interface DraftSectionState {
  id: string;
  page: string;
  type: SectionType;
  isEnabled: boolean;
  position: number;
  config: Record<string, unknown>;
  translations: Record<string, DraftSectionTranslationState>;
}

export interface HomeBuilderDraftState {
  page: string;
  sections: DraftSectionState[];
}

export interface BuilderSyncDraftMessage {
  type: 'BUILDER_SYNC_DRAFT';
  payload: {
    page: string;
    draft: HomeBuilderDraftState;
    selectedSectionId?: string | null;
  };
}

export interface BuilderSelectSectionMessage {
  type: 'BUILDER_SELECT_SECTION';
  payload: {
    page: string;
    sectionId: string | null;
  };
}

export type BuilderMessage = BuilderSyncDraftMessage | BuilderSelectSectionMessage;
