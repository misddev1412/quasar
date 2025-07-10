import React, { useState, useEffect } from 'react';
import { trpc } from '../../utils/trpc';
import { SeoData } from '../../hooks/useSeo';
import { useForm } from 'react-hook-form';
import { cn } from '../../lib/utils';

interface SeoFormData extends SeoData {
  // Additional fields can be added here
}

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}

export const SeoManager: React.FC = () => {
  const [selectedSeo, setSelectedSeo] = useState<SeoData | null>(null);
  const [currentTab, setCurrentTab] = useState<'basic' | 'opengraph' | 'twitter'>('basic');
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SeoFormData>();
  
  const { data: seosData, isLoading: isLoadingSeos, refetch } = trpc.adminSeo.getAll.useQuery();
  const createSeo = trpc.adminSeo.create.useMutation();
  const updateSeo = trpc.adminSeo.update.useMutation();
  const deleteSeo = trpc.adminSeo.delete.useMutation();

  // Reset form when selected SEO changes
  useEffect(() => {
    if (selectedSeo) {
      reset(selectedSeo);
    } else {
      reset({
        path: '',
        title: '',
        description: '',
        keywords: '',
      });
    }
  }, [selectedSeo, reset]);

  const onSubmit = async (data: SeoFormData) => {
    try {
      if (selectedSeo?.id) {
        // Update existing SEO
        await updateSeo.mutateAsync({
          id: selectedSeo.id,
          ...data
        });
      } else {
        // Create new SEO
        await createSeo.mutateAsync(data);
      }
      
      // Refetch data
      refetch();
      
      // Reset form
      if (!selectedSeo?.id) {
        reset();
      }
    } catch (error) {
      console.error('Error saving SEO data:', error);
    }
  };

  const handleDeleteSeo = async () => {
    if (selectedSeo?.id && window.confirm('Are you sure you want to delete this SEO record?')) {
      try {
        await deleteSeo.mutateAsync({ id: selectedSeo.id });
        refetch();
        setSelectedSeo(null);
      } catch (error) {
        console.error('Error deleting SEO data:', error);
      }
    }
  };

  const seos = seosData && typeof seosData === 'object' && 'data' in seosData 
    ? (seosData as unknown as ApiResponse<SeoData[]>).data 
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* SEO List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">SEO Entries</h2>
          <button
            onClick={() => setSelectedSeo(null)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-md text-sm"
          >
            New Entry
          </button>
        </div>
        
        {isLoadingSeos ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {seos.length > 0 ? (
              seos.map((seo: SeoData) => (
                <div
                  key={seo.id}
                  onClick={() => setSelectedSeo(seo)}
                  className={cn(
                    "p-3 rounded-md cursor-pointer transition-colors",
                    selectedSeo?.id === seo.id
                      ? "bg-primary-50 border border-primary-200"
                      : "hover:bg-neutral-50 border border-neutral-100"
                  )}
                >
                  <div className="font-medium truncate">{seo.path}</div>
                  <div className="text-sm text-neutral-500 truncate">{seo.title}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No SEO entries found
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEO Form */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          {selectedSeo?.id ? 'Edit SEO Entry' : 'Create New SEO Entry'}
        </h2>
        
        <div className="mb-6">
          <div className="flex border-b border-neutral-200">
            <button
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2",
                currentTab === 'basic'
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              )}
              onClick={() => setCurrentTab('basic')}
            >
              Basic Info
            </button>
            <button
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2",
                currentTab === 'opengraph'
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              )}
              onClick={() => setCurrentTab('opengraph')}
            >
              Open Graph
            </button>
            <button
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2",
                currentTab === 'twitter'
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              )}
              onClick={() => setCurrentTab('twitter')}
            >
              Twitter
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Info Tab */}
          {currentTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Path <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('path', { required: 'Path is required' })}
                  placeholder="/example-page"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.path && (
                  <p className="mt-1 text-sm text-red-600">{errors.path.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Title
                </label>
                <input
                  {...register('title')}
                  placeholder="Page Title"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Page description"
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Keywords
                </label>
                <input
                  {...register('keywords')}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Canonical URL
                </label>
                <input
                  {...register('canonicalUrl')}
                  placeholder="https://example.com/page"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Locale
                </label>
                <input
                  {...register('locale')}
                  placeholder="en_US"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Open Graph Tab */}
          {currentTab === 'opengraph' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  OG Title
                </label>
                <input
                  {...register('ogTitle')}
                  placeholder="Open Graph Title"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  OG Description
                </label>
                <textarea
                  {...register('ogDescription')}
                  placeholder="Open Graph Description"
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  OG Image URL
                </label>
                <input
                  {...register('ogImage')}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  OG URL
                </label>
                <input
                  {...register('ogUrl')}
                  placeholder="https://example.com/page"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  OG Type
                </label>
                <select
                  {...register('ogType')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="book">book</option>
                  <option value="profile">profile</option>
                  <option value="video">video</option>
                </select>
              </div>
            </div>
          )}

          {/* Twitter Tab */}
          {currentTab === 'twitter' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Twitter Card
                </label>
                <select
                  {...register('twitterCard')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="app">app</option>
                  <option value="player">player</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Twitter Title
                </label>
                <input
                  {...register('twitterTitle')}
                  placeholder="Twitter Title"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Twitter Description
                </label>
                <textarea
                  {...register('twitterDescription')}
                  placeholder="Twitter Description"
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Twitter Image
                </label>
                <input
                  {...register('twitterImage')}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <div>
              {selectedSeo?.id && (
                <button
                  type="button"
                  onClick={handleDeleteSeo}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
            
            <div className="space-x-3">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setSelectedSeo(null);
                }}
                className="border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!isDirty}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium",
                  isDirty
                    ? "bg-primary-500 hover:bg-primary-600 text-white"
                    : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                )}
              >
                {selectedSeo?.id ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeoManager; 