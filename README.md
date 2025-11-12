# Документация

## Описание

Этот проект представляет собой систему микрофронтендов (Micro Frontends) с динамической загрузкой и централизованной шиной событий (EventBus). Архитектура включает хост-приложение (`host-app`), бэкенд-сервер (`host-server`) для управления конфигурацией МФ, сами микрофронтенды (`shop-mf`, `dashboard-mf`, `event-bus-monitor-mf`) и общую библиотеку `@mf-system/event-bus`.

## Технические требования

- **Node.js:** Версия `20.19+` или `22.12+`. Это необходимо для корректной работы Vite.
- **Пакетный менеджер:** Проект использует `pnpm`. Убедитесь, что он установлен на вашей машине. Рекомендуемая версия — `>= 8.0.0`.
- **Типизация:** Проект написан на TypeScript.

## Подготовка к запуску

1.  **Клонируйте репозиторий:**

    ```bash
    git clone https://github.com/valeryan15/experiment-mf-event.git
    cd mf-event-system
    ```

2.  **Установите зависимости:**
    - Убедитесь, что у вас установлена подходящая версия Node.js.
    - Выполните команду:
      ```bash
      pnpm install
      ```
      Эта команда установит все зависимости для всех пакетов в монорепозитории с помощью `pnpm workspaces`.

3.  **Настройте базу данных сервера:**
    - В директории `packages/host-server/` находится файл `db.example.json`. Этот файл является шаблоном и не должен попадать в Git.
    - Скопируйте его и переименуйте:
      ```bash
      cp packages/host-server/db.example.json packages/host-server/db.json
      ```
    - Файл `db.json` будет использоваться `host-server` для хранения конфигураций микрофронтендов. Он добавлен в `.gitignore`, поэтому изменения в нём не будут отслеживаться системой контроля версий.

## Запуск проекта в режиме разработки (dev)

В этом режиме каждый сервис запускается локально со своим Dev Server'ом, что позволяет использовать горячую перезагрузку (HMR) и быструю итерацию.

1.  **Запустите `host-server`:**
    Откройте терминал и выполните:

    ```bash
    cd packages/host-server
    pnpm run dev
    ```

    Сервер запустится на `http://localhost:3001`.

2.  **Запустите микрофронтенды:**
    Откройте отдельные терминалы для каждого микрофронтенда и запустите их:

    ```bash
    # Для shop-mf
    cd packages/microfrontends/shop-mf
    pnpm run dev
    # Запускается на http://localhost:5001

    # Для dashboard-mf
    cd packages/microfrontends/dashboard-mf
    pnpm run dev
    # Запускается на http://localhost:5002

    # Для event-bus-monitor-mf
    cd packages/microfrontends/event-bus-monitor-mf
    pnpm run dev
    # Запускается на http://localhost:5003
    ```

3.  **Запустите `host-app`:**
    Откройте ещё один терминал и выполните:

    ```bash
    cd packages/host-app
    pnpm run dev
    ```

    Хост-приложение запустится на `http://localhost:3000`.

4.  **Регистрация микрофронтендов:**
    - Откройте браузер и перейдите по адресу `http://localhost:3000/admin`.
    - Используйте форму "Добавить новый МФ", чтобы зарегистрировать каждый из запущенных микрофронтендов:
      - **Имя:** `Shop`
      - **Маршрут:** `/shop`
      - **URL:** `http://localhost:5001/remoteEntry.js`
    - Повторите шаги для `Dashboard` (`/dashboard`, `http://localhost:5002/remoteEntry.js`) и `EventBusMonitor` (`/monitor`, `http://localhost:5003/remoteEntry.js`).
    - После регистрации вы сможете открывать эти маршруты в `host-app`.

## Запуск проекта в продакшен-режиме (build & serve)

В этом режиме весь стек запускается через Docker. Каждый сервис собирается в контейнер и запускается.

1.  **Соберите и запустите все сервисы:**
    Убедитесь, что Docker Desktop (или другой Docker-движок) запущен.
    В корне проекта выполните:

    ```bash
    docker-compose up --build
    ```

    Эта команда:
    - Соберёт образы для `host-server`, `host-app`, `shop-mf`, `dashboard-mf`, `event-bus-monitor-mf`.
    - Создаст и запустит контейнеры.
    - Примонтирует файл `db.json` как volume, чтобы сохранять данные между перезапусками контейнера `host-server`.

2.  **Доступ к приложению:**
    - **Host Application:** `http://localhost:3000`
    - **Host Server API:** `http://localhost:3001`
    - **Микрофронтенды** доступны только через `host-app` после их регистрации через админ-панель.

3.  **Регистрация микрофронтендов:**
    - Перейдите в админ-панель `host-app` по адресу `http://localhost:3000/admin`.
    - Зарегистрируйте микрофронтенды, используя URL, которые работают _внутри сети Docker Compose_:
      - **Имя:** `Shop`
      - **Маршрут:** `/shop`
      - **URL:** `http://shop-mf/remoteEntry.js`
    - Аналогично для `Dashboard` (`http://dashboard-mf/remoteEntry.js`) и `EventBusMonitor` (`http://event-bus-monitor-mf/remoteEntry.js`).

4.  **Особенности продакшен-режима:**
    - `host-app` и микрофронтенды отдаются через Nginx.
    - Все маршруты обрабатываются корректно благодаря настройке `try_files $uri $uri/ /index.html;` в `nginx.conf`.
    - `host-server` автоматически предоставляет CORS-заголовки для `http://localhost:3000` и `http://host-app`.

## Структура проекта

Проект организован как монорепозиторий с использованием `pnpm workspaces`.

```
mf-event-system/
├── pnpm-workspace.yaml          # Определяет workspace пакеты
├── .gitignore                  # Исключает node_modules, dist, db.json и т.д.
├── package.json                # Корневые скрипты для управления всеми пакетами
├── packages/
│   ├── host-app/               # Главное приложение
│   │   ├── Dockerfile
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       └── ...             # FSD структура
│   ├── host-server/            # Бэкенд-сервер
│   │   ├── Dockerfile
│   │   ├── src/server.ts
│   │   ├── db.example.json       # Шаблон файла базы данных
│   │   └── .gitignore          # Не включает db.json в Git
│   ├── microfrontends/
│   │   ├── shop-mf/
│   │   │   ├── Dockerfile
│   │   │   ├── vite.config.ts
│   │   │   └── src/bootstrap.tsx
│   │   ├── dashboard-mf/
│   │   │   ├── Dockerfile
│   │   │   ├── vite.config.ts
│   │   │   └── src/bootstrap.tsx
│   │   └── event-bus-monitor-mf/
│   │       ├── Dockerfile
│   │       ├── vite.config.ts
│   │       └── src/bootstrap.tsx
│   └── event-bus/              # Библиотека EventBus
│       ├── src/
│       │   ├── EventBus.ts     # Ядро шины событий
│       │   └── types.ts
│       └── package.json
└── docker-compose.yml          # Конфигурация для запуска всего стека
```

## Коммуникация через EventBus

- Центральная шина событий реализована в пакете `@mf-system/event-bus`.
- `host-app` инициализирует экземпляр `EventBus` и помещает его в глобальный объект `window.__MICROFRONTEND_EVENT_BUS__`.
- Все компоненты в `host-app` и микрофронтендах получают доступ к `EventBus` через этот глобальный объект.

## Добавление нового микрофронтенда

1.  Создайте новую директорию в `packages/microfrontends/`.
2.  Инициализируйте `package.json` и `vite.config.ts` по аналогии с существующими МФ.
3.  Обязательно включите `react` и `react-dom` в секцию `shared` в `vite.config.ts` нового МФ.
4.  Реализуйте точку входа `bootstrap.tsx`.
5.  Добавьте сервис в `docker-compose.yml`.
6.  Зарегистрируйте его через админ-панель `host-app` (в любом режиме запуска).

---
