import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { FiSend, FiPlus, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { Textarea } from '../common/Textarea';
import { Toggle } from '../common/Toggle';
import { Loading } from '../common/Loading';
import { Alert, AlertDescription } from '../common/Alert';
import { useTelegramNotificationConfigs } from '../../hooks/useTelegramNotificationConfigs';
import { useToast } from '../../context/ToastContext';

type FormState = {
  name: string;
  botUsername: string;
  botToken: string;
  chatId: string;
  threadId: string;
  description: string;
  isActive: boolean;
};

const DEFAULT_FORM_STATE: FormState = {
  name: '',
  botUsername: '',
  botToken: '',
  chatId: '',
  threadId: '',
  description: '',
  isActive: true,
};

const TelegramNotificationConfigManager: React.FC = () => {
  const {
    configs,
    isLoading,
    error,
    createConfig,
    updateConfig,
    deleteConfig,
    isProcessing,
  } = useTelegramNotificationConfigs();
  const { addToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);

  useEffect(() => {
    if (!selectedId) {
      setFormState(DEFAULT_FORM_STATE);
      return;
    }

    const config = configs.find(cfg => cfg.id === selectedId);
    if (config) {
      setFormState({
        name: config.name,
        botUsername: config.botUsername,
        botToken: config.botToken,
        chatId: config.chatId,
        threadId: config.threadId ? String(config.threadId) : '',
        description: config.description || '',
        isActive: config.isActive,
      });
    }
  }, [configs, selectedId]);

  const sortedConfigs = useMemo(() => {
    return [...configs].sort((a, b) => a.name.localeCompare(b.name));
  }, [configs]);

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    if (selectedId) {
      const config = configs.find(cfg => cfg.id === selectedId);
      if (config) {
        setFormState({
          name: config.name,
          botUsername: config.botUsername,
          botToken: config.botToken,
          chatId: config.chatId,
          threadId: config.threadId ? String(config.threadId) : '',
          description: config.description || '',
          isActive: config.isActive,
        });
        return;
      }
    }
    setFormState(DEFAULT_FORM_STATE);
  };

  const clearForm = () => {
    setSelectedId(null);
    setFormState(DEFAULT_FORM_STATE);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      name: formState.name.trim(),
      botUsername: formState.botUsername.trim(),
      botToken: formState.botToken.trim(),
      chatId: formState.chatId.trim(),
      threadId: formState.threadId ? Number(formState.threadId) : null,
      description: formState.description.trim() || undefined,
      isActive: formState.isActive,
    };

    if (payload.threadId !== null && Number.isNaN(payload.threadId)) {
      addToast({
        type: 'error',
        title: 'Invalid Thread ID',
        description: 'Thread ID must be a valid number.',
      });
      return;
    }

    try {
      if (selectedId) {
        await updateConfig({
          id: selectedId,
          ...payload,
        });
        addToast({
          type: 'success',
          title: 'Telegram Config Updated',
          description: 'The configuration has been updated successfully.',
        });
      } else {
        await createConfig(payload);
        addToast({
          type: 'success',
          title: 'Telegram Config Created',
          description: 'A new telegram configuration has been created.',
        });
      }
      clearForm();
    } catch (mutationError: any) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        description: mutationError?.message || 'Unable to save telegram configuration.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const config = configs.find(cfg => cfg.id === id);
    const confirmed = window.confirm(`Delete telegram configuration "${config?.name || 'this config'}"?`);
    if (!confirmed) return;

    try {
      await deleteConfig(id);
      addToast({
        type: 'success',
        title: 'Telegram Config Deleted',
        description: 'The configuration has been removed.',
      });
      if (selectedId === id) {
        clearForm();
      }
    } catch (mutationError: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: mutationError?.message || 'Unable to delete telegram configuration.',
      });
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg">
            <FiSend className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Telegram Notification Config
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Manage bot credentials and chat targets for telegram notifications.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={resetForm}
            disabled={isProcessing}
          >
            Reset Form
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={clearForm}
            disabled={isProcessing}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            New Config
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load telegram configs. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[160px]">
          <Loading />
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-1/2 overflow-hidden rounded-lg border border-neutral-100 dark:border-neutral-800">
            <table className="min-w-full divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/40 text-neutral-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Chat</th>
                  <th className="text-center px-4 py-3 font-semibold">Active</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {sortedConfigs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                      No telegram configs yet. Create one using the form.
                    </td>
                  </tr>
                )}
                {sortedConfigs.map(config => (
                  <tr
                    key={config.id}
                    className={clsx(
                      'hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors',
                      selectedId === config.id && 'bg-primary/5 dark:bg-primary/10'
                    )}
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-neutral-900 dark:text-neutral-50">{config.name}</div>
                      <div className="text-xs text-neutral-500">@{config.botUsername}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-neutral-900 dark:text-neutral-50">{config.chatId}</div>
                      {config.threadId && (
                        <div className="text-xs text-neutral-500">Thread #{config.threadId}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-semibold',
                        config.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                          : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                      )}>
                        {config.isActive ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedId(config.id)}
                          disabled={isProcessing}
                        >
                          <FiEdit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error hover:text-error"
                          onClick={() => handleDelete(config.id)}
                          disabled={isProcessing}
                        >
                          <FiTrash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:w-1/2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="telegram-config-name"
                  type="text"
                  label="Config Name"
                  value={formState.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Customer Support Alerts"
                />
                <FormInput
                  id="telegram-config-username"
                  type="text"
                  label="Bot Username"
                  value={formState.botUsername}
                  onChange={(e) => handleChange('botUsername', e.target.value)}
                  required
                  placeholder="@company_bot"
                />
              </div>

              <Textarea
                id="telegram-config-token"
                label="Bot Token"
                value={formState.botToken}
                onChange={(e) => handleChange('botToken', e.target.value)}
                required
                rows={3}
                placeholder="123456789:ABCDEF1234567890abcdef1234567890"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="telegram-config-chat"
                  type="text"
                  label="Chat ID"
                  value={formState.chatId}
                  onChange={(e) => handleChange('chatId', e.target.value)}
                  required
                  placeholder="-10012345678"
                />
                <FormInput
                  id="telegram-config-thread"
                  type="number"
                  label="Thread ID (optional)"
                  value={formState.threadId}
                  onChange={(e) => handleChange('threadId', e.target.value)}
                  placeholder="12345"
                />
              </div>

              <Textarea
                id="telegram-config-description"
                label="Description"
                value={formState.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Explain what this configuration is used for."
              />

              <div className="flex items-center justify-between border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Active</div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Disable to stop using this config without deleting it.
                  </p>
                </div>
                <Toggle
                  checked={formState.isActive}
                  onChange={(checked) => handleChange('isActive', checked)}
                  label=""
                />
              </div>

              <div className="flex gap-3 justify-end">
                {selectedId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearForm}
                    disabled={isProcessing}
                  >
                    Cancel Editing
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isProcessing}
                >
                  {selectedId ? 'Update Config' : 'Create Config'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TelegramNotificationConfigManager;
