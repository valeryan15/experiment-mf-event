import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './bootstrap'; // Импортируем наш компонент

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);