import { SearchResult, GroupedSearchResults } from '../types/SearchResult';
import { MenuGroup } from '../../navigation/types/MenuItem';

export interface ISearchService {
  getAllSearchableItems(menuGroups: MenuGroup[]): SearchResult[];
  performSearch(query: string, menuGroups: MenuGroup[]): SearchResult[];
  groupSearchResults(results: SearchResult[]): GroupedSearchResults;
}