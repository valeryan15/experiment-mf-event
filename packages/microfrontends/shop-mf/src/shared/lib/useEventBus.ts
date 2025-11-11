import { useEffect, useState } from 'react';
import { EventBus } from '@mf-system/event-bus'; // Импортируем тип EventBus

// Тип для глобального объекта window
declare global {
  interface Window {
    __MICROFRONTEND_EVENT_BUS__: EventBus;
  }
}

// Хук для получения EventBus из window в shop-mf
export const useEventBus = (): EventBus | null => {
  const [eventBus, setEventBus] = useState<EventBus | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__MICROFRONTEND_EVENT_BUS__) {
      setEventBus(window.__MICROFRONTEND_EVENT_BUS__);
    } else {
      console.error('EventBus не найден в window.__MICROFRONTEND_EVENT_BUS__ в shop-mf');
    }
  }, []);

  return eventBus;
};
