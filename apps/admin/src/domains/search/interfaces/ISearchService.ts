import { SearchResult, GroupedSearchResults } from '@admin/domains/search/types/SearchResult';
import { MenuGroup } from '@admin/domains/navigation/types/MenuItem';

export interface ISearchService {
  getAllSearchableItems(menuGroups: MenuGroup[]): SearchResult[];
  performSearch(query: string, menuGroups: MenuGroup[]): SearchResult[];
  groupSearchResults(results: SearchResult[]): GroupedSearchResults;
}