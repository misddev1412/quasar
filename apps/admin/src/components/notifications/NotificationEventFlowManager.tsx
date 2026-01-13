import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../common/Loading';
import { Alert, AlertDescription } from '../common/Alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../common/Dialog';
import { FormInput } from '../common/FormInput';
import Textarea from '../common/Textarea';
import { Toggle } from '../common/Toggle';
import SearchSelect from '../common/SearchSelect';
import { Select } from '../common/Select';
import type { NotificationChannel } from '../../hooks/useNotificationPreferences';
import {
  NOTIFICATION_EVENT_LABELS,
  NOTIFICATION_EVENT_OPTIONS,
  NotificationEventFlow,
  NotificationEventFlowRecipient,
  NotificationEventKey,
} from '../../types/notification-events';

type TemplateOption = {
  value: string;
  label: string;
  subject?: string;
  description?: string | null;
};

type UserOption = {
  value: string;
  label: string;
  email: string;
};

interface EventFlowFormState {
  eventKey: NotificationEventKey | '';
  displayName: string;
  description: string;
  channelPreferences: NotificationChannel[];
  includeActor: boolean;
  ccEmails: string[];
  bccEmails: string[];
}

const CHANNEL_OPTIONS: Array<{
  value: NotificationChannel;
  label: string;
  description: string;
}> = [
  { value: 'email', label: 'Email', description: 'Send templated email notifications' },
  { value: 'sms', label: 'SMS', description: 'Send SMS text messages' },
  { value: 'telegram', label: 'Telegram', description: 'Send via configured Telegram bot' },
  { value: 'push', label: 'Push', description: 'Mobile/web push notifications' },
  { value: 'in_app', label: 'In-app', description: 'Appear inside the dashboard' },
];

const CHANNEL_BADGE_VARIANT: Record<NotificationChannel, Parameters<typeof Badge>[0]['variant']> = {
  email: 'info',
  sms: 'warning',
  telegram: 'success',
  push: 'secondary',
  in_app: 'default',
};

const defaultFormState: EventFlowFormState = {
  eventKey: '',
  displayName: '',
  description: '',
  channelPreferences: ['email'],
  includeActor: true,
  ccEmails: [],
  bccEmails: [],
};

const parseEmails = (value: string): string[] =>
  value
    .split(/[\n,]+/)
    .map((email) => email.trim())
    .filter(Boolean);

const toUserOption = (recipient: NotificationEventFlowRecipient): UserOption => ({
  value: recipient.id,
  label: recipient.fullName ? `${recipient.fullName} (${recipient.email})` : recipient.email,
  email: recipient.email,
});

const NotificationEventFlowManager: React.FC = () => {
  const { addToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<NotificationEventFlow | null>(null);
  const [formState, setFormState] = useState<EventFlowFormState>(defaultFormState);
  const [primaryRecipients, setPrimaryRecipients] = useState<UserOption[]>([]);
  const [ccRecipients, setCcRecipients] = useState<UserOption[]>([]);
  const [bccRecipients, setBccRecipients] = useState<UserOption[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateOption[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUserSearching, setIsUserSearching] = useState(false);
  const [isTemplateSearching, setIsTemplateSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const templateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUserSearchValueRef = useRef<string>('');
  const lastTemplateSearchValueRef = useRef<string>('');

  const { data, isLoading, error, refetch } = trpc.adminNotification.listEventFlows.useQuery({
    page: 1,
    limit: 100,
  });

  const upsertMutation = trpc.adminNotification.upsertEventFlow.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteMutation = trpc.adminNotification.deleteEventFlow.useMutation({
    onSuccess: () => refetch(),
  });

  const flows = useMemo(() => {
    const response = (data as { data?: { items?: NotificationEventFlow[] } })?.data;
    return (response?.items || []) as NotificationEventFlow[];
  }, [data]);

  const flowByEvent = useMemo(() => {
    const map = new Map<NotificationEventKey, NotificationEventFlow>();
    flows.forEach((flow) => map.set(flow.eventKey, flow));
    return map;
  }, [flows]);

  const usedEventKeys = useMemo(() => new Set(flowByEvent.keys()), [flowByEvent]);

  const resetForm = () => {
    setFormState(defaultFormState);
    setPrimaryRecipients([]);
    setCcRecipients([]);
    setBccRecipients([]);
    setSelectedTemplates([]);
    setErrors({});
    setEditingFlow(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const mergeUserOptions = useCallback((options: UserOption[]) => {
    setUserOptions((prev) => {
      const map = new Map<string, UserOption>();
      [...prev, ...options].forEach((opt) => map.set(opt.value, opt));
      return Array.from(map.values());
    });
  }, []);

  const mergeTemplateOptions = useCallback((options: TemplateOption[]) => {
    setTemplateOptions((prev) => {
      const map = new Map<string, TemplateOption>();
      [...prev, ...options].forEach((opt) => map.set(opt.value, opt));
      return Array.from(map.values());
    });
  }, []);

  const openForm = (flow?: NotificationEventFlow, eventKey?: NotificationEventKey) => {
    setErrors({});
    if (flow) {
      setEditingFlow(flow);
      setFormState({
        eventKey: flow.eventKey,
        displayName: flow.displayName,
        description: flow.description || '',
        channelPreferences: flow.channelPreferences?.length ? flow.channelPreferences : ['email'],
        includeActor: flow.includeActor,
        ccEmails: flow.ccEmails || [],
        bccEmails: flow.bccEmails || [],
      });
      const templates = (flow.mailTemplates || []).map((template) => ({
        value: template.id,
        label: template.name,
        subject: template.subject,
        description: template.description,
      }));
      setSelectedTemplates(templates);
      mergeTemplateOptions(templates);

      const recipientOptions = (flow.recipients || []).map(toUserOption);
      const ccOptions = (flow.ccRecipients || []).map(toUserOption);
      const bccOptions = (flow.bccRecipients || []).map(toUserOption);
      setPrimaryRecipients(recipientOptions);
      setCcRecipients(ccOptions);
      setBccRecipients(bccOptions);
      mergeUserOptions([...recipientOptions, ...ccOptions, ...bccOptions]);
    } else {
      setEditingFlow(null);
      setFormState({
        ...defaultFormState,
        eventKey: eventKey || '',
        displayName: eventKey ? NOTIFICATION_EVENT_LABELS[eventKey] : '',
      });
    }

    setDialogOpen(true);
  };

  const handleEventChange = (value: NotificationEventKey) => {
    setFormState((prev) => ({
      ...prev,
      eventKey: value,
      displayName: prev.displayName || NOTIFICATION_EVENT_LABELS[value],
    }));
  };

  const handleChannelToggle = (channel: NotificationChannel) => {
    setFormState((prev) => {
      const exists = prev.channelPreferences.includes(channel);
      const next = exists
        ? prev.channelPreferences.filter((item) => item !== channel)
        : [...prev.channelPreferences, channel];
      return { ...prev, channelPreferences: next };
    });
  };

  const handleUserSearch = useCallback(async (inputValue: string = '') => {
    setIsUserSearching(true);
    try {
      const { trpcClient } = await import('../../utils/trpc');
      const response = await trpcClient.adminNotification.searchNotificationRecipients.query({
        query: inputValue,
        limit: 10,
      });
      const items = (response as { data?: { items?: NotificationEventFlowRecipient[] } })?.data?.items || [];
      const options = items.map(toUserOption);
      mergeUserOptions(options);
    } catch (err) {
      console.error('Failed to search recipients', err);
    } finally {
      setIsUserSearching(false);
    }
  }, [mergeUserOptions]);

  const debouncedUserSearch = (value: string, action?: { action: string }) => {
    // Ignore if this is just a focus/blur/hover event, not an actual input change
    if (action && ['set-value', 'input-blur', 'input-focus', 'menu-close'].includes(action.action)) {
      return;
    }
    
    // Only search if value actually changed
    if (lastUserSearchValueRef.current === value) {
      return;
    }
    
    lastUserSearchValueRef.current = value;
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Always debounce, even for empty values
    searchTimeoutRef.current = setTimeout(() => {
      // If value is empty or less than 2 chars, load default items
      if (!value || value.length < 2) {
        handleUserSearch('');
      } else {
        handleUserSearch(value);
      }
    }, 300);
  };

  const handleTemplateSearch = useCallback(async (inputValue: string = '') => {
    setIsTemplateSearching(true);
    try {
      const { trpcClient } = await import('../../utils/trpc');
      const response = await trpcClient.adminMailTemplate.searchTemplates.query({
        searchTerm: inputValue,
      });
      const templates = ((response as { data?: any[] })?.data || []).map((template) => ({
        value: template.id,
        label: template.name,
        subject: template.subject,
        description: template.description,
      }));
      mergeTemplateOptions(templates);
    } catch (err) {
      console.error('Failed to search templates', err);
    } finally {
      setIsTemplateSearching(false);
    }
  }, [mergeTemplateOptions]);

  const debouncedTemplateSearch = (value: string, action?: { action: string }) => {
    // Ignore if this is just a focus/blur/hover event, not an actual input change
    if (action && ['set-value', 'input-blur', 'input-focus', 'menu-close'].includes(action.action)) {
      return;
    }
    
    // Only search if value actually changed
    if (lastTemplateSearchValueRef.current === value) {
      return;
    }
    
    lastTemplateSearchValueRef.current = value;
    
    // Clear existing timeout
    if (templateTimeoutRef.current) {
      clearTimeout(templateTimeoutRef.current);
    }
    
    // Always debounce, even for empty values
    templateTimeoutRef.current = setTimeout(() => {
      // If value is empty or less than 2 chars, load default items
      if (!value || value.length < 2) {
        handleTemplateSearch('');
      } else {
        handleTemplateSearch(value);
      }
    }, 300);
  };

  // Load default items when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      // Reset search value refs
      lastUserSearchValueRef.current = '';
      lastTemplateSearchValueRef.current = '';
      // Load default users and templates
      handleUserSearch('');
      handleTemplateSearch('');
    }
  }, [dialogOpen, handleUserSearch, handleTemplateSearch]);

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!formState.eventKey) {
      nextErrors.eventKey = 'Please choose an event';
    }
    if (!formState.displayName.trim()) {
      nextErrors.displayName = 'A display name is required';
    }
    if (formState.channelPreferences.length === 0) {
      nextErrors.channelPreferences = 'Select at least one delivery channel';
    }
    if (selectedTemplates.length === 0) {
      nextErrors.mailTemplates = 'Select at least one mail template';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      await upsertMutation.mutateAsync({
        id: editingFlow?.id,
        eventKey: formState.eventKey as NotificationEventKey,
        displayName: formState.displayName.trim(),
        description: formState.description.trim() || undefined,
        channelPreferences: formState.channelPreferences,
        includeActor: formState.includeActor,
        recipientUserIds: primaryRecipients.map((recipient) => recipient.value),
        ccUserIds: ccRecipients.map((recipient) => recipient.value),
        bccUserIds: bccRecipients.map((recipient) => recipient.value),
        ccEmails: formState.ccEmails,
        bccEmails: formState.bccEmails,
        mailTemplateIds: selectedTemplates.map((template) => template.value),
      });
      addToast({
        title: 'Notification flow saved',
        description: 'The event flow configuration has been updated successfully.',
        type: 'success',
      });
      handleDialogClose();
    } catch (err) {
      console.error('Failed to save flow', err);
      addToast({
        title: 'Unable to save flow',
        description: 'Please check the form fields and try again.',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!editingFlow?.id) {
      return;
    }
    const confirmed = window.confirm('Are you sure you want to remove this notification event flow?');
    if (!confirmed) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id: editingFlow.id });
      addToast({
        title: 'Flow removed',
        description: 'The notification flow has been deleted.',
        type: 'success',
      });
      handleDialogClose();
    } catch (err) {
      console.error('Failed to delete flow', err);
      addToast({
        title: 'Unable to delete flow',
        description: 'Please try again later.',
        type: 'error',
      });
    }
  };

  const renderRecipientSummary = (flow: NotificationEventFlow) => {
    const extras = [
      flow.includeActor ? 'Actor (triggering user)' : null,
      flow.recipients?.length ? `${flow.recipients.length} direct recipient(s)` : null,
      flow.ccRecipients?.length ? `${flow.ccRecipients.length} CC` : null,
      flow.bccRecipients?.length ? `${flow.bccRecipients.length} BCC` : null,
      flow.ccEmails?.length ? `${flow.ccEmails.length} CC emails` : null,
      flow.bccEmails?.length ? `${flow.bccEmails.length} BCC emails` : null,
    ].filter(Boolean);

    if (extras.length === 0) {
      return <span className="text-sm text-neutral-500">No recipients configured</span>;
    }

    return (
      <ul className="text-sm text-neutral-700 dark:text-neutral-300 list-disc list-inside space-y-1">
        {extras.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderFlowCard = (eventKey: NotificationEventKey, flow?: NotificationEventFlow) => {
    const configured = Boolean(flow);
    const description = flow?.description || `Configure how "${NOTIFICATION_EVENT_LABELS[eventKey]}" should be delivered.`;
    const channelBadges = (flow?.channelPreferences || ['email']).map((channel) => (
      <Badge key={`${eventKey}-${channel}`} variant={CHANNEL_BADGE_VARIANT[channel]} className="capitalize">
        {channel.replace('_', ' ')}
      </Badge>
    ));

    const templateSummary = flow?.mailTemplates?.length
      ? flow.mailTemplates.map((template) => template.name).join(', ')
      : 'No templates selected';

    return (
      <Card key={eventKey} className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{flow?.displayName || NOTIFICATION_EVENT_LABELS[eventKey]}</CardTitle>
            {!flow?.isActive && (
              <Badge variant="warning" size="sm">
                Inactive
              </Badge>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase text-neutral-500">Channels</span>
            <div className="mt-2 flex flex-wrap gap-2">{channelBadges}</div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-neutral-500">Mail templates</span>
            <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-200">{templateSummary}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-neutral-500">Recipients</span>
            <div className="mt-2">{renderRecipientSummary(flow || ({} as NotificationEventFlow))}</div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-xs text-neutral-500">
            {configured ? 'Configured flow' : 'Not configured'}
          </div>
          <Button
            size="sm"
            variant={configured ? 'primary' : 'outline'}
            onClick={() => openForm(flow, eventKey)}
          >
            {configured ? 'Edit flow' : 'Configure flow'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const dialogTitle = editingFlow ? 'Edit notification flow' : 'Configure notification flow';

  const selectedEventOptions = NOTIFICATION_EVENT_OPTIONS.map((option) => ({
    ...option,
    disabled: !editingFlow && usedEventKeys.has(option.value),
  }));

  const combinedUserOptions = useMemo(() => {
    const selected = [...primaryRecipients, ...ccRecipients, ...bccRecipients];
    return Array.from(new Map([...selected, ...userOptions].map((opt) => [opt.value, opt])).values());
  }, [primaryRecipients, ccRecipients, bccRecipients, userOptions]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Notification Event Flows</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Control who receives notifications for each system event and through which channels.
            </p>
          </div>
          <Button onClick={() => openForm(undefined, undefined)}>
            Create Custom Flow
          </Button>
        </div>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loading />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>Unable to load notification flows. Please try again later.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {NOTIFICATION_EVENT_OPTIONS.map((option) => renderFlowCard(option.value, flowByEvent.get(option.value)))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => (!open ? handleDialogClose() : setDialogOpen(open))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Select templates, recipients, and delivery channels for this notification event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                id="flow-event-key"
                label="Event"
                value={formState.eventKey}
                onChange={(value) => handleEventChange(value as NotificationEventKey)}
                options={selectedEventOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                  disabled: option.disabled,
                }))}
                placeholder="Select an event"
                disabled={Boolean(editingFlow)}
                error={errors.eventKey}
                size="md"
              />
              <FormInput
                id="flow-display-name"
                type="text"
                label="Display name"
                value={formState.displayName}
                onChange={(e) => setFormState((prev) => ({ ...prev, displayName: e.target.value }))}
                error={errors.displayName}
                placeholder="Welcome mail channel priority"
                size="md"
              />
            </div>

            <Textarea
              label="Description"
              rows={3}
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe when this flow should be triggered."
            />

            <div>
              <span className="text-sm font-medium text-neutral-800">Delivery channels</span>
              {errors.channelPreferences && (
                <p className="mt-1 text-xs text-red-500">{errors.channelPreferences}</p>
              )}
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {CHANNEL_OPTIONS.map((channel) => {
                  const checked = formState.channelPreferences.includes(channel.value);
                  return (
                    <label
                      key={channel.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                        checked ? 'border-primary-500 bg-primary-50/40' : 'border-neutral-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() => handleChannelToggle(channel.value)}
                      />
                      <div>
                        <p className="text-sm font-semibold capitalize">{channel.label}</p>
                        <p className="text-xs text-neutral-500">{channel.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Recipients</p>
                  <p className="text-xs text-neutral-500">Control who receives primary, CC, and BCC emails.</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>Send to triggering user</span>
                  <Toggle
                    checked={formState.includeActor}
                    onChange={(checked) => setFormState((prev) => ({ ...prev, includeActor: checked }))}
                  />
                </div>
              </div>

              <SearchSelect<UserOption, true>
                label="Additional recipients"
                placeholder="Search users..."
                isMulti
                isLoading={isUserSearching}
                options={combinedUserOptions}
                value={primaryRecipients}
                onInputChange={(value, action) => {
                  debouncedUserSearch(value, action);
                  return value;
                }}
                onChange={(value) => setPrimaryRecipients((value ?? []) as UserOption[])}
                size="md"
              />

              <SearchSelect<UserOption, true>
                label="CC"
                placeholder="Search users to CC..."
                isMulti
                isLoading={isUserSearching}
                options={combinedUserOptions}
                value={ccRecipients}
                onInputChange={(value, action) => {
                  debouncedUserSearch(value, action);
                  return value;
                }}
                onChange={(value) => setCcRecipients((value ?? []) as UserOption[])}
                size="md"
              />

              <Textarea
                label="CC email addresses"
                placeholder="one@example.com"
                rows={2}
                value={formState.ccEmails.join('\n')}
                onChange={(e) => setFormState((prev) => ({ ...prev, ccEmails: parseEmails(e.target.value) }))}
              />

              <SearchSelect<UserOption, true>
                label="BCC"
                placeholder="Search users to BCC..."
                isMulti
                isLoading={isUserSearching}
                options={combinedUserOptions}
                value={bccRecipients}
                onInputChange={(value, action) => {
                  debouncedUserSearch(value, action);
                  return value;
                }}
                onChange={(value) => setBccRecipients((value ?? []) as UserOption[])}
                size="md"
              />

              <Textarea
                label="BCC email addresses"
                placeholder="hidden@example.com"
                rows={2}
                value={formState.bccEmails.join('\n')}
                onChange={(e) => setFormState((prev) => ({ ...prev, bccEmails: parseEmails(e.target.value) }))}
              />
            </div>

            <div>
              <SearchSelect<TemplateOption, true>
                label="Mail templates"
                placeholder="Search templates..."
                isMulti
                isLoading={isTemplateSearching}
                options={templateOptions}
                value={selectedTemplates}
                onInputChange={(value, action) => {
                  debouncedTemplateSearch(value, action);
                  return value;
                }}
                onChange={(value) => setSelectedTemplates((value ?? []) as TemplateOption[])}
                size="md"
              />
              {errors.mailTemplates && <p className="mt-1 text-xs text-red-500">{errors.mailTemplates}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3">
            {editingFlow && (
              <Button
                variant="ghost"
                className="mr-auto text-red-600"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                isLoading={deleteMutation.isPending}
              >
                Delete Flow
              </Button>
            )}
            <Button variant="outline" onClick={handleDialogClose} disabled={upsertMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={upsertMutation.isPending}>
              Save Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationEventFlowManager;
