import React, { useState, useEffect } from 'react';
import { useSeo, SeoData } from '../hooks/useSeo';
import { trpc } from '../utils/trpc';
import { BaseApiResponse } from '@shared/types/api.types';

interface SeoFormData {
  title: string;
  description: string;
  keywords: string;
  path: string;
  isActive?: boolean;
}

// 删除本地定义的 ApiResponse 接口，使用共享库的 BaseApiResponse

export function SeoDemo() {
  const [searchPath, setSearchPath] = useState<string>('/');
  const [selectedSeoId, setSelectedSeoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SeoFormData>({
    title: '',
    description: '',
    keywords: '',
    path: '',
    isActive: true
  });

  // Use our SEO hook
  const { seo, isLoading: seoLoading, updateHead } = useSeo();

  // Get SEO data for current page
  useEffect(() => {
    if (seo) {
      updateHead(seo);
    }
  }, [seo, updateHead]);

  // TRPC queries for SEO data
  const { data: allSeosData, isLoading: allSeosLoading } = 
    trpc.adminSeo.getAll.useQuery();
  
  const { data: seoByPathData, isLoading: pathLoading } = 
    trpc.adminSeo.getByPath.useQuery({ path: searchPath }, 
      { enabled: searchPath.length > 0 });

  const { data: seoByIdData, isLoading: idLoading } = 
    trpc.adminSeo.getById.useQuery({ id: selectedSeoId || '' }, 
      { enabled: selectedSeoId !== null });

  // TRPC mutations
  const createSeo = trpc.adminSeo.create.useMutation();
  const updateSeo = trpc.adminSeo.update.useMutation();
  const deleteSeo = trpc.adminSeo.delete.useMutation();

  // Extract data from responses with proper type checking
  const allSeos = allSeosData && typeof allSeosData === 'object' && 'data' in allSeosData 
    ? (allSeosData as any).data as SeoData[]
    : [];
    
  const seoByPath = seoByPathData && typeof seoByPathData === 'object' && 'data' in seoByPathData 
    ? (seoByPathData as any).data as SeoData
    : null;
    
  const seoById = seoByIdData && typeof seoByIdData === 'object' && 'data' in seoByIdData 
    ? (seoByIdData as any).data as SeoData
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSeo.mutate(formData);
    setFormData({
      title: '',
      description: '',
      keywords: '',
      path: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this SEO entry?')) {
      deleteSeo.mutate({ id });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SEO Demo</h1>
      
      {/* Current page SEO */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Current Page SEO</h2>
        {seoLoading ? (
          <p>Loading SEO data...</p>
        ) : (
          <div>
            <p><strong>Path:</strong> {seo.path}</p>
            <p><strong>Title:</strong> {seo.title || 'No title set'}</p>
            <p><strong>Description:</strong> {seo.description || 'No description set'}</p>
            <p><strong>Keywords:</strong> {seo.keywords || 'No keywords set'}</p>
          </div>
        )}
      </div>

      {/* Create SEO form */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Create New SEO Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Path</label>
            <input 
              type="text" 
              value={formData.path}
              onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="/example-path"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Page Title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Page description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Keywords</label>
            <input 
              type="text" 
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
          
          <button 
            type="submit"
            disabled={createSeo.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {createSeo.isPending ? 'Creating...' : 'Create SEO Entry'}
          </button>
          
          {createSeo.error && (
            <p className="text-red-500 mt-2">{createSeo.error.message}</p>
          )}
        </form>
      </div>

      {/* Search by path */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Search SEO by Path</h2>
        <div className="flex gap-2 mb-4">
          <input 
            type="text"
            value={searchPath}
            onChange={(e) => setSearchPath(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
            placeholder="/example-path"
          />
          <button 
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            onClick={() => setSearchPath('')}
          >
            Clear
          </button>
        </div>
        
        {pathLoading ? (
          <p>Searching...</p>
        ) : seoByPath ? (
          <div className="border p-3 rounded-md">
            <h3 className="font-semibold">{seoByPath.title || 'No title'}</h3>
            <p className="text-sm">Path: {seoByPath.path}</p>
            <p className="text-sm">Description: {seoByPath.description}</p>
            <p className="text-sm">Keywords: {seoByPath.keywords}</p>
          </div>
        ) : searchPath ? (
          <p>No SEO entry found for path: {searchPath}</p>
        ) : null}
      </div>
      
      {/* All SEO entries */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">All SEO Entries</h2>
        {allSeosLoading ? (
          <p>Loading SEO entries...</p>
        ) : allSeos.length > 0 ? (
          <div className="space-y-3">
            {allSeos.map((item: SeoData) => (
              <div key={item.id} className="border p-3 rounded-md">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{item.title || 'No title'}</h3>
                    <p className="text-sm">Path: {item.path}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {item.description ? `Description: ${item.description}` : 'No description'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSeoId(item.id || null)}
                      className="bg-blue-500 text-white px-2 py-1 text-sm rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => item.id && handleDelete(item.id)}
                      className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                      disabled={deleteSeo.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No SEO entries found</p>
        )}
      </div>
      
      {/* Selected SEO details */}
      {selectedSeoId && (
        <div className="p-4 border rounded-lg bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">SEO Details</h2>
            <button
              onClick={() => setSelectedSeoId(null)}
              className="text-sm text-gray-500"
            >
              Close
            </button>
          </div>
          
          {idLoading ? (
            <p>Loading details...</p>
          ) : seoById ? (
            <div>
              <p><strong>ID:</strong> {seoById.id}</p>
              <p><strong>Path:</strong> {seoById.path}</p>
              <p><strong>Title:</strong> {seoById.title || 'No title'}</p>
              <p><strong>Description:</strong> {seoById.description || 'No description'}</p>
              <p><strong>Keywords:</strong> {seoById.keywords || 'No keywords'}</p>
              {seoById.createdAt && (
                <p><strong>Created:</strong> {new Date(seoById.createdAt).toLocaleString()}</p>
              )}
              {seoById.updatedAt && (
                <p><strong>Updated:</strong> {new Date(seoById.updatedAt).toLocaleString()}</p>
              )}
            </div>
          ) : (
            <p>SEO entry not found</p>
          )}
        </div>
      )}
    </div>
  );
} 