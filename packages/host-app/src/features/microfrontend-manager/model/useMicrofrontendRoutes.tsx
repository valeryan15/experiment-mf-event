import { useQuery } from '@tanstack/react-query';
import { Route } from 'react-router-dom';
import { fetchMicrofrontends, MicrofrontendConfig } from '../api/microfrontendApi';
import React, { Suspense } from 'react';
import { loadRemote } from '@module-federation/runtime';

const useRemote = (_url: string, scope: string, module: string) => {
  const id = `${scope}/${module}`;
  console.log(id);
  return React.lazy(async () => {
    return loadRemote(id, {
      from: 'runtime',
      loadFactory: true,
    }) as Promise<{ default: any }>;
  });
};

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

    const LazyMicrofrontendComponent = useRemote(mf.url, mf.name, 'App');

    // Добавляем маршрут
    routes.push(
      <Route
        key={mf.name}
        path={mf.route} // Используем маршрут из конфига
        element={
          <Suspense fallback={<div>Загрузка МФ {mf.name}...</div>}>
            <LazyMicrofrontendComponent />
          </Suspense>
        }
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
