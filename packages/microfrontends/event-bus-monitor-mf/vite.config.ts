import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'event_bus_monitor_mf',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/bootstrap.tsx',
      },
      shared: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        '@mf-system/event-bus', // EventBus как shared модуль
      ],
    }),
  ],
  server: {
    port: 5003,
    strictPort: true,
  },
  build: {
    target: 'esnext',
  },
});
