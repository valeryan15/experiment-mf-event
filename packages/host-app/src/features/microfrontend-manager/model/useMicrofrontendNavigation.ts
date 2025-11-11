import { useQuery } from '@tanstack/react-query';
import { fetchMicrofrontends } from '../api/microfrontendApi';

interface NavigationLink {
  to: string;
  label: string;
}

export const useMicrofrontendNavigation = (): {
  staticLinks: NavigationLink[];
  dynamicLinks: NavigationLink[];
} => {
  const {
    data: microfrontends = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['microfrontends'],
    queryFn: fetchMicrofrontends,
    // staleTime: 5000, // Пример настройки кэширования
  });

  // Статические ссылки (например, главная, админка)
  const staticLinks: NavigationLink[] = [
    { to: '/', label: 'Главная' },
    { to: '/admin', label: 'Админка' },
  ];

  // Динамические ссылки из МФ
  const dynamicLinks: NavigationLink[] = microfrontends.map((mf) => ({
    to: mf.route, // Используем маршрут из конфигурации МФ
    label: mf.name, // Используем имя МФ
  }));

  if (isLoading) {
    console.log('Загрузка навигации...'); // В реальном приложении лучше UI-лоадер
  }

  if (isError) {
    console.error('Ошибка загрузки списка МФ для навигации');
  }

  return { staticLinks, dynamicLinks };
};
