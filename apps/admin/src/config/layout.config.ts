export type LayoutType = 'vertical' | 'horizontal';

export interface LayoutConfig {
  type: LayoutType;
  sidebarCollapsed: boolean;
}

export const defaultLayoutConfig: LayoutConfig = {
  type: 'vertical',
  sidebarCollapsed: false,
};

export interface LayoutContextType {
  config: LayoutConfig;
  setConfig: (config: Partial<LayoutConfig>) => void;
  toggleSidebar: () => void;
  toggleLayoutType: () => void;
} 