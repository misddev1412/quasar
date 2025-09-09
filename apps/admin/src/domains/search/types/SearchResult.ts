import { ReactNode } from 'react';

export interface SearchResult {
  icon: ReactNode;
  label: string;
  path: string;
  group?: string;
}

export interface GroupedSearchResults {
  [key: string]: SearchResult[];
}