import { SeoManager } from '../components/SEO/SeoManager';
import BaseLayout from '../components/layout/BaseLayout';

const SeoPage = () => {
  return (
    <BaseLayout title="SEO 管理" description="在这里管理您的 SEO 设置。">
      <SeoManager />
    </BaseLayout>
  );
};

export default SeoPage; 