import { SectionType } from '@shared/enums/section.enums';
import type { AdminSection } from '@admin/hooks/useSectionsManager';
import {
  buildReorderInput,
  createBuilderSections,
  getUpdateTasks,
  isAllowedOrigin,
  parseBuilderSelectSectionMessage,
} from '@admin/utils/storefront-home-builder';

const createSection = (overrides?: Partial<AdminSection>): AdminSection => ({
  id: overrides?.id || crypto.randomUUID(),
  page: overrides?.page || 'home',
  type: overrides?.type || SectionType.HERO_SLIDER,
  position: overrides?.position ?? 0,
  isEnabled: overrides?.isEnabled ?? true,
  config: overrides?.config || {},
  translations: overrides?.translations || [
    {
      id: crypto.randomUUID(),
      locale: 'en',
      title: 'Title',
      subtitle: 'Subtitle',
      description: 'Description',
      heroDescription: 'Hero description',
      configOverride: null,
    },
  ],
  updatedAt: overrides?.updatedAt || new Date().toISOString(),
  version: overrides?.version ?? 1,
  components: overrides?.components || [],
});

describe('storefront-home-builder utils', () => {
  it('detects changed and unchanged sections', () => {
    const live = [
      createSection({ id: 'a', position: 0 }),
      createSection({ id: 'b', position: 1 }),
    ];
    const draft = createBuilderSections(live);

    expect(getUpdateTasks(live, draft)).toHaveLength(0);

    const changed = draft.map((item) => item.id === 'a'
      ? {
        ...item,
        formState: {
          ...item.formState,
          isEnabled: false,
        },
      }
      : item);

    expect(getUpdateTasks(live, changed)).toHaveLength(1);
    expect(getUpdateTasks(live, changed)[0].id).toBe('a');
  });

  it('maps reorder payload from draft order', () => {
    const live = [
      createSection({ id: 'a', position: 0 }),
      createSection({ id: 'b', position: 1 }),
      createSection({ id: 'c', position: 2 }),
    ];
    const draft = createBuilderSections(live);
    const reordered = [draft[2], draft[0], draft[1]].map((section, index) => ({ ...section, position: index }));

    expect(buildReorderInput('home', reordered)).toEqual({
      page: 'home',
      sections: [
        { id: 'c', position: 0 },
        { id: 'a', position: 1 },
        { id: 'b', position: 2 },
      ],
    });
  });

  it('parses builder select message and validates origin guard', () => {
    const parsed = parseBuilderSelectSectionMessage({
      type: 'BUILDER_SELECT_SECTION',
      payload: {
        page: 'home',
        sectionId: 'section-1',
      },
    });

    expect(parsed).toEqual({
      type: 'BUILDER_SELECT_SECTION',
      payload: {
        page: 'home',
        sectionId: 'section-1',
      },
    });
    expect(parseBuilderSelectSectionMessage({ type: 'OTHER' })).toBeNull();
    expect(isAllowedOrigin('https://admin.example.com', 'https://admin.example.com/path')).toBe(true);
    expect(isAllowedOrigin('https://malicious.example.com', 'https://admin.example.com')).toBe(false);
  });
});
