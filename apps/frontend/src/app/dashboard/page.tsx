import { getTranslations } from 'next-intl/server';
import Layout from '../../components/layout/Layout';
import PageBreadcrumbs from '../../components/common/PageBreadcrumbs';

export default async function Page() {
  const t = await getTranslations('pages.dashboard');
  const tCommon = await getTranslations('common');

  return (
    <Layout>
      <PageBreadcrumbs
        items={[
          { label: tCommon('home'), href: '/' },
          { label: t('title'), isCurrent: true },
        ]}
        fullWidth
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </div>
    </Layout>
  );
}
