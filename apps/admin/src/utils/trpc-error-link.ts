import { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '../../../backend/src/types/app-router';
import { appEvents } from '../lib/event-emitter';
import i18n from '../i18n';

export const errorLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err) {
          // 检查网络错误
          if (err.message === 'Failed to fetch' || err instanceof TypeError) {
            appEvents.emit('show-toast', {
              type: 'error',
              title: i18n.t('messages.network_error_title'),
              description: i18n.t('messages.network_error_desc'),
            });
          }
          // 检查JSON解析错误（当服务器返回HTML时发生）
          else if (err.message.includes('Unexpected token')) {
            appEvents.emit('show-toast', {
              type: 'error',
              title: i18n.t('messages.invalid_response_title'),
              description: i18n.t('messages.invalid_response_desc'),
            });
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