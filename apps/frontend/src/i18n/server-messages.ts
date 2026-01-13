import { serverTrpc } from '../utils/trpc-server';
import { mergeMessages } from './mergeMessages';

const SUPPORTED_LOCALES = new Set(['en', 'vi']);

const normalizeLocale = (value: string): 'en' | 'vi' =>
  SUPPORTED_LOCALES.has(value) ? (value as 'en' | 'vi') : 'vi';

export async function getMergedMessages(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const baseMessages = (await import(`./locales/${normalizedLocale}.json`)).default;

  try {
    const response = await serverTrpc.translation.getTranslations.query({ locale: normalizedLocale });
    if (response?.status === 'success' && response.data?.translations) {
      return mergeMessages(baseMessages, response.data.translations);
    }
  } catch (error) {
    console.warn('Failed to load backend translations, using static fallbacks:', error);
  }

  return baseMessages;
}
