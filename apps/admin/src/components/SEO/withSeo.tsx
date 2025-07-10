import React from 'react';
import SeoHead from './SeoHead';
import { SeoData } from '../../hooks/useSeo';

interface WithSeoProps {
  seoData?: SeoData;
}

/**
 * Higher-order component to add SEO to any component
 * @param WrappedComponent The component to wrap with SEO
 * @param defaultSeoData Optional default SEO data
 */
export const withSeo = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultSeoData?: SeoData
) => {
  const WithSeo: React.FC<P & WithSeoProps> = ({ seoData, ...props }) => {
    // Use provided seoData or default
    const finalSeoData = seoData || defaultSeoData;
    
    return (
      <>
        {finalSeoData && <SeoHead data={finalSeoData} />}
        <WrappedComponent {...props as P} />
      </>
    );
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithSeo.displayName = `withSeo(${displayName})`;

  return WithSeo;
};

export default withSeo; 