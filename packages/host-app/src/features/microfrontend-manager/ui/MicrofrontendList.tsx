import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMicrofrontends, deleteMicrofrontend } from '../api/microfrontendApi';

const MicrofrontendList: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: microfrontends = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['microfrontends'],
    queryFn: fetchMicrofrontends,
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => deleteMicrofrontend(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['microfrontends'] });
      alert('Микрофронтенд успешно удален!');
    },
    onError: (error: Error) => {
      console.error('Ошибка удаления МФ:', error);
      alert(`Ошибка: ${error.message}`);
    },
  });

  if (isLoading) return <div>Загрузка списка МФ...</div>;
  if (isError) return <div>Ошибка: {error.message}</div>;

  const handleDelete = (name: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить микрофронтенд "${name}"?`)) {
      deleteMutation.mutate(name);
    }
  };

  return (
    <ul>
      {microfrontends.map((mf) => (
        <li
          key={mf.name}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>
            {mf.name} (маршрут: <code>{mf.route}</code>)
          </span>
          <button
            onClick={() => handleDelete(mf.name)}
            disabled={deleteMutation.isPending}
            style={{ backgroundColor: 'red', color: 'white' }}
          >
            {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
          </button>
        </li>
      ))}
    </ul>
  );
};

export { MicrofrontendList };
