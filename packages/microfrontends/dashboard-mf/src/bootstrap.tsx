import React, { useEffect } from 'react';
// import { useEventBus } from '../../../host-app/src/shared/lib/event-bus/EventBusProvider'; // <-- УДАЛИТЬ
import { useEventBus } from './shared/lib/useEventBus'; // <-- ИМПОРТИРУЕМ СВОЙ ХУК

const DashboardApp: React.FC = () => {
  const eventBus = useEventBus(); // <-- ИСПОЛЬЗУЕМ СВОЙ ХУК

  useEffect(() => {
    if (!eventBus) {
        console.error('EventBus недоступен в DashboardApp');
        return;
    }

    const handleUserUpdate = (data: any) => {
      console.log('Dashboard MF получил обновление пользователя:', data);
    };

    eventBus.on('userUpdated', handleUserUpdate, 'dashboard-mf');

    const lastUser = eventBus.getCurrentState('userUpdated');
    if (lastUser) {
      console.log('Dashboard MF получил последнего пользователя при инициализации:', lastUser);
    }

    return () => {
      eventBus.off('userUpdated', handleUserUpdate, 'dashboard-mf');
    };
  }, [eventBus]);

  return (
    <div>
      <h2>Микрофронтенд: Дашборд (Dashboard)</h2>
      <p>Это содержимое из dashboard-mf.</p>
    </div>
  );
};

export default DashboardApp;