import React from 'react';
import CreatePageTemplate from './CreatePageTemplate';
import type { BreadcrumbItem } from './Breadcrumb';

type CreatePageTemplateProps = React.ComponentProps<typeof CreatePageTemplate>;

interface StandardFormPageProps extends Omit<CreatePageTemplateProps, 'showActions' | 'maxWidth'> {
  maxWidth?: CreatePageTemplateProps['maxWidth'];
  showActions?: boolean;
  formId?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const StandardFormPage: React.FC<StandardFormPageProps> = ({
  maxWidth = 'full',
  showActions = true,
  formId,
  ...props
}) => (
  <CreatePageTemplate
    {...props}
    maxWidth={maxWidth}
    showActions={showActions}
    formId={formId}
  />
);

export default StandardFormPage;
