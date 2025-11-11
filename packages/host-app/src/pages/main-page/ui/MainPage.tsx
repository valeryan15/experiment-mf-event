import React from 'react';
import { Link } from 'react-router-dom';

const MainPage: React.FC = () => {
  return (
    <div>
      <h1>Добро пожаловать в Host Application</h1>
      <p>Это главная страница.</p>
      <nav>
        <ul>
          <li><Link to="/admin">Админ панель</Link></li>
          {/* Ссылки на динамические МФ будут добавлены позже */}
        </ul>
      </nav>
    </div>
  );
};

export default MainPage;