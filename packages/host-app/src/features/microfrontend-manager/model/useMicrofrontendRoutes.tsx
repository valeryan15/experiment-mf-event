import { useQuery } from '@tanstack/react-query';
import { Route } from 'react-router-dom';
import { fetchMicrofrontends, MicrofrontendConfig } from '../api/microfrontendApi';
import React from 'react';
import { MicrofrontendComponent } from '../ui/MicrofrontendComponent.tsx';
import ErrorBoundary from '../../../shared/lib/error-boundary/ErrorBoundary.tsx';

// Хук для получения динамических маршрутов
export const useMicrofrontendRoutes = (): React.ReactElement[] => {
  const {
    data: microfrontends = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['microfrontends'],
    queryFn: fetchMicrofrontendApi,
    staleTime: 0, // Всегда проверяем при рендере, так как маршруты должны обновляться
    refetchOnWindowFocus: false, // Опционально, чтобы не перезапрашивать при фокусе
  });

  if (isLoading) {
    // Возвращаем пустой массив или лоадер, пока данные загружаются
    return [<Route key="loading" path="*" element={<div>Загрузка маршрутов...</div>} />];
  }

  if (isError) {
    console.error('Ошибка загрузки маршрутов МФ');
    return [<Route key="error" path="*" element={<div>Ошибка загрузки маршрутов</div>} />];
  }

  // Массив для хранения динамических Route элементов
  const routes: React.ReactElement[] = [];

  microfrontends.forEach((mf: MicrofrontendConfig) => {
    // Создаем lazy-компонент для загрузки удаленного МФ

    // Добавляем маршрут
    routes.push(
      <Route
        key={mf.name}
        path={mf.route} // Используем маршрут из конфига
        element={
          <ErrorBoundary fallback={<h2>Ошибка загрузки МФ {mf.name}</h2>}>
            <MicrofrontendComponent key={mf.route} name={mf.name} />
          </ErrorBoundary>
        }
        errorElement={<div>Ошибка загрузки МФ {mf.name}</div>}
      />
    );
  });

  return routes;
};

// Вспомогательная функция для запроса API
const fetchMicrofrontendApi = async (): Promise<MicrofrontendConfig[]> => {
  // Используем уже реализованную функцию
  return await fetchMicrofrontends();
};
