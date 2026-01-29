import React from 'react';
import type { BreadcrumbItem } from './Breadcrumb';
import BaseLayout from '../layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

type BaseLayoutProps = React.ComponentProps<typeof BaseLayout>;

interface StandardListPageProps extends BaseLayoutProps {
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbLabel?: string;
}

const StandardListPage: React.FC<StandardListPageProps> = ({
  breadcrumbs,
  breadcrumbLabel,
  title,
  description,
  children,
  ...rest
}) => {
  const { t } = useTranslationWithBackend();

  const resolvedLabel = breadcrumbLabel
    || (breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.label : undefined)
    || title;

  const resolvedBreadcrumbs: BreadcrumbItem[] = [
    { label: t('common.dashboard', 'Dashboard'), href: '/' },
    { label: resolvedLabel },
  ];

  return (
    <BaseLayout
      title={title}
      description={description}
      breadcrumbs={resolvedBreadcrumbs}
      {...rest}
    >
      {children}
    </BaseLayout>
  );
};

export default StandardListPage;
