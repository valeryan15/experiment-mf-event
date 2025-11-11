import React, { useState } from 'react';
import { useEventBus } from '../../../shared/lib/useEventBus.ts';

const ManualEventSender: React.FC = () => {
  const eventBus = useEventBus();
  const [eventData, setEventData] = useState({ name: '', data: '{}' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!eventBus) {
      console.error('eventBus не инициализирован');
      return;
    }
    e.preventDefault();
    try {
      // Парсим JSON данных
      const parsedData = JSON.parse(eventData.data);
      // Отправляем событие
      eventBus?.emit(eventData.name, parsedData, 'event-bus-monitor-mf');
      console.log('Событие отправлено вручную:', eventData.name, parsedData);
      // Сбрасываем форму
      setEventData({ name: '', data: '{}' });
    } catch (error) {
      console.error('Ошибка парсинга JSON данных:', error);
      alert('Неверный формат JSON данных');
    }
  };

  return (
    <div>
      <h3>Отправить событие вручную</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Имя события:
            <input
              type="text"
              name="name"
              value={eventData.name}
              onChange={handleChange}
              required
              style={{ display: 'block', width: '100%', padding: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Данные (JSON):
            <textarea
              name="data"
              value={eventData.data}
              onChange={handleChange}
              required
              rows={3}
              style={{ display: 'block', width: '100%', padding: '5px' }}
            />
          </label>
        </div>
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};

export { ManualEventSender };
