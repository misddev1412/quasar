import React, { useState, useEffect } from 'react';
import { useNotificationPreferences, NotificationPreference, NotificationChannel } from '../../hooks/useNotificationPreferences';
import {
  FiMail,
  FiSmartphone,
  FiMonitor,
  FiClock,
  FiSave,
  FiRotateCcw,
  FiInfo,
  FiChevronDown,
  FiBell,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiSend,
} from 'react-icons/fi';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FormInput } from '../common/FormInput';
import { Loading } from '../common/Loading';
import { Alert, AlertDescription } from '../common/Alert';
import { Toggle } from '../common/Toggle';
import clsx from 'clsx';

interface AccordionProps {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  children,
  title,
  subtitle,
  icon,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          <div className="text-left">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </div>
            {subtitle && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <FiChevronDown
          className={clsx(
            'w-5 h-5 text-neutral-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          {children}
        </div>
      )}
    </div>
  );
};

interface NotificationChipProps {
  type: string;
  color: string;
}

const NotificationChip: React.FC<NotificationChipProps> = ({ type, color }) => {
  const colorClasses = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200',
  };

  return (
    <span className={clsx(
      'px-2 py-1 rounded-md text-xs font-semibold',
      colorClasses[color as keyof typeof colorClasses] || colorClasses.default
    )}>
      {getNotificationTypeLabel(type)}
    </span>
  );
};


interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={clsx(
            'w-full h-11 px-4 pr-10 border border-neutral-300 dark:border-neutral-700',
            'rounded-lg bg-white dark:bg-neutral-900',
            'text-sm text-neutral-900 dark:text-neutral-100',
            'focus:ring-1 focus:ring-primary focus:border-primary',
            'appearance-none cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  );
};

const ChannelIcon = ({ channel }: { channel: string }) => {
  switch (channel) {
    case 'email':
      return <FiMail className="w-4 h-4" />;
    case 'push':
      return <FiSmartphone className="w-4 h-4" />;
    case 'in_app':
      return <FiMonitor className="w-4 h-4" />;
    case 'sms':
      return <FiMessageSquare className="w-4 h-4" />;
    case 'telegram':
      return <FiSend className="w-4 h-4" />;
    default:
      return <FiBell className="w-4 h-4" />;
  }
};

const AVAILABLE_CHANNELS: NotificationChannel[] = ['email', 'push', 'sms', 'telegram', 'in_app'];

const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'info':
      return 'info';
    case 'product':
      return 'primary';
    case 'order':
      return 'secondary';
    case 'user':
      return 'info';
    case 'system':
      return 'default';
    default:
      return 'default';
  }
};

const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case 'info':
      return 'Information';
    case 'success':
      return 'Success';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Error';
    case 'system':
      return 'System';
    case 'product':
      return 'Product';
    case 'order':
      return 'Order';
    case 'user':
      return 'User';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

const frequencies = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'hourly', label: 'Hourly digest' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
  { value: 'never', label: 'Never' },
];


interface NotificationSettingsProps {
  userId: string;
  onSave?: (preferences: NotificationPreference[]) => void;
  onReset?: () => void;
}


const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
  onSave,
  onReset,
}) => {
  const {
    preferences: groupedPreferences,
    rawPreferences,
    isLoading,
    error,
    updatePreference,
    bulkUpdatePreferences,
    toggleNotificationType,
    setQuietHours,
    getQuietHours,
    initializePreferences,
    refetch,
  } = useNotificationPreferences(userId);

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [globalQuietHours, setGlobalQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Convert grouped preferences to the format expected by the component
  const convertedGroupedPreferences = groupedPreferences.reduce((acc, prefGroup) => {
    acc[prefGroup.type] = {};
    Object.entries(prefGroup.channels).forEach(([channel, channelData]) => {
      acc[prefGroup.type][channel] = {
        type: prefGroup.type,
        channel: channel as NotificationChannel,
        enabled: channelData.enabled,
        frequency: channelData.frequency,
        quietHoursStart: channelData.quietHoursStart,
        quietHoursEnd: channelData.quietHoursEnd,
        quietHoursTimezone: channelData.quietHoursTimezone,
        settings: channelData.settings,
      };
    });
    return acc;
  }, {} as Record<string, Record<string, NotificationPreference>>);

  const handlePreferenceChange = async (
    type: string,
    channel: string,
    field: keyof NotificationPreference,
    value: boolean | string
  ) => {
    try {
      await updatePreference(type as any, channel as any, { [field]: value });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  };

  const handleToggleAllForType = async (type: string, enabled: boolean) => {
    try {
      await toggleNotificationType(type as any, enabled);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to toggle notification type:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // All changes are saved immediately, this is just for UI feedback
      onSave?.(rawPreferences);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await initializePreferences();
      setHasChanges(false);
      onReset?.();
    } catch (error) {
      console.error('Failed to reset preferences:', error);
    }
  };

  const handleQuietHoursChange = async () => {
    if (globalQuietHours.enabled) {
      try {
        // Apply quiet hours to all channels
        for (const channel of AVAILABLE_CHANNELS) {
          await setQuietHours(
            channel,
            globalQuietHours.start,
            globalQuietHours.end,
            globalQuietHours.timezone
          );
        }
      } catch (error) {
        console.error('Failed to set quiet hours:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loading />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Failed to load notification preferences: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={refetch} variant="outline" size="md" className="px-4 py-2">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <FiBell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Notification Preferences
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Customize how you receive notifications across different channels
          </p>
        </div>
      </div>

      {/* Global Quiet Hours */}
      <Accordion
        title="Quiet Hours"
        subtitle="Set times when you don't want to receive notifications"
        icon={<FiClock />}
      >
        <div className="space-y-4">
          <Toggle
            checked={globalQuietHours.enabled}
            onChange={(checked) => {
              setGlobalQuietHours(prev => ({ ...prev, enabled: checked }));
              handleQuietHoursChange();
            }}
            label="Enable quiet hours"
          />
          {globalQuietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="quiet-start"
                type="time"
                label="Start time"
                value={globalQuietHours.start}
                onChange={(e) =>
                  setGlobalQuietHours(prev => ({ ...prev, start: e.target.value }))
                }
              />
              <FormInput
                id="quiet-end"
                type="time"
                label="End time"
                value={globalQuietHours.end}
                onChange={(e) =>
                  setGlobalQuietHours(prev => ({ ...prev, end: e.target.value }))
                }
              />
              <FormInput
                id="quiet-timezone"
                type="text"
                label="Timezone"
                value={globalQuietHours.timezone}
                onChange={(e) =>
                  setGlobalQuietHours(prev => ({ ...prev, timezone: e.target.value }))
                }
              />
            </div>
          )}
        </div>
      </Accordion>

      {/* Notification Type Settings */}
      {Object.entries(convertedGroupedPreferences).map(([type, channelPrefs]) => (
        <Accordion
          key={type}
          title={
            <div className="flex items-center gap-3 w-full">
              <NotificationChip type={type} color={getNotificationTypeColor(type)} />
              <div className="flex-1">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {Object.values(channelPrefs).filter(p => p.enabled).length} of {Object.keys(channelPrefs).length} channels enabled
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="px-3 py-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  const allEnabled = Object.values(channelPrefs).every(p => p.enabled);
                  handleToggleAllForType(type, !allEnabled);
                }}
              >
                {Object.values(channelPrefs).every(p => p.enabled) ? 'Disable All' : 'Enable All'}
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {AVAILABLE_CHANNELS.filter(channel => !!channelPrefs[channel]).map(channel => {
              const pref = channelPrefs[channel];
              if (!pref) return null;

              return (
                <div key={channel} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 hover:border-primary/30 hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-primary">
                      <ChannelIcon channel={channel} />
                    </div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {channel.charAt(0).toUpperCase() + channel.slice(1).replace('_', ' ')}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <Toggle
                      checked={pref.enabled}
                      onChange={(checked) =>
                        handlePreferenceChange(type, channel, 'enabled', checked)
                      }
                      label="Enabled"
                      size="sm"
                    />

                    {pref.enabled && (
                      <Select
                        value={pref.frequency}
                        onChange={(value) =>
                          handlePreferenceChange(type, channel, 'frequency', value)
                        }
                        options={frequencies}
                        label="Frequency"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Accordion>
      ))}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <FiInfo className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Changes are automatically saved
          </span>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            className="px-4 py-2"
            startIcon={<FiRotateCcw />}
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            className="px-4 py-2"
            startIcon={saving ? <Loading /> : <FiSave />}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert className="mt-4">
          <AlertDescription>
            You have unsaved changes. Don't forget to save your preferences!
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default NotificationSettings;
