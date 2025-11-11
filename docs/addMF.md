Хорошо, давайте опишем процесс **правильного добавления нового микрофронтенда (МФ) в хост-приложение (`host-app`)** в рамках реализованной архитектуры проекта `Project`.

Процесс включает в себя как **разработку и подготовку** самого МФ, так и его **регистрацию и интеграцию** через `host-app` и `host-server`.

---

### **Шаги по добавлению нового МФ в хост**

#### **1. Создание и подготовка нового МФ**

Этот шаг выполняется разработчиком МФ.

1.  **Создать структуру пакета МФ:**
    *   В директории `packages/microfrontends/` создать новую папку, например, `my-new-mf`.
    *   Внутри `my-new-mf` создать стандартную структуру FSD: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

2.  **Инициализировать `package.json`:**
    *   В `packages/microfrontends/my-new-mf/package.json` определить имя, версию, зависимости (`react`, `react-dom`, `@mf-system/event-bus`), и скрипты сборки (`vite build`, `vite dev`).
    *   Убедиться, что `@mf-system/event-bus` указана как зависимость, если МФ будет использовать EventBus.

    **Пример `package.json`:**
    ```json
    {
      "name": "my-new-mf",
      "private": true,
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "vite build", // Убедитесь, что tsc не включён сюда напрямую, если используете vite-plugin-checker
        "preview": "vite preview"
      },
      "dependencies": {
        "react": "^19.2.2",
        "react-dom": "^19.2.2",
        "@mf-system/event-bus": "workspace:*" // Использование пакета из workspace
      },
      "devDependencies": {
        "@types/react": "^19.2.2",
        "@types/react-dom": "^19.2.2",
        "@vitejs/plugin-react": "^4.4.1",
        "vite": "^7.1.12",
        "@module-federation/vite": "^1.0.0",
        "typescript": "^5.7.3",
        "vite-plugin-checker": "^0.8.0" // Для проверки типов при сборке
      }
    }
    ```

3.  **Настроить `vite.config.ts`:**
    *   В `packages/microfrontends/my-new-mf/vite.config.ts` настроить Module Federation:
        *   Указать `name` (должно совпадать с именем сервиса в `docker-compose.yml`, если используется динамическая загрузка).
        *   Указать `filename` для `remoteEntry.js`.
        *   Экспортировать компонент (например, `./src/bootstrap.tsx`).
        *   Указать `shared` зависимости (включая `@mf-system/event-bus`, `react`, `react-dom`, и т.д.).

    **Пример `vite.config.ts`:**
    ```ts
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import federation from '@module-federation/vite';

    export default defineConfig({
      plugins: [
        react(),
        federation({
          name: 'my_new_mf', // Важно: совпадает с именем в docker-compose.yml и remotes в host-app (если бы были статические remotes)
          filename: 'remoteEntry.js',
          exposes: {
            './App': './src/bootstrap.tsx', // Компонент для загрузки
            // './Button': './src/shared/ui/Button.tsx', // Опционально: другие экспорты
          },
          shared: [
            'react',
            'react-dom',
            'react-router-dom', // Если используется
            '@tanstack/react-query', // Если используется
            '@mf-system/event-bus', // Обязательно, если используется EventBus
            // ... другие общие зависимости
          ],
        }),
      ],
      server: {
        port: 5004, // Уникальный порт для разработки
        strictPort: true,
      },
      build: {
        target: 'esnext',
      },
    });
    ```

4.  **Создать точку входа (`bootstrap.tsx`):**
    *   В `packages/microfrontends/my-new-mf/src/bootstrap.tsx` создать основной React-компонент МФ.
    *   *Если МФ использует EventBus*, получить `EventBus` экземпляр из `window` и подписаться/отправить события.

    **Пример `bootstrap.tsx`:**
    ```tsx
    import React, { useEffect } from 'react';
    import { EventBus } from '@mf-system/event-bus'; // Импортируем тип

    // Тип для глобального объекта window
    declare global {
      interface Window {
        __MICROFRONTEND_EVENT_BUS__: EventBus;
      }
    }

    const MyNewApp: React.FC = () => {
      // Получаем EventBus из window
      const eventBus = typeof window !== 'undefined' ? window.__MICROFRONTEND_EVENT_BUS__ : null;

      useEffect(() => {
        if (!eventBus) {
            console.error('EventBus не найден в window.__MICROFRONTEND_EVENT_BUS__ в my-new-mf');
            return;
        }

        const handleSomeEvent = ( any) => {
          console.log('MyNewMF получил событие:', data);
          // Обработка данных
        };

        eventBus.on('someEvent', handleSomeEvent, 'my-new-mf');

        // Получить последнее состояние (State Synchronization)
        const lastState = eventBus.getCurrentState('someEvent');
        if (lastState) {
          console.log('MyNewMF получил последнее состояние someEvent:', lastState);
        }

        return () => {
          eventBus.off('someEvent', handleSomeEvent, 'my-new-mf');
        };
      }, [eventBus]);

      const triggerEvent = () => {
        if (eventBus) {
            eventBus.emit('userAction', { action: 'clickedButtonInNewMF', details: '...' }, 'my-new-mf');
        }
      };

      return (
        <div>
          <h2>Микрофронтенд: My New MF</h2>
          <p>Это содержимое из my-new-mf.</p>
          <button onClick={triggerEvent}>Триггерить событие</button>
        </div>
      );
    };

    export default MyNewApp;
    ```

5.  **Создать `tsconfig.json`:**
    *   Настроить `tsconfig.json` в `my-new-mf`, указав `moduleResolution: "bundler"`, `target`, `jsx` и т.д. Убедиться, что `baseUrl` и `paths` (если используются внутри МФ) корректны. Убедиться, что `@mf-system/event-bus` разрешается правильно (через `node_modules`).

    **Пример `tsconfig.json`:**
    ```json
    {
      "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "baseUrl": ".",
        "paths": {
          // "@shared/*": ["./src/shared/*"] // Пример, если используется
        }
      },
      "include": ["src"],
      "references": [{"path": "./tsconfig.node.json"}]
    }
    ```

6.  **Создать `Dockerfile`:**
    *   В `packages/microfrontends/my-new-mf/Dockerfile` определить multi-stage сборку, аналогично другим МФ (`shop-mf`, `dashboard-mf`). Убедиться, что `vite build` запускается корректно, и `dist` копируется в `nginx` контейнер.

    **Пример `Dockerfile`:**
    ```Dockerfile
    FROM node:20-alpine AS builder

    WORKDIR /app

    COPY package.json pnpm-lock.yaml ./
    RUN npm install -g pnpm

    # Установим NODE_ENV=production перед установкой
    ENV CI=true
    ENV NODE_ENV=production
    RUN pnpm install --no-frozen-lockfile # Используем --no-frozen-lockfile если были проблемы в билд-стейдже

    # Скопируем ВСЕ исходники проекта
    COPY . .

    # Соберём event-bus (его .d.ts нужны my-new-mf при сборке)
    RUN cd packages/event-bus && pnpm run build

    # Выполним сборку my-new-mf
    RUN cd packages/microfrontends/my-new-mf && pnpm run build

    FROM nginx:alpine AS production

    COPY --from=builder /app/packages/microfrontends/my-new-mf/dist /usr/share/nginx/html

    EXPOSE 80

    CMD ["nginx", "-g", "daemon off;"]
    ```

7.  **Обновить `docker-compose.yml`:**
    *   Добавить новый сервис для `my-new-mf`.

    **Пример обновления `docker-compose.yml`:**
    ```yaml
    # ... (остальные сервисы)
    my-new-mf:
      build:
        context: .
        dockerfile: ./packages/microfrontends/my-new-mf/Dockerfile
      ports:
        - "5004:80" # Мапим на порт 5004 хоста
      restart: unless-stopped
    # ... (остальные сервисы)
    ```

8.  **Собрать и запустить МФ:**
    *   Убедиться, что МФ можно собрать и запустить локально или в Docker.

#### **2. Регистрация МФ в `host-server` и `host-app`**

Этот шаг регистрирует МФ в системе, чтобы `host-app` знал о нём.

1.  **Добавить конфигурацию МФ в `host-server`:**
    *   Никаких изменений в *коде* `host-server` не требуется, так как `host-server` предоставляет API для *управления* конфигурациями МФ.

2.  **Добавить МФ через админ-панель `host-app`:**
    *   Запустить `host-app` (и `host-server`).
    *   Перейти в админ-панель (`http://localhost:3000/admin`).
    *   Заполнить форму:
        *   **Имя:** `MyNewMF` (или любое уникальное имя).
        *   **Маршрут:** `/my-new-mf` (путь, по которому будет доступен МФ).
        *   **URL:** `http://my-new-mf/remoteEntry.js` (если запущен через `docker-compose`, или `http://localhost:5004/remoteEntry.js` для локальной разработки).
    *   Нажать "Добавить".

3.  **Проверить интеграцию:**
    *   В `host-app` должна появиться ссылка "MyNewMF" в навигации.
    *   При переходе по маршруту `/my-new-mf` `host-app` должен динамически загрузить `remoteEntry.js` с `my-new-mf`, получить компонент `App` и отобразить его в `ContentArea`.
    *   Проверить работу EventBus между `host-app` и `my-new-mf` (если реализованы соответствующие подписки/эмиты).

---

### **Ключевые моменты:**

*   **Независимость:** МФ разрабатывается и собирается независимо.
*   **Module Federation:** Используется для динамической загрузки.
*   **`host-server` API:** Централизованное управление конфигурациями МФ.
*   **`host-app` динамическая маршрутизация:** `useMicrofrontendRoutes`, `loadRemoteModule`.
*   **`EventBus`:** Централизованная шина событий, доступная через `window.__MICROFRONTEND_EVENT_BUS__`.
*   **Docker & `docker-compose`:** Управление жизненным циклом сервисов.
*   **`pnpm workspace`:** Управление зависимостями и связями между пакетами.