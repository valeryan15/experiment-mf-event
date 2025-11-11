import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import MonitorPage from '../../../../../microfrontends/event-bus-monitor-mf/src/pages/monitor-page/ui/MonitorPage'; // Импорт компонента из МФ

const FloatingMonitor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Создаём div для портала
    const div = document.createElement('div');
    div.id = 'floating-monitor-root';
    document.body.appendChild(div);
    setContainer(div);

    // Очищаем при размонтировании
    return () => {
      if (div && document.body.contains(div)) {
        document.body.removeChild(div);
      }
    };
  }, []);

  const toggleMonitor = () => {
    setIsOpen(!isOpen);
  };

  if (!container) {
    return null; // Пока контейнер не создан
  }

  return (
    <>
      {/* Кнопка для открытия/закрытия */}
      <button
        onClick={toggleMonitor}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 10000, // Высокий z-index для отображения поверх всего
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {isOpen ? 'X' : '🔍'} {/* Иконка или текст */}
      </button>

      {/* Портал для рендеринга MonitorPage */}
      {isOpen &&
        createPortal(
          <div
            ref={containerRef}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10001, // Выше кнопки
              width: '90vw',
              height: '80vh',
              maxWidth: '1200px',
              maxHeight: '800px',
              backgroundColor: 'white',
              border: '2px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              padding: '20px',
              overflow: 'auto',
            }}
          >
            <MonitorPage />
            <button
              onClick={toggleMonitor}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              X
            </button>
          </div>,
          container
        )}
    </>
  );
};

export default FloatingMonitor;
