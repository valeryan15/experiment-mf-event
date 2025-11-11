import React, { useState, useEffect } from 'react';
import { useEventBus } from '../../../shared/lib/useEventBus.ts';


const CurrentStatePanel: React.FC = () => {
  const eventBus = useEventBus();
  const [knownEvents, setKnownEvents] = useState<string[]>([]); // Список известных событий
  const [currentState, setCurrentState] = useState<Record<string, any>>({}); // Текущее состояние { eventName: data }

  // Получаем список событий и их состояния при изменении EventBus
  useEffect(() => {
    if (!eventBus) return
    // Обновляем список событий из истории (или подумать о другом способе получения списка)
    // Для простоты пока получим всё и вытащим уникальные имена
    const history = eventBus.getEventHistory();
    const eventsSet = new Set(history.map(entry => entry.event));
    const eventsList = Array.from(eventsSet);
    setKnownEvents(eventsList);

    // Обновляем текущее состояние для каждого известного события
    const newState: Record<string, any> = {};
    eventsList.forEach(event => {
      newState[event] = eventBus.getCurrentState(event);
    });
    setCurrentState(newState);

    // Обновляем по таймеру
    const intervalId = setInterval(() => {
      const updatedHistory = eventBus.getEventHistory();
      const updatedEventsSet = new Set(updatedHistory.map(entry => entry.event));
      const updatedEventsList = Array.from(updatedEventsSet);
      setKnownEvents(updatedEventsList);

      const updatedNewState: Record<string, any> = {};
      updatedEventsList.forEach(event => {
        updatedNewState[event] = eventBus.getCurrentState(event);
      });
      setCurrentState(updatedNewState);
    }, 1000); // Обновляем каждую секунду

    return () => clearInterval(intervalId);
  }, [eventBus]);

  return (
    <div>
      <h2>Текущие состояния</h2>
      {knownEvents.length === 0 ? (
        <p>Нет известных событий с состоянием.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
          {knownEvents.map(event => (
            <div key={event} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{event}</h3>
              <pre style={{ margin: '5px 0 0 0', fontSize: '12px', overflowX: 'auto' }}>
                {currentState[event] ? JSON.stringify(currentState[event], null, 2) : 'N/A'}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { CurrentStatePanel };