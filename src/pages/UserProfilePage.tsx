import React from "react";
import { useParams } from "react-router-dom";
import { PublicProfile } from "../types";

// Пока один мок-профиль для примера
const mockUserProfile: PublicProfile = {
  id: "u1",
  fullName: "Анна Смирнова",
  email: "anna@example.com",
  rating: 4.9,
  about:
    "Часто езжу по маршруту Барнаул–Новосибирск. Люблю спокойную музыку и тишину в дороге.",
  tripsCount: 30,
  reviewsCount: 12,
};

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // в будущем можно будет искать по id
  const profile = mockUserProfile;

  return (
    <div className="user-profile-page">
      <h1>Профиль пользователя</h1>

      <section className="user-main-info">
        <h2>{profile.fullName}</h2>
        <p>Рейтинг: {profile.rating ?? "—"}</p>
        <p>Поездок: {profile.tripsCount}</p>
        <p>Отзывов: {profile.reviewsCount}</p>
      </section>

      <section className="user-about">
        <h3>О пользователе</h3>
        <p>{profile.about}</p>
      </section>

      <section className="user-reviews">
        <h3>Отзывы</h3>
        <ul>
          <li>«Очень пунктуален(а), поездка прошла комфортно.»</li>
          <li>«Приятный собеседник, всё по договорённости.»</li>
        </ul>
      </section>
    </div>
  );
};

export default UserProfilePage;
