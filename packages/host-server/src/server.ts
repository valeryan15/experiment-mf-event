import Fastify, { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts'; // Опционально, для вывода типов из Zod
import { z, ZodError } from 'zod';
import fs from 'fs';
import path from 'path';
// --- Импорты для замены __dirname в ESM ---
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from '@fastify/cors';

// --- Получаем __dirname в стиле ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// --- /Импорты и код для __dirname ---

// Инициализация Fastify сервера
const server: FastifyInstance = Fastify({
  logger: true,
});

// --- Регистрация CORS ---
// Регистрируем плагин CORS как можно раньше, желательно сразу после создания экземпляра сервера
await server.register(cors, {
  origin: [
    'http://localhost:3000', // Разрешаем запросы с host-app (Vite dev server)
    // 'http://localhost:80', // Если host-app будет отдаваться Nginx'ом на порту 80 внутри Docker
    // 'http://host-app', // Если внутри Docker-сети вы обращаетесь по имени сервиса
    // Добавьте другие origins, если нужно (например, для production)
  ],
  credentials: true, // Если вам нужно передавать cookies или авторизационные заголовки
  // allowedHeaders: ['Content-Type', 'Authorization'], // Можно явно указать разрешенные заголовки
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Можно явно указать разрешенные методы
});
// --- /Регистрация CORS ---

// Путь к файлу базы данных (убедитесь, что путь корректен, особенно в Docker)
// В Docker-контейнере лучше использовать абсолютный путь или переменную окружения
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../db.json');
//
// // Путь к файлу базы данных (используем __dirname, определённый выше)
// const DB_PATH = path.join(__dirname, '../db.json');

// Инициализация файла базы данных, если его нет
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// --- Zod Схемы для валидации ---

// Схема для тела запроса POST /microfrontends
const CreateMicrofrontendSchema = z.object({
  name: z.string().min(1, { message: 'Имя не может быть пустым' }),
  route: z
    .string()
    .min(1, { message: 'Маршрут не может быть пустым' })
    .regex(/^\/.*$/, { message: "Маршрут должен начинаться с '/'" }),
  url: z.string().url({ message: 'URL должен быть валидным' }),
});

// Тип для данных из тела запроса
type CreateMicrofrontendInput = z.infer<typeof CreateMicrofrontendSchema>;

// Тип для записи в БД (совпадает с CreateMicrofrontendInput)
type MicrofrontendConfig = CreateMicrofrontendInput;

// --- Эндпоинты ---

// GET /microfrontends
server.get('/microfrontends', async (request, reply) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const microfrontends: MicrofrontendConfig[] = JSON.parse(data);
    // Возвращаем массив конфигураций МФ
    return microfrontends;
  } catch (err) {
    request.log.error(err);
    // Унифицированный формат ошибки
    reply.status(500).send({ error: 'Internal Server Error', details: (err as Error).message });
  }
});

// POST /microfrontends
server.post<{ Body: CreateMicrofrontendInput }>('/microfrontends', async (request, reply) => {
  try {
    // Валидация тела запроса с помощью Zod
    const parsedData = CreateMicrofrontendSchema.safeParse(request.body);

    if (!parsedData.success) {
      // Формируем детали ошибки валидации
      const errorDetails = parsedData.error.issues.map((issue) => ({
        field: issue.path.join('.'), // Путь к полю, например, "name" или "address.street"
        message: issue.message, // Сообщение об ошибке
        code: issue.code, // Код ошибки Zod (например, "too_small", "invalid_string")
        // Значение, которое вызвало ошибку (опционально)
        // input: issue.input,
      }));
      // Возвращаем 400 с деталями
      return reply.status(400).send({ error: 'Validation Error', details: errorDetails });
    }

    const newMicrofrontend: MicrofrontendConfig = parsedData.data;

    // Читаем текущий список МФ
    const data = fs.readFileSync(DB_PATH, 'utf8');
    let microfrontends: MicrofrontendConfig[] = JSON.parse(data);

    // Проверка на дубликат по имени
    if (microfrontends.some((mf) => mf.name === newMicrofrontend.name)) {
      return reply
        .status(409)
        .send({ error: 'Conflict', message: 'Microfrontend with this name already exists' });
    }

    // Добавляем новый МФ
    microfrontends.push(newMicrofrontend);

    // Записываем обновлённый список обратно в файл
    fs.writeFileSync(DB_PATH, JSON.stringify(microfrontends, null, 2)); // null, 2 - для красивого формата

    // Возвращаем созданный объект с 201 Created
    reply.status(201).send(newMicrofrontend);
  } catch (err) {
    request.log.error(err);
    reply.status(500).send({ error: 'Internal Server Error', details: (err as Error).message });
  }
});

// DELETE /microfrontends/:name
server.delete<{ Params: { name: string } }>('/microfrontends/:name', async (request, reply) => {
  try {
    const { name } = request.params;

    // Валидация параметра (Fastify может автоматически валидировать схему пути, но можно и вручную)
    if (!name || typeof name !== 'string') {
      return reply
        .status(400)
        .send({ error: 'Bad Request', message: 'Name parameter is required and must be a string' });
    }

    // Читаем текущий список МФ
    const data = fs.readFileSync(DB_PATH, 'utf8');
    let microfrontends: MicrofrontendConfig[] = JSON.parse(data);

    const initialLength = microfrontends.length;
    // Фильтруем список, исключая МФ с указанным именем
    microfrontends = microfrontends.filter((mf) => mf.name !== name);

    // Если длина не изменилась, МФ не был найден
    if (microfrontends.length === initialLength) {
      return reply.status(404).send({ error: 'Not Found', message: 'Microfrontend not found' });
    }

    // Записываем обновлённый список обратно в файл
    fs.writeFileSync(DB_PATH, JSON.stringify(microfrontends, null, 2));

    // Успешное удаление, возвращаем 204 No Content
    reply.status(204).send(); // Нет тела ответа
  } catch (err) {
    request.log.error(err);
    reply.status(500).send({ error: 'Internal Server Error', details: (err as Error).message });
  }
});

// --- Запуск сервера ---

const start = async () => {
  try {
    // Регистрируем эндпоинт /
    server.get('/', async (request, reply) => {
      return { hello: 'host-server' };
    });

    // Слушаем на всех интерфейсах
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Host Server запущен на http://localhost:3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export { server }; // Экспортируем сервер, если нужно использовать в тестах или других файлах
