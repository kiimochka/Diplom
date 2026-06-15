import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProfileSettings: React.FC = () => {
  const { deleteProfile, logout } = useAuth();
  const navigate = useNavigate();
  const settingsReturnState = {
    from: "/profile",
    fromState: { section: "settings" },
  };

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
          Политика конфиденциальности объясняет, какие данные сервис собирает,
          как они используются, где хранятся и какие права есть у пользователя.
          Она нужна, чтобы вы понимали, как защищается ваша личная информация.
        </p>
        <Link
          to="/privacy-policy"
          className="settings-link"
          state={settingsReturnState}
        >
          Открыть политику конфиденциальности
        </Link>
      </section>

      <section className="settings-section">
        <h3>Согласие на обработку персональных данных</h3>
        <p>
          Согласие подтверждает, что вы разрешаете сервису использовать ваши
          данные для регистрации, бронирования поездок, уведомлений и связи с
          другими пользователями. Без него сервис не сможет корректно обработать
          ваши заявки и данные профиля.
        </p>
        <Link
          to="/personal-data-consent"
          className="settings-link"
          state={settingsReturnState}
        >
          Открыть текст согласия
        </Link>
      </section>

      <section className="settings-section">
        <h3>Способы оплаты</h3>
        <p>Этот раздел находится в разработке.</p>
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
