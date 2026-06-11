import React, { useState, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, USERS_STORAGE_KEY } from "../types";
import "../styles/login.css";

type LoginLocationState = {
  from?: string;
  section?: string;
  message?: string;
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setError("Введите корректный E-mail.");
      return;
    }

    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      setError("Пользователь не найден. Сначала зарегистрируйтесь.");
      return;
    }

    let users: User[] = [];
    try {
      users = JSON.parse(stored) as User[];
    } catch {
      setError("Ошибка чтения данных. Попробуйте зарегистрироваться заново.");
      return;
    }

    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!existing) {
      setError("Пользователь не найден. Сначала зарегистрируйтесь.");
      return;
    }

    // вход
    login(existing);
    const nextPath =
      locationState?.from?.startsWith("/") && !locationState.from.startsWith("//")
        ? locationState.from
        : "/profile";

    navigate(nextPath, {
      replace: true,
      state: locationState?.section
        ? { section: locationState.section }
        : undefined,
    });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Войти</h1>

        {/* Можно добавить соц‑кнопки позже */}
        {/* <div className="login-social">
          <button className="social-btn ok">ОК</button>
          <button className="social-btn vk">VK</button>
        </div>

        <div className="login-or">или</div> */}

        <p className="login-subtitle">
          Войдите по E-mail, указанному при регистрации.
        </p>

        {locationState?.message && (
          <div className="login-info">{locationState.message}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
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

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            Войти
          </button>
        </form>

        <div className="login-links">
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/register")}
          >
            Зарегистрироваться
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/reset-password")}
          >
            Восстановить пароль
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
