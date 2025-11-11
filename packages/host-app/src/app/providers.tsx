import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { EventBus, EventBusConfig } from '@mf-system/event-bus';
import { EventBusProvider } from '../shared/lib/event-bus/EventBusProvider';
import FloatingMonitor from '../widgets/FloatingMonitor/ui/FloatingMonitor';

// Тип для глобального объекта window
declare global {
  interface Window {
    __MICROFRONTEND_EVENT_BUS__: EventBus;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

// Опциональная конфигурация EventBus
const eventBusConfig: Partial<EventBusConfig> = {
  maxHistorySize: 200,
  enableLogging: true,
  logLevel: 'info',
};

interface AppProvidersProps {
  children: ReactNode;
}

const eventBus = new EventBus(eventBusConfig);

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    // Создаём экземпляр EventBus

  // Помещаем его в window *один раз* при инициализации провайдеров
  if (typeof window !== 'undefined' && !window.__MICROFRONTEND_EVENT_BUS__) {
    window.__MICROFRONTEND_EVENT_BUS__ = eventBus;
  }
  // // --- ИНИЦИАЛИЗАЦИЯ SHARE SCOPES ---
  // // Инициализируем __webpack_share_scopes__.default, если он не существует
  // // Это нужно сделать до рендеринга App, чтобы Module Federation мог использовать его
  // if (typeof window !== 'undefined') {
  //   if (!window?.__webpack_share_scopes__?.default) {
  //     // В dev-режиме можно инициализировать пустым объектом или с минимальными зависимостями
  //     // В реальных условиях хост (host-app) должен предоставить корректный scope
  //     // с версиями и флагами singleton для shared зависимостей.
  //     // Для простоты в dev-режиме часто инициализируют пустым.
  //     window['__webpack_share_scopes__'] = {
  //       default: {}
  //     };
  //     console.log('window.__webpack_share_scopes__.default инициализирован в host-app.');
  //   } else {
  //     console.log('window.__webpack_share_scopes__.default уже инициализирован.');
  //   }
  // }
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EventBusProvider eventBusInstance={eventBus}> {/* Оборачиваем в EventBusProvider */}
          {children}
          <FloatingMonitor />
        </EventBusProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};