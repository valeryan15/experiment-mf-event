import React from 'react';
import { MicrofrontendForm } from '../../../features/microfrontend-manager/ui/MicrofrontendForm';
import { MicrofrontendList } from '../../../features/microfrontend-manager/ui/MicrofrontendList';

const AdminPanel: React.FC = () => {
  return (
    <div>
      <h1>Админ панель</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Добавить новый МФ</h2>
          <MicrofrontendForm />
        </div>
        <div style={{ flex: 1 }}>
          <h2>Список зарегистрированных МФ</h2>
          <MicrofrontendList />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
