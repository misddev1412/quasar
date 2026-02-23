import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@admin/components/common/Card';
import BaseLayout from '@admin/components/layout/BaseLayout';
import { Button } from '@admin/components/common/Button';
import HelpfulTipsCard from '@admin/components/common/HelpfulTipsCard';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import type { BreadcrumbItem } from '@admin/components/common/Breadcrumb';

export interface StandardFormPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  entityName: string;
  entityNamePlural: string;
  backUrl: string;
  onBack: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
  showActions?: boolean;
  formId?: string;
  customActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    disabled?: boolean;
    primary?: boolean;
  }>;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  breadcrumbs?: BreadcrumbItem[];
  mode?: 'create' | 'update';
  isLoading?: boolean;
  error?: any;
  entityData?: any;
  tipsTitle?: string;
  tipsItems?: string[];
  showTips?: boolean;
}

const StandardFormPage: React.FC<StandardFormPageProps> = ({
  title,
  description,
  icon,
  entityName,
  entityNamePlural,
  backUrl,
  onBack,
  onSubmit,
  onCancel,
  isSubmitting = false,
  children,
  showActions = true,
  formId,
  customActions = [],
  maxWidth = 'full',
  breadcrumbs = [],
  mode = 'create',
  isLoading = false,
  error = null,
  entityData = null,
  tipsTitle,
  tipsItems,
  showTips = true,
}) => {
  const { t } = useTranslationWithBackend();
  const [formStatus, setFormStatus] = useState<'idle' | 'modified' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (isSubmitting && formStatus !== 'saving') {
      setFormStatus('saving');
    } else if (!isSubmitting && formStatus === 'saving') {
      setFormStatus('saved');
      const timer = setTimeout(() => setFormStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitting, formStatus]);

  const getStatusIcon = () => {
    switch (formStatus) {
      case 'modified':
        return <FiClock className="w-4 h-4 text-yellow-500" />;
      case 'saving':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'saved':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return icon;
    }
  };

  const getStatusText = () => {
    switch (formStatus) {
      case 'modified':
        return t('common.unsaved_changes', 'Unsaved changes');
      case 'saving':
        return t('common.saving', 'Saving...');
      case 'saved':
        return t('common.saved', 'Saved');
      default:
        return mode === 'update'
          ? t('common.updating_entity', `Updating ${entityName}`)
          : t('common.creating_entity', `Creating ${entityName}`);
    }
  };

  const defaultBreadcrumbs: BreadcrumbItem[] = breadcrumbs.length > 0 ? breadcrumbs : [
    {
      label: t('common.dashboard', 'Dashboard'),
      href: '/',
    },
    {
      label: entityNamePlural,
      onClick: onBack,
    },
    {
      label: mode === 'update' ? t('common.edit', 'Edit') : t('common.create_new', 'Create New'),
    },
  ];

  const pageActions = [
    {
      label: t('common.back_to_entity', `Back to ${entityNamePlural}`),
      onClick: onBack,
      icon: <FiArrowLeft className="w-4 h-4" />,
    },
    ...customActions,
  ];

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full',
  };

  const defaultTipsItems = mode === 'update'
    ? [
      t('tips.required_fields', 'Fields marked with an asterisk (*) are required'),
      t('tips.update_changes', 'Only modified fields will be updated'),
      t('tips.validation', 'Form validation will guide you through any errors'),
    ]
    : [
      t('tips.required_fields', 'Fields marked with an asterisk (*) are required'),
      t('tips.save_draft', 'You can save your progress and continue later'),
      t('tips.validation', 'Form validation will guide you through any errors'),
    ];

  const resolvedTipsTitle = tipsTitle || t('common.helpful_tips', 'Helpful Tips');
  const resolvedTipsItems = tipsItems && tipsItems.length > 0 ? tipsItems : defaultTipsItems;

  return (
    <BaseLayout
      title={title}
      description={description}
      actions={pageActions}
      breadcrumbs={defaultBreadcrumbs}
    >
      <div className={maxWidth === 'full' ? 'w-full' : `mx-auto ${maxWidthClasses[maxWidth]}`}>
        <div className="space-y-6">
          <div className={`rounded-lg border p-4 transition-all duration-300 ${
            formStatus === 'saving'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : formStatus === 'saved'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    formStatus === 'saving'
                      ? 'bg-blue-100 dark:bg-blue-800'
                      : formStatus === 'saved'
                      ? 'bg-green-100 dark:bg-green-800'
                      : 'bg-primary-100 dark:bg-primary-900'
                  }`}>
                    {getStatusIcon()}
                  </div>
                </div>
                <div>
                  <h3 className={`text-sm font-medium transition-colors ${
                    formStatus === 'saving'
                      ? 'text-blue-900 dark:text-blue-100'
                      : formStatus === 'saved'
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {getStatusText()}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formStatus === 'saving'
                      ? t('common.processing_request', 'Processing your request...')
                      : formStatus === 'saved'
                      ? t('common.changes_saved_successfully', 'Changes saved successfully')
                      : mode === 'update'
                      ? t('common.update_required_fields', 'Update the information below as needed')
                      : t('common.fill_required_fields', 'Fill in the required information below')
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {formStatus === 'modified' && (
                  <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">{t('common.unsaved', 'Unsaved')}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('common.step_1_of_1', 'Step 1 of 1')}
                </div>
              </div>
            </div>

            {formStatus === 'saving' && (
              <div className="mt-3">
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="text-white [&_*]:text-white [&_svg]:text-white">
                    {icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {mode === 'update' && entityData?.name
                      ? entityData.name
                      : title
                    }
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 md:p-8 text-red-500">
                    {t('common.error')}: {error?.message || `Failed to load ${entityName.toLowerCase()}`}
                  </div>
                ) : (
                  children
                )}

                {showActions && !isLoading && !error && (
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel || onBack}
                      disabled={isSubmitting}
                      className="min-w-[100px]"
                    >
                      <FiX className="w-4 h-4 mr-2" />
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type={formId ? 'submit' : 'button'}
                      form={formId}
                      onClick={formId ? undefined : onSubmit}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      <FiSave className="w-4 h-4 mr-2" />
                      {mode === 'update'
                        ? t('common.update_entity', `Update ${entityName}`)
                        : t('common.create_entity', `Create ${entityName}`)
                      }
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {showTips && (
            <HelpfulTipsCard
              title={resolvedTipsTitle}
              items={resolvedTipsItems}
            />
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default StandardFormPage;
