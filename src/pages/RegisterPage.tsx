import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, USERS_STORAGE_KEY } from "../types";

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (fullName.trim().length < 3) {
      alert("Введите полное имя (не менее 3 символов).");
      return;
    }

    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      alert("Введите корректный E-mail.");
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

    // проверка на существующий e-mail (простая)
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existing) {
      alert(
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
    navigate("/profile");
  };

  return (
    <div className="register-page">
      <h1>Регистрация</h1>
      <p>Создайте аккаунт, чтобы бронировать и создавать поездки.</p>

      <form onSubmit={handleSubmit} className="register-form">
        <label>
          Имя и фамилия
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default RegisterPage;
