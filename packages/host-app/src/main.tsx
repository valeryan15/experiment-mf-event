// main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client'; // Используем createRoot из react-dom/client для React 18+
import App from './app/App'; // Импортируем основной компонент приложения
// Импортируем глобальные стили, если они есть (опционально)
// import './index.css';
import { createInstance } from "@module-federation/runtime";
//
createInstance({
  name: 'host_app', // Должно совпадать с name в federation
  remotes: [], // Оставьте пустым для полной динамики
});
// Находим корневой DOM элемент, в который будет монтироваться React-приложение
const container = document.getElementById('root');

// Проверяем, что элемент #root существует
if (container) {
  // Создаём корень React
  const root = createRoot(container);

  // Рендерим компонент App внутри корня
  // App (через AppProviders) уже оборачивает всё приложение в необходимые провайдеры
  root.render(
    <React.StrictMode> {/* Рекомендуется для разработки */}
      <App />
    </React.StrictMode>
  );
} else {
  // Логируем ошибку, если корневой элемент не найден
  console.error('Failed to find the root element');
}