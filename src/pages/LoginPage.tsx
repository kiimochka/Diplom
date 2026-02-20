import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, USERS_STORAGE_KEY } from "../types";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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
    navigate("/profile");
  };

  return (
    <div className="login-page">
      <h1>Вход</h1>
      <p>Войдите по E-mail, указанный при регистрации.</p>

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            required
          />
        </label>

        {error && <div className="error-text">{error}</div>}

        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default LoginPage;
