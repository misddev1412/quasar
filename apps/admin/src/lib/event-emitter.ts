/**
 * 一个简单的事件发射器，用于在应用程序的不同部分之间进行通信。
 * A simple event emitter for communication between different parts of the application.
 */
type Listener<T> = (data: T) => void;

class EventEmitter<TEventMap extends Record<string, any>> {
  private listeners: { [K in keyof TEventMap]?: Listener<TEventMap[K]>[] } = {};

  /**
   * 监听一个事件。
   * Listen to an event.
   * @param event - The event name.
   * @param listener - The callback function.
   */
  on<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  /**
   * 停止监听一个事件。
   * Stop listening to an event.
   * @param event - The event name.
   * @param listener - The callback function.
   */
  off<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
  }

  /**
   * 触发一个事件。
   * Emit an event.
   * @param event - The event name.
   * @param data - The data to pass to the listener.
   */
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach(listener => listener(data));
  }
}

// 定义应用事件类型
type AppEvents = {
  'show-toast': {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    description?: string;
  };
};

// 创建一个全局的事件发射器实例
export const appEvents = new EventEmitter<AppEvents>(); 