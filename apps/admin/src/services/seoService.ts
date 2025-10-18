/**
 * SEO Service - Handles SEO-related API operations
 */
import { trpcClient } from '@admin/utils/trpc';
import { SeoData } from '@admin/hooks/useSeo';
import apiService from './api';

export const seoService = {
  /**
   * Fetch all SEO data
   */
  getAllSeo: async () => {
    try {
      const data = await trpcClient['admin.seo'].getAll.query();
      return apiService.formatResponse(data);
    } catch (error) {
      return apiService.handleError(error);
    }
  },

  /**
   * Get SEO data by path
   */
  getSeoByPath: async (path: string) => {
    try {
      const data = await trpcClient['admin.seo'].getByPath.query({ path });
      return apiService.formatResponse(data);
    } catch (error) {
      return apiService.handleError(error);
    }
  },

  /**
   * Create or update SEO data
   */
  saveSeo: async (seoData: SeoData) => {
    try {
      // Use create for new entries, update for existing ones
      const method = seoData.id ? 'update' : 'create';
      const data = await trpcClient['admin.seo'][method].mutate(seoData);
      return apiService.formatResponse(data);
    } catch (error) {
      return apiService.handleError(error);
    }
  },

  /**
   * Delete SEO data
   */
  deleteSeo: async (id: string) => {
    try {
      const data = await trpcClient['admin.seo'].delete.mutate({ id });
      return apiService.formatResponse(data);
    } catch (error) {
      return apiService.handleError(error);
    }
  }
};

export default seoService; 