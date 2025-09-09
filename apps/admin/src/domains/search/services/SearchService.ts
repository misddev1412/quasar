import { ISearchService } from '../interfaces/ISearchService';
import { SearchResult, GroupedSearchResults } from '../types/SearchResult';
import { MenuGroup } from '../../navigation/types/MenuItem';

export class SearchService implements ISearchService {
  getAllSearchableItems(menuGroups: MenuGroup[]): SearchResult[] {
    let results: SearchResult[] = [];
    
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        results.push({
          icon: item.icon,
          label: item.label,
          path: item.path,
          group: group.title
        });
        
        if (item.subItems) {
          item.subItems.forEach(subItem => {
            results.push({
              icon: subItem.icon,
              label: `${item.label} > ${subItem.label}`,
              path: subItem.path,
              group: group.title
            });
          });
        }
      });
    });
    
    return results;
  }

  performSearch(query: string, menuGroups: MenuGroup[]): SearchResult[] {
    if (!query.trim()) {
      return [];
    }
    
    const allItems = this.getAllSearchableItems(menuGroups);
    return allItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }

  groupSearchResults(results: SearchResult[]): GroupedSearchResults {
    const grouped: GroupedSearchResults = {};
    
    results.forEach(result => {
      const group = result.group || '其他';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(result);
    });
    
    return grouped;
  }
}