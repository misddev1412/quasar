import React from 'react';
import SeoHead from './SeoHead';
import { SeoData } from '../../hooks/useSeo';

interface WithSeoProps {
  seoData?: SeoData;
  defaultSeo?: Partial<SeoData>;
}

/**
 * 高阶组件，为任何组件添加SEO功能
 * @param WrappedComponent 需要包装SEO的组件
 * @param defaultSeoData 可选的默认SEO数据
 */
export const withSeo = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultSeoData?: SeoData
) => {
  const WithSeo: React.FC<P & WithSeoProps> = ({ seoData, defaultSeo, ...props }) => {
    // 使用提供的seoData或默认值
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