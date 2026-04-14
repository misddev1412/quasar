import type { AdminSection } from '@admin/hooks/useSectionsManager';
import type { SectionFormState } from '@admin/components/sections/manager/types';
import type { DraftSectionState, HomeBuilderDraftState } from '@shared/types/storefront-builder.types';

export interface HomeBuilderSectionState extends DraftSectionState {
  formState: SectionFormState;
}

export interface HomeBuilderState extends HomeBuilderDraftState {
  sections: HomeBuilderSectionState[];
}

export interface HomeBuilderUpdateTask {
  id: string;
  current: AdminSection;
  draft: HomeBuilderSectionState;
}
