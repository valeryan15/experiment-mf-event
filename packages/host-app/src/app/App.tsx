import React from 'react';
import { AppProviders } from './providers';
import { Router } from './router'; // Пока пустой, создадим позже
import FloatingMonitor from '../widgets/FloatingMonitor/ui/FloatingMonitor'; // Импортируем

const App: React.FC = () => {
  return (
    <AppProviders>
      <Router />
      <FloatingMonitor />
    </AppProviders>
  );
};

export default App;