import { useState, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { useLocation } from 'react-router-dom';
import { SeoData } from './useSeo';
import { BaseApiResponse } from '@shared/types/api.types';

interface UseSeoManagerProps {
  defaultPageTitle?: string;
}

export interface UseSeoManagerReturn {
  seoData: SeoData[];
  currentSeo?: SeoData;
  isLoading: boolean;
  error: any;
  selectedPath: string;
  setSelectedPath: (path: string) => void;
  createSeo: (data: Partial<SeoData>) => Promise<void>;
  updateSeo: (data: Partial<SeoData> & { id: string }) => Promise<void>;
  deleteSeo: (id: string) => Promise<void>;
  fetchSeoList: () => Promise<void>;
}

/**
 * SEO管理Hook，用于管理SEO数据
 */
export function useSeoManager({ defaultPageTitle = 'Quasar Admin' }: UseSeoManagerProps = {}): UseSeoManagerReturn {
  const location = useLocation();
  const [seoData, setSeoData] = useState<SeoData[]>([]);
  const [selectedPath, setSelectedPath] = useState(location.pathname);
  
  // 获取SEO列表
  const { 
    data: seoListData, 
    isLoading: isLoadingSeoList, 
    error: seoListError,
    refetch: refetchSeoList 
  } = trpc.adminSeo.getAll.useQuery(undefined);
  
  // 当SEO列表数据变化时更新状态
  if (seoListData && typeof seoListData === 'object' && 'data' in seoListData && Array.isArray(seoListData.data)) {
    // 避免无限渲染循环，只在数据变化时更新
    if (JSON.stringify(seoData) !== JSON.stringify(seoListData.data)) {
      setSeoData(seoListData.data as SeoData[]);
    }
  }
  
  // 获取当前路径的SEO
  const { 
    data: currentSeoData,
    isLoading: isLoadingCurrentSeo,
    error: currentSeoError
  } = trpc.adminSeo.getByPath.useQuery({ path: selectedPath }, { 
    enabled: !!selectedPath
  });
  
  // TRPC突变钩子
  const createMutation = trpc.adminSeo.create.useMutation();
  const updateMutation = trpc.adminSeo.update.useMutation();
  const deleteMutation = trpc.adminSeo.delete.useMutation();

  // 获取当前选中的SEO数据
  const currentSeo = currentSeoData && typeof currentSeoData === 'object' && 'data' in currentSeoData 
    ? (currentSeoData as unknown as BaseApiResponse<SeoData>).data
    : undefined;

  // 创建SEO
  const createSeo = useCallback(async (data: Partial<SeoData>) => {
    if (!data.path) {
      throw new Error('Path is required');
    }
    
    try {
      await createMutation.mutateAsync(data as any);
      // 刷新SEO列表
      refetchSeoList();
    } catch (error) {
      console.error('Failed to create SEO:', error);
      throw error;
    }
  }, [createMutation, refetchSeoList]);

  // 更新SEO
  const updateSeo = useCallback(async (data: Partial<SeoData> & { id: string }) => {
    try {
      await updateMutation.mutateAsync(data as any);
      // 刷新SEO列表
      refetchSeoList();
    } catch (error) {
      console.error('Failed to update SEO:', error);
      throw error;
    }
  }, [updateMutation, refetchSeoList]);

  // 删除SEO
  const deleteSeo = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      // 刷新SEO列表
      refetchSeoList();
    } catch (error) {
      console.error('Failed to delete SEO:', error);
      throw error;
    }
  }, [deleteMutation, refetchSeoList]);

  // 手动获取SEO列表
  const fetchSeoList = useCallback(async () => {
    await refetchSeoList();
  }, [refetchSeoList]);

  return {
    seoData,
    currentSeo,
    isLoading: isLoadingSeoList || isLoadingCurrentSeo,
    error: seoListError || currentSeoError,
    selectedPath,
    setSelectedPath,
    createSeo,
    updateSeo,
    deleteSeo,
    fetchSeoList
  };
} 