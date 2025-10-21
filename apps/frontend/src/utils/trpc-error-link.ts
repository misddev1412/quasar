import { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '../types/trpc';

// Event emitter for global error handling
export type ToastEvent = {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  message?: string;
};

class EventEmitter {
  private events: Map<string, Set<(data: any) => void>> = new Map();

  on(event: string, handler: (data: any) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.events.get(event)?.delete(handler);
    };
  }

  emit(event: string, data: any) {
    this.events.get(event)?.forEach((handler) => handler(data));
  }
}

export const appEvents = new EventEmitter();

export const errorLink: TRPCLink<any> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err: any) {
          // Handle network errors
          if (err.message === 'Failed to fetch' || err instanceof TypeError) {
            appEvents.emit('show-toast', {
              type: 'error',
              title: 'Network Error',
              description:
                'Unable to connect to the server. Please check your internet connection.',
            } as ToastEvent);
          }
          // Handle JSON parsing errors (when server returns HTML instead of JSON)
          else if (err.message.includes('Unexpected token')) {
            appEvents.emit('show-toast', {
              type: 'error',
              title: 'Invalid Response',
              description: 'The server returned an invalid response. Please try again.',
            } as ToastEvent);
          }
          // Handle authentication errors
          else if (err.data?.code === 'UNAUTHORIZED') {
            appEvents.emit('show-toast', {
              type: 'error',
              title: 'Authentication Required',
              description: 'Please log in to continue.',
            } as ToastEvent);

            // Emit auth error event for handling logout/redirect
            appEvents.emit('auth-error', { error: err });
          }
          // Handle forbidden errors
          else if (err.data?.code === 'FORBIDDEN') {
            appEvents.emit('show-toast', {
              type: 'error',
              title: 'Access Denied',
              description: "You don't have permission to perform this action.",
            } as ToastEvent);
          }
          // Handle validation errors
          else if (err.data?.code === 'BAD_REQUEST') {
            appEvents.emit('show-toast', {
              type: 'error',
              title: 'Validation Error',
              description: err.message || 'Please check your input and try again.',
            } as ToastEvent);
          }
          // Handle rate limiting
          else if (err.data?.code === 'TOO_MANY_REQUESTS') {
            appEvents.emit('show-toast', {
              type: 'warning',
              title: 'Too Many Requests',
              description: 'Please slow down and try again in a few moments.',
            } as ToastEvent);
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
