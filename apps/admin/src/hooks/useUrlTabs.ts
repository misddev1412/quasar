import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseUrlTabsOptions {
  defaultTab?: number;
  tabParam?: string;
  tabKeys?: string[]; // Optional: map tab indices to custom keys
}

export function useUrlTabs(options: UseUrlTabsOptions = {}) {
  const {
    defaultTab = 0,
    tabParam = 'tab',
    tabKeys = []
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Initialize active tab from URL on component mount
  useEffect(() => {
    const tabFromUrl = searchParams.get(tabParam);
    if (tabFromUrl) {
      if (tabKeys.length > 0) {
        // If tabKeys are provided, find the index of the tab key
        const tabIndex = tabKeys.indexOf(tabFromUrl);
        if (tabIndex !== -1) {
          setActiveTab(tabIndex);
        } else {
          // If tab key not found, default to first tab and clean URL
          setActiveTab(defaultTab);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete(tabParam);
          setSearchParams(newParams, { replace: true });
        }
      } else {
        // If no tabKeys, use numeric indices
        const tabIndex = parseInt(tabFromUrl, 10);
        if (!isNaN(tabIndex) && tabIndex >= 0) {
          setActiveTab(tabIndex);
        } else {
          // Invalid tab index, default and clean URL
          setActiveTab(defaultTab);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete(tabParam);
          setSearchParams(newParams, { replace: true });
        }
      }
    }
  }, [searchParams, tabParam, tabKeys, defaultTab, setSearchParams]);

  // Function to change tab and update URL
  const handleTabChange = useCallback((newTabIndex: number) => {
    setActiveTab(newTabIndex);
    
    const newParams = new URLSearchParams(searchParams);
    
    if (tabKeys.length > 0) {
      // Use custom tab keys if provided
      const tabKey = tabKeys[newTabIndex];
      if (tabKey) {
        newParams.set(tabParam, tabKey);
      } else {
        // If no tab key for this index, remove param
        newParams.delete(tabParam);
      }
    } else {
      // Use numeric indices
      if (newTabIndex === defaultTab) {
        // If it's the default tab, remove the parameter for cleaner URLs
        newParams.delete(tabParam);
      } else {
        newParams.set(tabParam, newTabIndex.toString());
      }
    }
    
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams, tabParam, tabKeys, defaultTab]);

  return {
    activeTab,
    handleTabChange,
  };
}