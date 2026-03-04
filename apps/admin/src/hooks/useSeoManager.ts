import { useMemo } from 'react';
import { trpc } from '@admin/utils/trpc';
import { SeoDto } from '@backend/modules/seo/dto/seo.dto';
import { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import type { AdminSeoListData, AdminSeoListQuery, AdminSeoStats } from '@admin/types/seo';

export type SeoData = SeoDto;

type SeoListApiResponse = ApiResponse<AdminSeoListData<SeoData>>;
type SeoStatsApiResponse = ApiResponse<AdminSeoStats>;

export const useSeoManager = (params: AdminSeoListQuery = {}) => {
  const utils = trpc.useContext() as any;
  const { data: seoList, isLoading: isLoadingSeo } = (trpc.adminSeo.getAll as any).useQuery(params, {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
  const { data: seoStats, isLoading: isLoadingStats } = (trpc.adminSeo as any).stats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: createSeo, isPending: isCreating } = trpc.adminSeo.create.useMutation({
    onSuccess: () => {
      utils.adminSeo.getAll.invalidate();
      utils.adminSeo.stats.invalidate();
    },
  });

  const { mutateAsync: updateSeo, isPending: isUpdating } = trpc.adminSeo.update.useMutation({
    onSuccess: () => {
      utils.adminSeo.getAll.invalidate();
      utils.adminSeo.stats.invalidate();
    },
  });

  const { mutateAsync: deleteSeo, isPending: isDeleting } = trpc.adminSeo.delete.useMutation({
    onSuccess: () => {
      utils.adminSeo.getAll.invalidate();
      utils.adminSeo.stats.invalidate();
    },
  });

  const seoListData = seoList as SeoListApiResponse | undefined;
  const seoStatsData = seoStats as SeoStatsApiResponse | undefined;
  const seoItems = useMemo(() => seoListData?.data?.items || [], [seoListData]);
  const total = seoListData?.data?.total ?? 0;
  const page = seoListData?.data?.page ?? params.page ?? 1;
  const limit = seoListData?.data?.limit ?? params.limit ?? 10;
  const totalPages = seoListData?.data?.totalPages ?? 1;
  const stats = seoStatsData?.data ?? { total: 0, active: 0, inactive: 0, groups: 0 };

  return {
    seoList: seoItems,
    total,
    page,
    limit,
    totalPages,
    stats,
    isLoading: isLoadingSeo,
    isStatsLoading: isLoadingStats,
    isCreating,
    isUpdating,
    isDeleting,
    createSeo,
    updateSeo,
    deleteSeo,
  };
}; 
