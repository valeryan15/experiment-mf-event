import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { dependencies } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    federation({
      name: 'host_app', // Имя хост-приложения
      remotes: {
        dummy: 'dummy.js', // Dummy remote для обхода ошибок на runtime (обязательно для динамической загрузки)
      },
      // manifest: true,
      shared: {
        react: {
          requiredVersion: dependencies.react,
          singleton: true,
          shareScope: 'default',
        },
        'react-dom': {
          requiredVersion: dependencies['react-dom'],
          singleton: true,
          shareScope: 'default',
        },
        'react-router-dom': {
          requiredVersion: dependencies['react-router-dom'],
          singleton: true,
          shareScope: 'default',
        },
        '@tanstack/react-query': {
          requiredVersion: dependencies['@tanstack/react-query'],
          singleton: true,
          shareScope: 'default',
        },
      },
      // [
      //   'react',
      //   'react-dom',
      //   'react-router-dom',
      //   '@tanstack/react-query',
      //   // '@mf-system/event-bus', // EventBus как shared модуль
      //   // Добавьте другие зависимости, которые должны быть общими
      // ],
    }),
    react(),
  ],
  server: {
    port: 3000, // Порт хост-приложения
    strictPort: true,
    fs: {
      allow: ['.'], // Рекомендуется добавить для разрешения доступа к файлам в dev-режиме
    },
  },
  build: {
    target: 'esnext',
  },
});
