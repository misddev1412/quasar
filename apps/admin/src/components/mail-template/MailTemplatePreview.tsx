import React, { useState, useEffect } from 'react';
import { Eye, Code, Settings, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FormInput } from '../common/FormInput';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { MailTemplate, ProcessedTemplate } from '../../types/mail-template';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../context/ToastContext';
import { Loading } from '../common/Loading';
import { Alert, AlertDescription } from '../common/Alert';

interface MailTemplatePreviewProps {
  template: MailTemplate;
  onClose?: () => void;
  className?: string;
}

export const MailTemplatePreview: React.FC<MailTemplatePreviewProps> = ({
  template,
  onClose,
  className = '',
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [previewMode, setPreviewMode] = useState<'visual' | 'code'>('visual');
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [processedTemplate, setProcessedTemplate] = useState<ProcessedTemplate | null>(null);

  // Initialize variables with empty values
  useEffect(() => {
    if (template.variables) {
      const initialVariables: Record<string, any> = {};
      template.variables.forEach(variable => {
        initialVariables[variable] = '';
      });
      setVariables(initialVariables);
    }
  }, [template.variables]);

  // Process template mutation
  const processTemplateMutation = trpc.adminMailTemplate.processTemplate.useMutation({
    onSuccess: (response: any) => {
      setProcessedTemplate(response.data || response);
    },
    onError: (error) => {
      addToast({
        title: error.message || t('mail_templates.preview_error', 'Failed to process template'),
        type: 'error'
      });
    },
  });

  // Process template when variables change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      processTemplateMutation.mutate({
        templateId: template.id,
        variables,
      });
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [template.id, variables]);

  const handleVariableChange = (variableName: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [variableName]: value,
    }));
  };

  const resetVariables = () => {
    const resetVars: Record<string, any> = {};
    if (template.variables) {
      template.variables.forEach(variable => {
        resetVars[variable] = '';
      });
    }
    setVariables(resetVars);
  };

  const loadSampleData = () => {
    const sampleData: Record<string, any> = {
      user_name: 'John Doe',
      user_email: 'john.doe@example.com',
      app_name: 'My Application',
      reset_link: 'https://example.com/reset-password?token=abc123',
      verification_link: 'https://example.com/verify?token=xyz789',
      expiry_time: '24 hours',
      company_name: 'Acme Corporation',
      support_email: 'support@example.com',
      current_date: new Date().toLocaleDateString(),
      current_year: new Date().getFullYear().toString(),
    };

    const updatedVariables: Record<string, any> = {};
    if (template.variables) {
      template.variables.forEach(variable => {
        updatedVariables[variable] = sampleData[variable] || `Sample ${variable}`;
      });
    }
    setVariables(updatedVariables);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('mail_templates.preview_template', 'Preview Template')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {template.name} - {template.type}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(previewMode === 'visual' ? 'code' : 'visual')}
          >
            {previewMode === 'visual' ? (
              <>
                <Code className="w-4 h-4 mr-2" />
                {t('mail_templates.view_code', 'View Code')}
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                {t('mail_templates.view_visual', 'View Visual')}
              </>
            )}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variables Panel */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t('mail_templates.variables', 'Variables')}
                </h4>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSampleData}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {t('mail_templates.sample_data', 'Sample')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetVariables}
                  >
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
              </div>

              {template.variables && template.variables.length > 0 ? (
                <div className="space-y-3">
                  {template.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {variable}
                      </label>
                      <FormInput
                        id={`variable-${variable}`}
                        label={variable}
                        type="text"
                        value={variables[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        placeholder={`Enter ${variable}`}
                        size="md"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('mail_templates.no_variables', 'No variables defined for this template')}
                </p>
              )}

              {/* Missing Variables Warning */}
              {processedTemplate && processedTemplate.missingVariables.length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    {t('mail_templates.missing_variables', 'Missing variables')}: {processedTemplate.missingVariables.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {/* All Variables Provided */}
              {processedTemplate && processedTemplate.missingVariables.length === 0 && template.variables && template.variables.length > 0 && (
                <Alert variant="default" className="mt-4 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    {t('mail_templates.all_variables_provided', 'All variables have values')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                {t('mail_templates.email_preview', 'Email Preview')}
              </h4>

              {processTemplateMutation.isPending ? (
                <div className="flex items-center justify-center py-8">
                  <Loading size="small" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {t('mail_templates.processing', 'Processing template...')}
                  </span>
                </div>
              ) : processedTemplate ? (
                <div className="space-y-4">
                  {/* Subject Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('mail_templates.subject', 'Subject')}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {processedTemplate.subject}
                      </p>
                    </div>
                  </div>

                  {/* Body Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('mail_templates.body', 'Body')}
                    </label>
                    <div className="border rounded-md overflow-hidden">
                      {previewMode === 'visual' ? (
                        <div 
                          className="p-4 bg-white dark:bg-gray-900 min-h-[300px] prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: processedTemplate.body }}
                        />
                      ) : (
                        <pre className="p-4 bg-gray-50 dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-[400px]">
                          {processedTemplate.body}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('mail_templates.no_preview', 'No preview available')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
