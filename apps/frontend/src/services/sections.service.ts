import { SectionListItem } from '../types/sections';

export async function fetchSections(page: string, locale: string): Promise<SectionListItem[]> {
  const { trpcClient } = await import('../utils/trpc');
  try {
    const response = await (trpcClient as any).sections.list.query({ page, locale });
    if (!response) return [];
    const data = response.data as unknown as SectionListItem[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch sections', error);
    return [];
  }
}
