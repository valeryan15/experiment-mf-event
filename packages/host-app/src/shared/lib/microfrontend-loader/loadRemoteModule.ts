// Тип для контейнера Module Federation
interface RemoteContainer {
  init(shareScope: any): Promise<void>;
  get(module: string): () => Promise<any>;
}

// Тип для глобального объекта window, куда загружаются удаленные модули
declare global {
  interface Window {
    __webpack_share_scopes__: Record<string, any>;
    [key: string]: any; // Для доступа к удаленным контейнерам по имени
  }
}

/**
 * Загружает удаленный модуль из указанного remoteEntry URL.
 * @param remoteEntryUrl - URL до remoteEntry.js удаленного МФ.
 * @param remoteName - Имя удаленного МФ (как указано в vite.config.ts).
 * @param exposedModule - Путь к экспортируемому модулю (например, './App').
 * @returns Promise, разрешающийся с экспортированным модулем.
 */
export const loadRemoteModule = async (
  remoteEntryUrl: string,
  remoteName: string, // remoteName нужен для поиска в window в продакшене
  exposedModule: string
): Promise<any> => {
  try {
    console.log(`Загрузка remoteEntry из: ${remoteEntryUrl}`);

    // Шаг 1: Загрузка remoteEntry.js как ES Module через import()
    // В dev-режиме Vite, это вернёт объект с методами init и get
    const remoteEntryModule = await import(/* @vite-ignore */ remoteEntryUrl);
    console.log('remoteEntryModule', remoteEntryModule);
    // Проверяем, есть ли у нас методы init и get в импортированном модуле (dev-режим Vite)
    if (
      typeof remoteEntryModule.init === 'function' &&
      typeof remoteEntryModule.get === 'function'
    ) {
      console.log('Обнаружен dev-режим Vite для remoteEntry.');

      // Шаг 2 (dev): Инициализация общего scope
      if (!window?.__webpack_share_scopes__?.default) {
        console.warn(
          `window.__webpack_share_scopes__.default не инициализирован. Попробуем инициализировать.`
        );
        window['__webpack_share_scopes__'] = {
          default: {},
        };
      }

      await remoteEntryModule.init(window.__webpack_share_scopes__.default);

      // Шаг 3 (dev): Получаем фабрику для нужного модуля
      const factory = await remoteEntryModule.get(exposedModule);
      if (!factory) {
        throw new Error(`Модуль ${exposedModule} не найден в remoteEntry (dev)`);
      }

      // Шаг 4 (dev): Вызываем фабрику, чтобы получить сам модуль
      const Module = await factory();
      console.log(`Модуль ${exposedModule} успешно загружен (dev).`);
      return Module;
    } else {
      // Если методов нет, значит, это не dev-режим Vite или что-то пошло не так
      // Попробуем найти контейнер в window (для сборки/продакшена)
      console.log(
        `Не найдены init/get в remoteEntry (dev). Попытка поиска в window (для сборки)...`
      );
      const container = window[remoteName] as RemoteContainer;
      if (!container) {
        throw new Error(
          `Контейнер ${remoteName} не найден в window после загрузки ${remoteEntryUrl}.`
        );
      }

      console.log(`Найден контейнер ${remoteName} в window (build).`);

      // Шаг 2 (build): Инициализация общего scope (обычно 'default')
      if (!window.__webpack_share_scopes__.default) {
        console.warn(
          `window.__webpack_share_scopes__.default не инициализирован. Попробуем инициализировать.`
        );
        window['__webpack_share_scopes__'] = {
          default: {},
        };
      }

      await container.init(window.__webpack_share_scopes__.default);

      // Шаг 3 (build): Получаем фабрику для нужного модуля
      const factory = await container.get(exposedModule);
      if (!factory) {
        throw new Error(`Модуль ${exposedModule} не найден в контейнере ${remoteName} (build)`);
      }

      // Шаг 4 (build): Вызываем фабрику, чтобы получить сам модуль
      const Module = await factory();
      console.log(`Модуль ${exposedModule} успешно загружен (build).`);
      return Module;
    }
  } catch (error) {
    console.error(
      `Ошибка загрузки удаленного модуля ${exposedModule} из ${remoteName} (${remoteEntryUrl}):`,
      error
    );
    throw error; // Пробрасываем ошибку дальше, чтобы обработать в месте использования (например, в lazy)
  }
};
