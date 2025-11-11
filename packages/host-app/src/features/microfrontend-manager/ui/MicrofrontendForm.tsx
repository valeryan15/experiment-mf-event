import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMicrofrontend, NewMicrofrontendData } from '../api/microfrontendApi';

const MicrofrontendForm: React.FC = () => {
  const [formData, setFormData] = useState<NewMicrofrontendData>({ name: '', route: '', url: '' });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addMicrofrontend,
    onSuccess: () => {
      // Инвалидируем кэш, чтобы обновить список
      queryClient.invalidateQueries({ queryKey: ['microfrontends'] });
      // Сброс формы
      setFormData({ name: '', route: '', url: '' });
      alert('Микрофронтенд успешно добавлен!');
    },
    onError: (error: Error) => {
      console.error('Ошибка добавления МФ:', error);
      alert(`Ошибка: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Имя:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={mutation.isPending} // Блокируем при отправке
          />
        </label>
      </div>
      <div>
        <label>
          Маршрут:
          <input
            type="text"
            name="route"
            value={formData.route}
            onChange={handleChange}
            required
            disabled={mutation.isPending}
          />
        </label>
      </div>
      <div>
        <label>
          URL (remoteEntry.js):
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            disabled={mutation.isPending}
          />
        </label>
      </div>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Добавление...' : 'Добавить'}
      </button>
    </form>
  );
};

export { MicrofrontendForm };