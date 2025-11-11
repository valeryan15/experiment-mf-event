import { z } from 'zod';
import { registerRemotes } from '@module-federation/runtime';

// Zod схемы для валидации ответов API (согласованы с host-server)
const MicrofrontendConfigSchema = z.object({
  name: z.string(),
  route: z.string(),
  url: z.string().url(), // Убедимся, что URL валидный
});

const MicrofrontendsListSchema = z.array(MicrofrontendConfigSchema);

export type MicrofrontendConfig = z.infer<typeof MicrofrontendConfigSchema>;

// Тип для данных формы
export interface NewMicrofrontendData {
  name: string;
  route: string;
  url: string;
}

const API_BASE_URL = 'http://localhost:3001'; // Адрес хост-сервера

export const fetchMicrofrontends = async (): Promise<MicrofrontendConfig[]> => {
  const response = await fetch(`${API_BASE_URL}/microfrontends`);
  if (!response.ok) {
    throw new Error(`Ошибка загрузки МФ: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();

  // Валидация полученных данных
  const parsedData = MicrofrontendsListSchema.safeParse(data);
  if (!parsedData.success) {
    console.error('Данные API не соответствуют ожидаемой схеме:', parsedData.error);
    throw new Error('Данные API имеют неверный формат');
  }
  console.log(parsedData.data);
  const microfrontends = parsedData.data
  registerRemotes(
    microfrontends.map((mf) => ({
      name: mf.name,
      entry: mf.url,
      type: 'module',
    })),
    { force: true }
  );
  return microfrontends;
};

export const addMicrofrontend = async (data: NewMicrofrontendData): Promise<MicrofrontendConfig> => {
  const response = await fetch(`${API_BASE_URL}/microfrontends`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Получим текст ошибки для более подробного сообщения
    throw new Error(`Ошибка добавления МФ: ${response.status} ${errorText}`);
  }

  const responseData = await response.json();

  // Валидация ответа от API после добавления
  const parsedResponse = MicrofrontendConfigSchema.safeParse(responseData);
  if (!parsedResponse.success) {
    console.error('Ответ API после добавления не соответствует схеме:', parsedResponse.error);
    throw new Error('Ответ API после добавления имеет неверный формат');
  }
  return parsedResponse.data;
};

export const deleteMicrofrontend = async (name: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/microfrontends/${name}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка удаления МФ: ${response.status} ${errorText}`);
  }

  // DELETE обычно возвращает 204 No Content, данные не возвращаются
};