import { getTranslations } from 'next-intl/server';

export default async function TestSimplePage() {
  const t = await getTranslations('pages.test_simple');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <nav>
        <a href="/test-simple">{t('link_self')}</a> |
        <a href="/profile">{t('link_profile')}</a>
      </nav>
    </div>
  );
}
