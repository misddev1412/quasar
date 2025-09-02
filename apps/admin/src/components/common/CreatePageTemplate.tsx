import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from './Card';
import BaseLayout from '../layout/BaseLayout';
import { Button } from './Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface CreatePageTemplateProps {
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
  customActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    disabled?: boolean;
  }>;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  mode?: 'create' | 'update';
  isLoading?: boolean;
  error?: any;
  entityData?: any;
}

export const CreatePageTemplate: React.FC<CreatePageTemplateProps> = ({
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
  showActions = false,
  customActions = [],
  maxWidth = '4xl',
  breadcrumbs = [],
  mode = 'create',
  isLoading = false,
  error = null,
  entityData = null,
}) => {
  const { t } = useTranslationWithBackend();
  const [formStatus, setFormStatus] = useState<'idle' | 'modified' | 'saving' | 'saved'>('idle');
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-save status indicator
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
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'saving':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
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

  // Generate breadcrumbs automatically if none provided
  const defaultBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : [
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

  // Page actions in header
  const pageActions = [
    {
      label: t('common.back_to_entity', `Back to ${entityNamePlural}`),
      onClick: onBack,
      icon: <ArrowLeft className="w-4 h-4" />,
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

  return (
    <BaseLayout
      title={title}
      description={description}
      actions={pageActions}
    >
      <div className={maxWidth === 'full' ? 'w-full' : `mx-auto ${maxWidthClasses[maxWidth]}`}>
        <div className="space-y-6">
          {/* Progress indicator */}
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
            
            {/* Progress bar */}
            {formStatus === 'saving' && (
              <div className="mt-3">
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Main content card */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="text-white [&>svg]:w-6 [&>svg]:h-6 [&>svg]:!text-white">
                    {icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {mode === 'update' && entityData?.name
                      ? entityData.name
                      : t('common.entity_information', `${entityName} Information`)
                    }
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {mode === 'update'
                      ? t('common.update_entity_description', `Update the ${entityName.toLowerCase()} information and settings`)
                      : t('common.entity_information_description', `Provide the required details to create a new ${entityName.toLowerCase()}`)
                    }
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Loading state */}
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

                {/* Action buttons */}
                {showActions && !isLoading && !error && (
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel || onBack}
                      disabled={isSubmitting}
                      className="min-w-[100px]"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      onClick={onSubmit}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      <Save className="w-4 h-4 mr-2" />
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

          {/* Helper card with tips */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {t('common.helpful_tips', 'Helpful Tips')}
                  </h4>
                  <ul className="mt-2 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• {t('tips.required_fields', 'Fields marked with an asterisk (*) are required')}</li>
                    {mode === 'update' ? (
                      <>
                        <li>• {t('tips.update_changes', 'Only modified fields will be updated')}</li>
                        <li>• {t('tips.validation', 'Form validation will guide you through any errors')}</li>
                      </>
                    ) : (
                      <>
                        <li>• {t('tips.save_draft', 'You can save your progress and continue later')}</li>
                        <li>• {t('tips.validation', 'Form validation will guide you through any errors')}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
};

// Export aliases for better semantic naming
export const UpdatePageTemplate = CreatePageTemplate;
export const FormPageTemplate = CreatePageTemplate;

export default CreatePageTemplate;