import { LogEntry, EventBusConfig, EventCallback } from './types';

// Тип для хранения подписчиков: { [event: string]: { callback: Function, moduleId: string }[] }
type SubscribersMap = Map<string, { callback: EventCallback; moduleId: string }[]>;

export class EventBus {
  private subscribers: SubscribersMap = new Map();
  private eventHistory: LogEntry[] = [];
  private lastStateCache: Map<string, any> = new Map(); // Кэш последнего состояния для каждого события
  private config: EventBusConfig;

  constructor(config: Partial<EventBusConfig> = {}) {
    // Конфигурация по умолчанию
    this.config = {
      maxHistorySize: 100,
      enableLogging: true,
      enableMonitor: false, // Пока не используется напрямую в классе
      logLevel: 'info',
      ...config, // Переопределение значениями из конфига
    };
  }

  // --- Основные методы ---

  /**
   * Отправляет событие
   * @param event Имя события
   * @param data Данные события (опционально)
   * @param source Идентификатор модуля, который отправил событие (опционально, можно передавать в других методах)
   */
  emit<T = any>(event: string, data?: T, source: string = 'unknown'): void {
    // Обновляем кэш последнего состояния
    this.lastStateCache.set(event, data);

    // Логируем отправку
    if (this.config.enableLogging) {
      this.logEntry('EMIT', event, source, data);
    }

    // Получаем подписчиков
    const subscribers = this.subscribers.get(event) || [];

    // Вызываем callback для каждого подписчика
    subscribers.forEach(({ callback, moduleId }) => {
      try {
        callback(data);
        // Логируем обработку (HANDLED)
        if (this.config.enableLogging) {
          this.logEntry('HANDLED', event, moduleId, data);
        }
      } catch (error) {
        console.error(`Ошибка в callback подписчика ${moduleId} для события ${event}:`, error);
      }
    });
  }

  /**
   * Подписывается на событие
   * @param event Имя события
   * @param callback Функция обратного вызова
   * @param moduleId Идентификатор модуля, который подписывается
   */
  on<T = any>(event: string, callback: EventCallback<T>, moduleId: string): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    // Логируем подписку
    if (this.config.enableLogging) {
      this.logEntry('SUBSCRIBE', event, moduleId);
    }

    // Добавляем подписчика
    this.subscribers.get(event)!.push({ callback, moduleId });
  }

  /**
   * Отписывается от события
   * @param event Имя события
   * @param callback Функция обратного вызова, которую нужно удалить
   * @param moduleId Идентификатор модуля, который отписывается
   */
  off(event: string, callback: EventCallback, moduleId: string): void {
    const subscribers = this.subscribers.get(event);
    if (subscribers) {
      // Находим и удаляем конкретный callback для moduleId
      const index = subscribers.findIndex(
        (sub) => sub.callback === callback && sub.moduleId === moduleId
      );
      if (index !== -1) {
        // Логируем отписку
        if (this.config.enableLogging) {
          this.logEntry('UNSUBSCRIBE', event, moduleId);
        }
        subscribers.splice(index, 1);
        // Если список подписчиков пуст, можно удалить ключ
        if (subscribers.length === 0) {
          this.subscribers.delete(event);
        }
      }
    }
  }

  // --- Новые методы из Project ---

  /**
   * Возвращает историю событий
   * @param event Фильтр по имени события (опционально)
   * @returns Массив LogEntry
   */
  getEventHistory(event?: string): LogEntry[] {
    if (event) {
      return this.eventHistory.filter((entry) => entry.event === event);
    }
    return [...this.eventHistory]; // Возвращаем копию
  }

  /**
   * Возвращает последнее значение, связанное с событием (из кэша)
   * @param event Имя события
   * @returns Последнее значение или undefined
   */
  getCurrentState(event: string): any {
    return this.lastStateCache.get(event);
  }

  /**
   * Возвращает список подписчиков
   * @param event Фильтр по имени события (опционально)
   * @returns Массив moduleId
   */
  getSubscribers(event?: string): string[] {
    if (event) {
      const subscribers = this.subscribers.get(event);
      return subscribers ? subscribers.map((sub) => sub.moduleId) : [];
    }
    // Возвращает уникальные moduleId из всех подписчиков
    const allModuleIds = new Set<string>();
    this.subscribers.forEach((subList) => {
      subList.forEach((sub) => allModuleIds.add(sub.moduleId));
    });
    return Array.from(allModuleIds);
  }

  /**
   * Очищает историю событий
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  // --- Внутренние методы ---

  /**
   * Внутренний метод для добавления записи в историю и ограничения размера
   * @param type Тип операции
   * @param event Имя события
   * @param moduleId Идентификатор модуля
   * @param data Данные (опционально)
   */
  private logEntry(type: LogEntry['type'], event: string, moduleId: string, data?: any): void {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      type,
      event,
      moduleId,
      data,
    };

    this.eventHistory.push(logEntry);

    // Ограничиваем размер истории
    if (this.eventHistory.length > this.config.maxHistorySize) {
      this.eventHistory.shift(); // Удаляем самый старый элемент
    }

    // Выводим в консоль в зависимости от logLevel
    // (В реальных условиях можно отправлять в централизованный логгер)
    if (this.shouldLog()) {
      console.log(
        `[${new Date(logEntry.timestamp).toISOString()}] ${type}: ${moduleId} -> ${event}`,
        data ? data : ''
      );
    }
  }

  /**
   * Проверяет, нужно ли логировать на основе logLevel
   * @returns boolean
   */
  private shouldLog(): boolean {
    // Упрощённая проверка, можно усложнить
    return this.config.logLevel !== 'error';
  }
}
