'use client';

import { useState, useEffect } from 'react';
import { useTrpcQuery } from '../hooks/useTrpcQuery';
import type { SEOData } from '../types/trpc';

export function SEOTest() {
  const [serverSEOData, setServerSEOData] = useState<SEOData | null>(null);
  const [clientSEOData, setClientSEOData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(true);
  const { useSEO } = useTrpcQuery();

  // Test client-side data fetching
  const { data: clientData, isLoading: clientLoading } = useSEO('/', {
    enabled: true,
  });

  useEffect(() => {
    // Test server-side data fetching
    const fetchServerSideData = async () => {
      try {
        const response = await fetch('/api/debug/seo-data?path=/');
        const data = await response.json();
        setServerSEOData(data.seoData);
      } catch (error) {
        console.error('Failed to fetch server-side SEO data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServerSideData();
  }, []);

  useEffect(() => {
    if (clientData?.data) {
      setClientSEOData(clientData.data as SEOData);
    }
  }, [clientData]);

  if (loading || clientLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">SEO Data Test</h1>
          <p>Loading SEO data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">SEO Data Test</h1>
          <p className="text-gray-600">
            This page tests both server-side and client-side SEO data fetching
          </p>
        </div>

        {/* Server-side SEO Data */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Server-side SEO Data
          </h2>
          {serverSEOData ? (
            <div className="space-y-2">
              <p><strong>Title:</strong> {serverSEOData.title}</p>
              <p><strong>Description:</strong> {serverSEOData.description}</p>
              <p><strong>Keywords:</strong> {serverSEOData.keywords}</p>
              {serverSEOData.additionalMetaTags && (
                <div>
                  <strong>Additional Meta Tags:</strong>
                  <pre className="bg-white p-2 rounded mt-2 text-sm">
                    {JSON.stringify(serverSEOData.additionalMetaTags, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600">No server-side SEO data available</p>
          )}
        </div>

        {/* Client-side SEO Data */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            Client-side SEO Data
          </h2>
          {clientSEOData ? (
            <div className="space-y-2">
              <p><strong>Title:</strong> {clientSEOData.title}</p>
              <p><strong>Description:</strong> {clientSEOData.description}</p>
              <p><strong>Keywords:</strong> {clientSEOData.keywords}</p>
              {clientSEOData.additionalMetaTags && (
                <div>
                  <strong>Additional Meta Tags:</strong>
                  <pre className="bg-white p-2 rounded mt-2 text-sm">
                    {JSON.stringify(clientSEOData.additionalMetaTags, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600">No client-side SEO data available</p>
          )}
        </div>

        {/* Current Page Title */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-800">
            Current Page Title
          </h2>
          <p className="text-lg font-mono bg-white p-2 rounded">
            {document.title}
          </p>
        </div>

        {/* Meta Tags */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Current Meta Tags
          </h2>
          <div className="space-y-2">
            <div>
              <strong>Description:</strong>
              <p className="bg-white p-2 rounded font-mono text-sm">
                {document.querySelector('meta[name="description"]')?.getAttribute('content') || 'No description meta tag'}
              </p>
            </div>
            <div>
              <strong>Keywords:</strong>
              <p className="bg-white p-2 rounded font-mono text-sm">
                {document.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'No keywords meta tag'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">
            Test Results
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Server-side Data:</strong>{' '}
              <span className={serverSEOData ? 'text-green-600' : 'text-red-600'}>
                {serverSEOData ? '✓ Available' : '✗ Not Available'}
              </span>
            </p>
            <p>
              <strong>Client-side Data:</strong>{' '}
              <span className={clientSEOData ? 'text-green-600' : 'text-red-600'}>
                {clientSEOData ? '✓ Available' : '✗ Not Available'}
              </span>
            </p>
            <p>
              <strong>Data Match:</strong>{' '}
              <span className={serverSEOData?.title === clientSEOData?.title ? 'text-green-600' : 'text-red-600'}>
                {serverSEOData?.title === clientSEOData?.title ? '✓ Titles Match' : '✗ Titles Differ'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SEOTest;