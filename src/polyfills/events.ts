// 简单的 EventEmitter 实现
export class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(type: string, listener: Function): this {
    if (!this.events[type]) {
      this.events[type] = [];
    }
    this.events[type].push(listener);
    return this;
  }

  once(type: string, listener: Function): this {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.off(type, onceWrapper);
    };
    return this.on(type, onceWrapper);
  }

  off(type: string, listener?: Function): this {
    if (!this.events[type]) return this;
    
    if (!listener) {
      delete this.events[type];
    } else {
      this.events[type] = this.events[type].filter(l => l !== listener);
    }
    return this;
  }

  emit(type: string, ...args: any[]): boolean {
    if (!this.events[type]) return false;
    
    this.events[type].forEach(listener => {
      listener(...args);
    });
    return true;
  }

  removeAllListeners(type?: string): this {
    if (type) {
      delete this.events[type];
    } else {
      this.events = {};
    }
    return this;
  }

  listenerCount(type: string): number {
    return this.events[type]?.length || 0;
  }
}

export default {
  EventEmitter
}; 