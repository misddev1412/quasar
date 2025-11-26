import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Toggle } from '../common/Toggle';
import { Loading } from '../common/Loading';
import { Alert, AlertDescription } from '../common/Alert';
import { useNotificationChannelConfigs, NotificationEventKey } from '../../hooks/useNotificationChannelConfigs';
import { NotificationChannel } from '../../hooks/useNotificationPreferences';
import { FiSliders, FiCheckCircle } from 'react-icons/fi';
import clsx from 'clsx';

const CHANNEL_ORDER: NotificationChannel[] = ['email', 'push', 'sms', 'telegram', 'in_app'];

const channelLabels: Record<NotificationChannel, string> = {
  email: 'Email',
  push: 'Push',
  sms: 'SMS',
  telegram: 'Telegram',
  in_app: 'In-app',
};

interface NotificationChannelManagerProps {
  className?: string;
}

const NotificationChannelManager: React.FC<NotificationChannelManagerProps> = ({ className }) => {
  const {
    configs,
    isLoading,
    error,
    updateAllowedChannels,
    initializeDefaults,
    isUpdating,
  } = useNotificationChannelConfigs();

  const handleToggleChannel = async (eventKey: NotificationEventKey, channel: NotificationChannel, enabled: boolean) => {
    const config = configs.find(cfg => cfg.eventKey === eventKey);
    if (!config) return;

    const nextChannels = new Set(config.allowedChannels);
    if (enabled) {
      nextChannels.add(channel);
    } else {
      nextChannels.delete(channel);
    }

    if (nextChannels.size === 0) {
      // Always keep at least one channel enabled
      return;
    }

    await updateAllowedChannels(eventKey, Array.from(nextChannels));
  };

  const sortedConfigs = useMemo(() => {
    return [...configs].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [configs]);

  return (
    <Card className={clsx('p-6', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
            <FiSliders className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Notification Channels</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Control which delivery channels are available for each system event
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => initializeDefaults()}
            disabled={isUpdating}
          >
            Seed Defaults
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[160px]">
          <Loading />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Failed to load channel configurations. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <th className="px-4 py-3">Event</th>
                {CHANNEL_ORDER.map(channel => (
                  <th key={channel} className="px-4 py-3 text-center">{channelLabels[channel]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
              {sortedConfigs.map(config => (
                <tr key={config.eventKey} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-medium text-neutral-900 dark:text-neutral-50">
                      {config.displayName}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{config.description}</div>
                    {!config.isActive && (
                      <div className="mt-1 inline-flex items-center text-amber-600 text-xs">
                        <FiCheckCircle className="w-3 h-3 mr-1" /> Disabled
                      </div>
                    )}
                  </td>
                  {CHANNEL_ORDER.map(channel => {
                    const enabled = config.allowedChannels.includes(channel);
                    return (
                      <td key={`${config.eventKey}-${channel}`} className="px-4 py-4 text-center">
                        <Toggle
                          checked={enabled}
                          onChange={(checked) => handleToggleChannel(config.eventKey, channel, checked)}
                          disabled={isUpdating}
                          label=""
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default NotificationChannelManager;
