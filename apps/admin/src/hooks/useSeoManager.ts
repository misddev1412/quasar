import { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import { SeoDto } from '@backend/modules/seo/dto/seo.dto';
import { ApiResponse } from '@backend/trpc/schemas/response.schemas';

export type SeoData = SeoDto;

type SeoApiResponse = ApiResponse<SeoData[]>;

export const useSeoManager = () => {
  const utils = trpc.useContext();
  const { data: seoList, isLoading: isLoadingSeo } = trpc.adminSeo.getAll.useQuery<SeoApiResponse>(undefined, {
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: createSeo, isPending: isCreating } = trpc.adminSeo.create.useMutation({
    onSuccess: () => {
      utils.adminSeo.getAll.invalidate();
    },
  });

  const { mutateAsync: updateSeo, isPending: isUpdating } = trpc.adminSeo.update.useMutation({
    onSuccess: () => {
      utils.adminSeo.getAll.invalidate();
    },
  });

  const { mutateAsync: deleteSeo, isPending: isDeleting } = trpc.adminSeo.delete.useMutation({
    onSuccess: () => {
      utils.adminSeo.getAll.invalidate();
    },
  });

  const groupedSeo = useMemo(() => {
    if (!seoList || !seoList.data) return {};
    const records = (seoList.data as unknown as SeoData[]) || [];
    return records.reduce((acc, seo) => {
      const group = seo.group || 'general';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(seo);
      return acc;
    }, {} as Record<string, SeoData[]>);
  }, [seoList]);

  return {
    seoList: (seoList?.data as unknown as SeoData[]) || [],
    groupedSeo,
    isLoading: isLoadingSeo,
    isCreating,
    isUpdating,
    isDeleting,
    createSeo,
    updateSeo,
    deleteSeo,
  };
}; 