import React, { useState, useEffect, useMemo } from 'react';
import { useEventBus } from '../../../shared/lib/useEventBus.ts';
import { LogEntry } from '@mf-system/event-bus'; // Используем тип из пакета EventBus

const EventLogPanel: React.FC = () => {
  const eventBus = useEventBus();
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>(''); // Фильтр по имени события

  // Обновляем логи при изменении EventBus (например, при добавлении нового события)
  // Используем useEffect с пустым массивом зависимостей, чтобы подписаться один раз
  useEffect(() => {
    if (!eventBus) return;
    const updateLogs = () => {
      setAllLogs(eventBus.getEventHistory()); // Получаем текущую историю
    };

    // Подписываемся на какое-то внутреннее событие EventBus или просто обновляем по таймеру
    // Вариант 1: Подписка на внутреннее событие (если EventBus его эмитит)
    // eventBus.on('internal_eventbus_updated', updateLogs, 'event-bus-monitor-mf');

    // Вариант 2: Обновление по таймеру (менее эффективно, но работает)
    const intervalId = setInterval(updateLogs, 1000); // Обновляем каждую секунду

    // При монтировании сразу получаем историю
    updateLogs();

    // Отписываемся при размонтировании
    return () => {
      clearInterval(intervalId);
      // eventBus.off('internal_eventbus_updated', updateLogs, 'event-bus-monitor-mf');
    };
  }, [eventBus]); // Зависимость от eventBus

  // Фильтруем логи на основе состояния filter
  const filteredLogs = useMemo(() => {
    if (!filter) return allLogs;
    return allLogs.filter(entry => entry.event.toLowerCase().includes(filter.toLowerCase()));
  }, [allLogs, filter]);

  return (
    <div>
      <h2>Лог событий</h2>
      <input
        type="text"
        placeholder="Фильтр по событию"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
      />
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
        {filteredLogs.length === 0 ? (
          <p>Нет событий для отображения.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Время</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Тип</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Событие</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Модуль</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Данные</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((entry, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {new Date(entry.timestamp).toISOString()}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.type}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.event}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.moduleId}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {entry.data ? JSON.stringify(entry.data, null, 2) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export { EventLogPanel };