import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProfileSettings: React.FC = () => {
  const { deleteProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteProfile = () => {
    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить профиль? Это действие нельзя отменить.",
    );
    if (!confirmDelete) return;

    // очищаем данные профиля
    deleteProfile();

    // доп. очистка других ключей, связанных с пользователем
    localStorage.removeItem("rideshare-personal-data");

    // выходим из аккаунта (на всякий случай)
    logout();

    // перенаправляем на главную
    navigate("/");
  };

  return (
    <div className="profile-settings">
      <h1 className="support-title">Настройки</h1>

      <section className="settings-section">
        <h3>Политика конфиденциальности</h3>
        <p>
          На отдельной странице размещён полный текст политики
          конфиденциальности и условий обработки персональных данных.
        </p>
        <Link to="/privacy-policy" className="settings-link">
          Открыть политику конфиденциальности
        </Link>
      </section>

      <section className="settings-section">
        <h3>Согласие на обработку персональных данных</h3>
        <p>
          При регистрации в сервисе пользователь дополнительно подтверждает
          согласие на обработку своих персональных данных в соответствии с
          политикой конфиденциальности.
        </p>
        <Link to="/personal-data-consent" className="settings-link">
          Открыть текст согласия
        </Link>
      </section>

      <section className="settings-section">
        <h3>Способы оплаты</h3>
        <p>
          В MVP можно оставить описание планируемых способов оплаты (карта, СБП
          и т.п.) без реальной интеграции.
        </p>
      </section>

      <section className="settings-section">
        <h3>Удаление профиля</h3>
        <p>
          Нажав «Удалить профиль», вы удалите свои данные из текущего устройства
          и выйдете из аккаунта.
        </p>
        <button className="danger-button" onClick={handleDeleteProfile}>
          Удалить профиль
        </button>
      </section>
    </div>
  );
};

export default ProfileSettings;
