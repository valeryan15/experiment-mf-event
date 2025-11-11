import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { dependencies } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    federation({
      name: 'shop_mf', // Имя этого МФ, должно совпадать с ключом в remotes хоста
      filename: 'remoteEntry.js', // Имя файла для удаленного входа
      // Определяем, какие компоненты/модули будут доступны другим
      manifest: true,
      exposes: {
        './App': './src/bootstrap.tsx', // Экспортируем компонент App
        // Можно экспортировать и другие вещи, например './Button': './src/shared/ui/Button.tsx'
      },
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
    port: 5001, // Порт для shop-mf
    strictPort: true,
    fs: { allow: ['.'] },
  },
  preview: {
    port: 5001, // Customize the preview server port
  },
  build: {
    target: 'esnext',
  },
});
