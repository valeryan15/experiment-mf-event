import React from 'react';
import MonitorPage from './pages/monitor-page/ui/MonitorPage.tsx';

const EventBusMonitorApp: React.FC = () => {
  return (
    <div>
      <h2>Микрофронтенд: Монитор EventBus</h2>
      <MonitorPage />
    </div>
  );
};

export default EventBusMonitorApp;
