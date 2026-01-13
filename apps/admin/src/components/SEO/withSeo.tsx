import React from 'react';
import SeoHead from './SeoHead';
import { SeoData } from '../../hooks/useSeo';

interface WithSeoProps {
  seoData?: SeoData;
  defaultSeo?: Partial<SeoData>;
}


export const withSeo = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultSeoData?: SeoData
) => {
  const WithSeo: React.FC<P & WithSeoProps> = ({ seoData, defaultSeo, ...props }) => {
    const finalDefaultSeo = defaultSeo || defaultSeoData;
    
    return (
      <>
        <SeoHead 
          data={seoData} 
          defaultSeo={finalDefaultSeo}
          path={seoData?.path || finalDefaultSeo?.path} 
        />
        <WrappedComponent {...props as P} />
      </>
    );
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithSeo.displayName = `withSeo(${displayName})`;

  return WithSeo;
};

export default withSeo; 