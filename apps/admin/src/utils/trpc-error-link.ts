import { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '../../../backend/src/@generated/server';
import { appEvents } from '../lib/event-emitter';
import i18n from '../i18n';

export const errorLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err: any) {
          if (err.message === 'Failed to fetch' || err instanceof TypeError) {
            appEvents.emit('show-toast', {
              type: 'error',
              title: i18n.t('messages.network_error_title'),
              description: i18n.t('messages.network_error_desc'),
            });
          }
          else if (err.message.includes('Unexpected token')) {
            appEvents.emit('show-toast', {
              type: 'error',
              title: i18n.t('messages.invalid_response_title'),
              description: i18n.t('messages.invalid_response_desc'),
            });
          }
          else if (
            err.data?.code === 'FORBIDDEN' ||
            err.data?.status === 'FORBIDDEN' ||
            err.message?.includes('Insufficient permissions') ||
            err.message?.includes('FORBIDDEN')
          ) {
            if (typeof window !== 'undefined' && window.location.pathname !== '/unauthorized') {
              window.location.href = '/unauthorized';
            }
          }

          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });

      return unsubscribe;
    });
  };
}; 
