import { MailLogListItem } from '../types/mail-log';

export interface MailLogSenderInfo {
  primary?: string;
  secondary?: string;
  fallbackId?: string | null;
  isSystem: boolean;
}

export const getMailLogSenderInfo = (log: MailLogListItem): MailLogSenderInfo => {
  const profile = log.triggeredByUser?.profile;
  const firstName = profile?.firstName?.trim();
  const lastName = profile?.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  const username = log.triggeredByUser?.username?.trim();
  const email = log.triggeredByUser?.email?.trim();

  const primaryCandidate = fullName || username || email || undefined;
  const secondary = email && primaryCandidate && email !== primaryCandidate ? email : undefined;

  return {
    primary: primaryCandidate,
    secondary,
    fallbackId: log.triggeredBy || null,
    isSystem: !log.triggeredByUser && !log.triggeredBy,
  };
};
