import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiX, FiMinimize2, FiMaximize2, FiClock, FiUsers } from 'react-icons/fi';
import { trpc } from '../utils/trpc';

interface ChatWidgetProps {
  context?: {
    country?: string;
    language?: string;
    deviceType?: string;
    currentPage?: string;
  };
  className?: string;
}

interface SupportClient {
  id: string;
  name: string;
  type: string;
  iconUrl?: string;
  isDefault?: boolean;
  configuration?: {
    phoneNumber?: string;
    email?: string;
    subject?: string;
    botUsername?: string;
  };
  widgetSettings: {
    position: string;
    theme: string;
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    title: string;
    subtitle?: string;
    welcomeMessage?: string;
    showOnMobile: boolean;
    showOnDesktop: boolean;
    autoOpen: boolean;
    responseTime?: string;
  };
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ context, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeClient, setActiveClient] = useState<SupportClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Fix tRPC query for support clients
  // const { data: clients } = trpc.publicSupportClients.getAvailable.useQuery(
  //   { context },
  //   {
  //     enabled: typeof window !== 'undefined',
  //   }
  // );
  const clients = { data: [] as SupportClient[] };

  useEffect(() => {
    if (clients.data && clients.data.length > 0) {
      // Find default client or use the first available
      const defaultClient = clients.data.find(client => client.isDefault) || clients.data[0];
      setActiveClient(defaultClient);

      // Auto-open if configured
      if (defaultClient.widgetSettings.autoOpen) {
        setTimeout(() => setIsOpen(true), 2000);
      }
    }
    setIsLoading(false);
  }, [clients.data]);

  useEffect(() => {
    // Inject widget scripts when clients are loaded
    if (clients.data && clients.data.length > 0) {
      const scripts = clients.data.map(client => {
        switch (client.type) {
          case 'MESSENGER':
            return `
              (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
                fjs.parentNode.insertBefore(js, fjs);
              }(document, 'script', 'facebook-jssdk'));
            `;
          case 'ZALO':
            return `
              (function() {
                var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
                s1.async = true;
                s1.src = 'https://sp.zalo.me/plugins/sdk.js';
                s1.charset = 'UTF-8';
                s0.parentNode.insertBefore(s1, s0);
              })();
            `;
          default:
            return '';
        }
      }).filter(script => script);

      // Execute scripts
      scripts.forEach(script => {
        try {
          eval(script);
        } catch (error) {
          console.warn('Failed to execute chat widget script:', error);
        }
      });
    }
  }, [clients]);

  if (isLoading) {
    return null;
  }

  if (!clients.data || clients.data.length === 0) {
    return null;
  }

  if (!activeClient) {
    return null;
  }

  const widgetSettings = activeClient.widgetSettings;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Check if widget should be shown on current device
  if ((isMobile && !widgetSettings.showOnMobile) || (!isMobile && !widgetSettings.showOnDesktop)) {
    return null;
  }

  const getWidgetPosition = () => {
    switch (widgetSettings.position) {
      case 'BOTTOM_LEFT':
        return 'bottom-4 left-4';
      case 'TOP_RIGHT':
        return 'top-4 right-4';
      case 'TOP_LEFT':
        return 'top-4 left-4';
      case 'CENTER_RIGHT':
        return 'right-4 top-1/2 transform -translate-y-1/2';
      case 'CENTER_LEFT':
        return 'left-4 top-1/2 transform -translate-y-1/2';
      case 'BOTTOM_RIGHT':
      default:
        return 'bottom-4 right-4';
    }
  };

  const getThemeClasses = () => {
    if (widgetSettings.theme === 'DARK') {
      return 'bg-gray-900 text-white border-gray-700';
    }
    return 'bg-white text-gray-900 border-gray-200';
  };

  const handleChatAction = () => {
    switch (activeClient.type) {
      case 'WHATSAPP':
        const phoneNumber = activeClient.configuration?.phoneNumber;
        if (phoneNumber) {
          window.open(`https://wa.me/${phoneNumber.replace(/\s/g, '')}`, '_blank');
        }
        break;
      case 'EMAIL':
        const email = activeClient.configuration?.email;
        const subject = activeClient.configuration?.subject || 'Support Request';
        if (email) {
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
        }
        break;
      case 'PHONE':
        const phone = activeClient.configuration?.phoneNumber;
        if (phone) {
          window.location.href = `tel:${phone}`;
        }
        break;
      case 'TELEGRAM':
        const botUsername = activeClient.configuration?.botUsername;
        if (botUsername) {
          window.open(`https://t.me/${botUsername.replace('@', '')}`, '_blank');
        }
        break;
      default:
        // For Messenger, Zalo, and custom scripts, the widget will handle the interaction
        setIsOpen(!isOpen);
        break;
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleChatAction}
        className={`
          fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110
          ${getWidgetPosition()}
          ${isMinimized ? 'w-14 h-14' : 'w-16 h-16'}
          ${getThemeClasses()}
          border-2
          ${className}
        `}
        style={{ backgroundColor: widgetSettings.primaryColor, color: widgetSettings.textColor }}
        aria-label={widgetSettings.title}
      >
        {activeClient.iconUrl ? (
          <img
            src={activeClient.iconUrl}
            alt={widgetSettings.title}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <FiMessageSquare className="w-6 h-6" />
        )}
        {clients.data.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
            {clients.data.length}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div
          className={`
            fixed z-50 w-80 h-96 shadow-2xl rounded-lg border-2 flex flex-col
            ${getWidgetPosition()}
            ${getThemeClasses()}
            transition-all duration-300
          `}
          style={{
            backgroundColor: widgetSettings.backgroundColor,
            color: widgetSettings.textColor,
            borderColor: widgetSettings.primaryColor,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 rounded-t-lg"
            style={{ backgroundColor: widgetSettings.primaryColor, color: widgetSettings.textColor }}
          >
            <div className="flex items-center space-x-3">
              {activeClient.iconUrl && (
                <img
                  src={activeClient.iconUrl}
                  alt={widgetSettings.title}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold text-sm">{widgetSettings.title}</h3>
                {widgetSettings.subtitle && (
                  <p className="text-xs opacity-90">{widgetSettings.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-black/10 rounded transition-colors"
                title="Minimize"
              >
                <FiMinimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-black/10 rounded transition-colors"
                title="Close"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            {widgetSettings.responseTime && (
              <div className="flex items-center space-x-1 opacity-70">
                <FiClock className="w-3 h-3" />
                <span>{widgetSettings.responseTime}</span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {widgetSettings.welcomeMessage && (
              <div className="mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="text-sm">{widgetSettings.welcomeMessage}</p>
              </div>
            )}

            {/* Client Selector (if multiple clients) */}
            {clients.data.length > 1 && (
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2">Choose support option:</label>
                <div className="space-y-2">
                  {clients.data.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setActiveClient(client)}
                      className={`
                        w-full p-2 rounded-lg border text-left transition-colors
                        ${activeClient.id === client.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        {client.iconUrl && (
                          <img
                            src={client.iconUrl}
                            alt={client.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span className="text-sm font-medium">{client.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Platform-specific content */}
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                <FiMessageSquare className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Start a conversation with us
              </p>
              <button
                onClick={handleChatAction}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: widgetSettings.primaryColor,
                  color: widgetSettings.textColor
                }}
              >
                Start Chat
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t text-center">
            <p className="text-xs opacity-70">
              Powered by {activeClient.type.charAt(0) + activeClient.type.slice(1).toLowerCase().replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      )}

      {/* Minimized Chat Button */}
      {isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className={`
            fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110
            ${getWidgetPosition()}
            w-14 h-14
            ${getThemeClasses()}
            border-2
          `}
          style={{ backgroundColor: widgetSettings.primaryColor, color: widgetSettings.textColor }}
          title={widgetSettings.title}
        >
          <FiMaximize2 className="w-5 h-5" />
          {clients.data.length > 1 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
              {clients.data.length}
            </span>
          )}
        </button>
      )}
    </>
  );
};