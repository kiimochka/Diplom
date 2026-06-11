// src/pages/SupportPage.tsx
import React, { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import "../styles/support.css";

const SupportPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // здесь можно будет добавить отправку на сервер / email
    console.log("Support form submit:", { name, email, message });

    // очистка формы
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="support-page">
      <h1 className="support-title">Служба поддержки</h1>

      <form className="support-form" onSubmit={handleSubmit}>
        <div className="support-form-group">
          <label htmlFor="support-name">Имя</label>
          <input
            id="support-name"
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="support-form-group">
          <label htmlFor="support-email">Почта</label>
          <input
            id="support-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="support-form-group">
          <label htmlFor="support-message">Сообщение</label>
          <textarea
            id="support-message"
            placeholder="Опишите ваш вопрос или проблему"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <p className="support-consent-text">
          Нажимая кнопку «Отправить», вы соглашаетесь с{" "}
          <Link to="/privacy-policy" target="_blank" rel="noreferrer">
            Политикой конфиденциальности
          </Link>{" "}
          и даёте{" "}
          <Link to="/personal-data-consent" className="settings-link">
            Согласие на обработку и сбор персональных данных.
          </Link>
        </p>

        <button type="submit" className="support-submit-btn">
          Отправить
        </button>
      </form>
    </div>
  );
};

export default SupportPage;
