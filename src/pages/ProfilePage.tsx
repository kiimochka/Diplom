import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileHistory from '../components/profile/ProfileHistory';
import ProfilePersonalData from '../components/profile/ProfilePersonalData';
import ProfileSettings from '../components/profile/ProfileSettings';

type Section = 'history' | 'personal' | 'messenger' | 'settings' | 'support';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('history');

  if (!user) {
    return (
      <div>
        Вы не авторизованы (в MVP здесь позже сделаем редирект на /login).
      </div>
    );
  }

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <button onClick={() => setActiveSection('history')}>
          История поездок
        </button>
        <button onClick={() => setActiveSection('personal')}>
          Личные данные
        </button>
        <button onClick={() => setActiveSection('messenger')}>
          Мессенджер
        </button>
        <button onClick={() => setActiveSection('settings')}>
          Настройки
        </button>
        <button onClick={() => setActiveSection('support')}>
          Служба поддержки
        </button>
      </aside>

      <section className="profile-content">
        {activeSection === 'history' && (
          <ProfileHistory />
        )}

        {activeSection === 'personal' && (
          <ProfilePersonalData />
        )}

        {activeSection === 'messenger' && (
          <div>Здесь будет мессенджер для общения с водителями.</div>
        )}

        {activeSection === 'settings' && (
          <ProfileSettings />
        )}

        {activeSection === 'support' && (
          <div>Служба поддержки: номер горячей линии и чат.</div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
