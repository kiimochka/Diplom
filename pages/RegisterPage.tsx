import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, USERS_STORAGE_KEY } from "../types";
import "../styles/login.css"; // можно использовать те же стили

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (fullName.trim().length < 3) {
      setError("Введите полное имя (не менее 3 символов).");
      return;
    }

    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setError("Введите корректный E-mail.");
      return;
    }

    if (!consent) {
      setError("Нужно согласиться с политикой конфиденциальности.");
      return;
    }

    // читаем уже зарегистрированных пользователей
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    let users: User[] = [];
    if (stored) {
      try {
        users = JSON.parse(stored) as User[];
      } catch {
        users = [];
      }
    }

    // проверка на существующий e-mail
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existing) {
      setError(
        "Пользователь с таким E-mail уже зарегистрирован. Попробуйте войти.",
      );
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      fullName,
      email,
      rating: 5,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    // сразу авторизуем
    login(newUser);
    navigate("/profile", { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Регистрация</h1>
        <p className="login-subtitle">
          Создайте аккаунт, чтобы бронировать и создавать поездки.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-field">
            Имя и фамилия
            <input
              type="text"
              value={fullName}
              className="login-input"
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
              }}
              placeholder="Иван Иванов"
              required
            />
          </label>

          <label className="login-field">
            E-mail
            <input
              type="email"
              value={email}
              className="login-input"
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="example@mail.ru"
              required
            />
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setError(null);
              }}
              required
            />
            <span>
              Я соглашаюсь с{" "}
              <Link to="/privacy-policy" target="_blank" rel="noreferrer">
                Политикой конфиденциальности{" "}
              </Link>{" "}
              и{" "}
              <Link to="/personal-data-consent" className="settings-link">
                {" "}
                Обработкой персональных данных
              </Link>
              .
            </span>
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            Зарегистрироваться
          </button>
        </form>

        <div className="login-links">
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/login")}
          >
            Уже есть аккаунт
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
