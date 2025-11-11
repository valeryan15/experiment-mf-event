export interface LogEntry {
  timestamp: number;
  type: 'EMIT' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'HANDLED';
  event: string;
  moduleId: string;
  data?: any; // Тип данных может быть любым, но в идеале строго типизированным
}

export interface EventBusConfig {
  maxHistorySize: number;
  enableLogging: boolean;
  enableMonitor: boolean; // Опционально, если мониторинг интегрирован
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Тип для callback функции
export type EventCallback<T = any> = (data: T) => void;