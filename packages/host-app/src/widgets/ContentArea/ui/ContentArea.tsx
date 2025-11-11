import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useMicrofrontendRoutes } from '../../../features/microfrontend-manager/model/useMicrofrontendRoutes';
import MainPage from '../../../pages/main-page/ui/MainPage';
import AdminPanel from '../../../pages/admin-panel/ui/AdminPanel';

const ContentArea: React.FC = () => {
  const dynamicRoutes = useMicrofrontendRoutes(); // Получаем динамические маршруты

  return (
    <main style={{ padding: '20px' }}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        {/* Вставляем динамические маршруты */}
        {dynamicRoutes}
        {/* Редирект на главную, если маршрут не найден */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

export default ContentArea;
