import React, { createContext, useContext, ReactNode } from 'react';
import { EventBus } from '@mf-system/event-bus'; // Импортируем только сам EventBus

const EventBusContext = createContext<EventBus | undefined>(undefined);

interface EventBusProviderProps {
  children: ReactNode;
  eventBusInstance: EventBus; // Принимаем экземпляр как проп
}

export const EventBusProvider: React.FC<EventBusProviderProps> = ({
  children,
  eventBusInstance,
}) => {
  return <EventBusContext.Provider value={eventBusInstance}>{children}</EventBusContext.Provider>;
};

export const useEventBus = (): EventBus => {
  const context = useContext(EventBusContext);
  if (!context) {
    throw new Error('useEventBus must be used within an EventBusProvider');
  }
  return context;
};
