
type Listener<T> = (data: T) => void;

class EventEmitter<TEventMap extends Record<string, any>> {
  private listeners: { [K in keyof TEventMap]?: Listener<TEventMap[K]>[] } = {};

  
  on<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  
  off<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
  }

  
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach(listener => listener(data));
  }
}

type AppEvents = {
  'show-toast': {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    description?: string;
  };
};

export const appEvents = new EventEmitter<AppEvents>(); 