import React, { useState, useEffect } from 'react';
import { useEventBus } from '../../../shared/lib/useEventBus.ts';

const StatisticsPanel: React.FC = () => {
  const eventBus = useEventBus();
  const [stats, setStats] = useState({ eventsPerSecond: 0, activeModules: 0, totalEvents: 0 });

  useEffect(() => {
    if (!eventBus) return;
    let eventCountLastSecond = 0;
    let lastUpdateTimestamp = Date.now();

    const intervalId = setInterval(() => {
      const now = Date.now();
      const timePassed = now - lastUpdateTimestamp;

      // Обновляем статистику каждую секунду
      if (timePassed >= 1000) {
        const currentHistory = eventBus.getEventHistory();
        const currentSubscribers = eventBus.getSubscribers();

        setStats(() => ({
          eventsPerSecond: eventCountLastSecond,
          activeModules: currentSubscribers.length,
          totalEvents: currentHistory.length,
        }));

        // Сбрасываем счётчик для следующей секунды
        eventCountLastSecond = 0;
        lastUpdateTimestamp = now;
      }

      // Считаем события, произошедшие с момента последнего обновления
      const currentHistory = eventBus.getEventHistory();
      // Простой подсчёт, можно уточнить логику (например, только EMIT)
      eventCountLastSecond = currentHistory.filter(
        (entry: any) => entry.timestamp > lastUpdateTimestamp && entry.type === 'EMIT'
      ).length;
    }, 100); // Часто обновляем для плавности

    return () => clearInterval(intervalId);
  }, [eventBus]);

  return (
    <div>
      <h3>Статистика</h3>
      <p>Событий/сек: {stats.eventsPerSecond}</p>
      <p>Активных модулей: {stats.activeModules}</p>
      <p>Всего событий в истории: {stats.totalEvents}</p>
    </div>
  );
};

export { StatisticsPanel };
