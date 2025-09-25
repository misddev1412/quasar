import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';

interface ChatWidgetContext {
  country?: string;
  language?: string;
  deviceType?: string;
  currentPage?: string;
}

interface UseChatWidgetOptions {
  autoLoad?: boolean;
  context?: ChatWidgetContext;
}

interface SupportClient {
  id: string;
  name: string;
  type: string;
  configuration: Record<string, any>;
  widgetSettings: Record<string, any>;
  iconUrl?: string;
  isActive: boolean;
  isDefault: boolean;
}

export const useChatWidget = (options: UseChatWidgetOptions = {}) => {
  const { autoLoad = true, context } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [scripts, setScripts] = useState<string[]>([]);

  const { data: clients, isLoading, error } = trpc.publicSupportClients.getAvailable.useQuery(
    { context },
    {
      enabled: autoLoad && typeof window !== 'undefined',
    }
  );

  const { data: widgetScripts } = trpc.publicSupportClients.getWidgetScripts.useQuery(
    { context },
    {
      enabled: autoLoad && typeof window !== 'undefined',
    }
  );

  useEffect(() => {
    if (widgetScripts && widgetScripts.length > 0) {
      setScripts(widgetScripts);
    }
  }, [widgetScripts]);

  useEffect(() => {
    if (scripts.length > 0 && !isLoaded) {
      // Load the chat widget scripts
      const loadScripts = async () => {
        for (const scriptContent of scripts) {
          try {
            // Create a script element
            const script = document.createElement('script');
            script.text = scriptContent;
            script.async = true;

            // Append to document
            document.head.appendChild(script);

            // Wait for script to load
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
            });
          } catch (error) {
            console.warn('Failed to load chat widget script:', error);
          }
        }
        setIsLoaded(true);
      };

      loadScripts();
    }
  }, [scripts, isLoaded]);

  const getDefaultClient = (): SupportClient | null => {
    if (!clients || clients.length === 0) return null;
    return clients.find(client => client.isDefault) || clients[0];
  };

  const getClientByType = (type: string): SupportClient | null => {
    if (!clients || clients.length === 0) return null;
    return clients.find(client => client.type === type) || null;
  };

  const isClientAvailable = (clientId: string): boolean => {
    if (!clients || clients.length === 0) return false;
    const client = clients.find(c => c.id === clientId);
    return client?.isActive || false;
  };

  const openChat = (clientId?: string) => {
    const client = clientId
      ? clients?.find(c => c.id === clientId)
      : getDefaultClient();

    if (!client) return;

    switch (client.type) {
      case 'MESSENGER':
        // Facebook Messenger Customer Chat should open automatically
        if (typeof window !== 'undefined' && (window as any).FB) {
          (window as any).FB.CustomerChat.showDialog();
        }
        break;

      case 'ZALO':
        // Zalo chat should open automatically
        if (typeof window !== 'undefined' && (window as any).ZaloOA) {
          (window as any).ZaloOA.showChat();
        }
        break;

      case 'WHATSAPP':
        const phone = client.configuration?.phoneNumber;
        if (phone) {
          window.open(`https://wa.me/${phone.replace(/\s/g, '')}`, '_blank');
        }
        break;

      case 'TELEGRAM':
        const botUsername = client.configuration?.botUsername;
        if (botUsername) {
          window.open(`https://t.me/${botUsername.replace('@', '')}`, '_blank');
        }
        break;

      case 'EMAIL':
        const email = client.configuration?.email;
        const subject = client.configuration?.subject || 'Support Request';
        if (email) {
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
        }
        break;

      case 'PHONE':
        const phoneNumber = client.configuration?.phoneNumber;
        if (phoneNumber) {
          window.location.href = `tel:${phoneNumber}`;
        }
        break;

      default:
        console.warn('Unsupported chat client type:', client.type);
        break;
    }
  };

  const closeChat = (clientId?: string) => {
    const client = clientId
      ? clients?.find(c => c.id === clientId)
      : getDefaultClient();

    if (!client) return;

    switch (client.type) {
      case 'MESSENGER':
        if (typeof window !== 'undefined' && (window as any).FB) {
          (window as any).FB.CustomerChat.hideDialog();
        }
        break;

      case 'ZALO':
        if (typeof window !== 'undefined' && (window as any).ZaloOA) {
          (window as any).ZaloOA.hideChat();
        }
        break;

      default:
        // For other types, the chat window might be managed differently
        break;
    }
  };

  return {
    clients: clients || [],
    isLoading,
    error,
    isLoaded,
    getDefaultClient,
    getClientByType,
    isClientAvailable,
    openChat,
    closeChat,
    hasChatWidgets: (clients?.length || 0) > 0,
  };
};