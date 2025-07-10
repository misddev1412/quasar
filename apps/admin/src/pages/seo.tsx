import React from 'react';
import SeoManager from '../components/SEO/SeoManager';
import SeoHead from '../components/SEO/SeoHead';

export const SeoPage: React.FC = () => {
  return (
    <>
      <SeoHead />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">SEO Management</h1>
          <p className="text-neutral-500">Manage SEO data for your website pages</p>
        </div>
        
        <SeoManager />
      </div>
    </>
  );
};

export default SeoPage; 