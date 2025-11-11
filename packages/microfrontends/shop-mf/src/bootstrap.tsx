import React, { useEffect } from 'react';
import { useEventBus } from './shared/lib/useEventBus';

const ShopApp: React.FC = () => {
  const eventBus = useEventBus(); // Используем хук

  useEffect(() => {
    if (!eventBus) {
      console.error('EventBus недоступен в ShopApp');
      return;
    }
    const handleThemeChange = (data: any) => {
      // Типизировать data!
      console.log('Shop MF получил тему:', data);
      // Применить тему...
    };

    // Подписываемся
    eventBus.on('themeChanged', handleThemeChange, 'shop-mf');

    // Получаем последнее состояние при инициализации (State Synchronization)
    const currentTheme = eventBus.getCurrentState('themeChanged');
    if (currentTheme) {
      console.log('Shop MF получил последнюю тему при инициализации:', currentTheme);
      // Применить тему...
    }

    // Отписываемся при размонтировании
    return () => {
      eventBus.off('themeChanged', handleThemeChange, 'shop-mf');
    };
  }, [eventBus]); // Зависимость от eventBus

  const triggerEvent = () => {
    if (eventBus) {
      eventBus.emit('userAction', { action: 'clickedBuyButton', productId: 123 }, 'shop-mf');
    } else {
      console.error('EventBus недоступен для отправки события');
    }
  };

  return (
    <div>
      <h2>Микрофронтенд: Магазин (Shop)</h2>
      <p>Это содержимое из shop-mf.</p>
      <button onClick={triggerEvent}>Триггерить событие</button>
    </div>
  );
};

export default ShopApp;
