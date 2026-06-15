import React, { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  CARS_STORAGE_KEY,
  Car,
  Review,
  REVIEWS_STORAGE_KEY,
  USERS_STORAGE_KEY,
} from "../../types";
import { mockReviews, mockUsers } from "../../mockData";
import {
  CalendarIcon,
  EditIcon,
  MessageIcon,
  People,
  StarFilledIcon,
} from "../../icons/IconsIndex";
import "../../styles/personaldata.css";

interface PersonalData {
  fullName: string;
  passport: string;
  phone: string;
  email: string;
  about: string;
  avatarUrl?: string;
}

const STORAGE_KEY = "rideshare-personal-data";
const ABOUT_MAX_LENGTH = 500;
const AVATAR_MAX_SIZE = 2 * 1024 * 1024;

const readUsers = (): User[] => {
  const usersById = new Map<string, User>();
  mockUsers.forEach((mockUser) => usersById.set(mockUser.id, mockUser));

  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!storedUsers) return Array.from(usersById.values());

  try {
    const parsedUsers = JSON.parse(storedUsers);
    if (!Array.isArray(parsedUsers)) return Array.from(usersById.values());

    parsedUsers.forEach((storedUser) => {
      if (storedUser && typeof storedUser.id === "string") {
        usersById.set(storedUser.id, {
          ...usersById.get(storedUser.id),
          ...storedUser,
        });
      }
    });
  } catch {
    return Array.from(usersById.values());
  }

  return Array.from(usersById.values());
};

const readReviews = (): Review[] => {
  const reviewsById = new Map<string, Review>();
  mockReviews.forEach((review) => reviewsById.set(review.id, review));

  const storedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!storedReviews) return Array.from(reviewsById.values());

  try {
    const parsedReviews = JSON.parse(storedReviews);
    if (!Array.isArray(parsedReviews)) return Array.from(reviewsById.values());

    parsedReviews.forEach((review) => {
      if (review && typeof review.id === "string") {
        reviewsById.set(review.id, review);
      }
    });
  } catch {
    return Array.from(reviewsById.values());
  }

  return Array.from(reviewsById.values());
};

const formatReviewDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getPersonalDataStorageKey = (userId: string) =>
  `${STORAGE_KEY}:${userId}`;

const ProfilePersonalData: React.FC = () => {
  const { user, login } = useAuth();

  const [form, setForm] = useState<PersonalData>({
    fullName: user?.fullName || "",
    passport: "",
    phone: "",
    email: user?.email || "",
    about: user?.about || "",
    avatarUrl: user?.avatarUrl,
  });

  const [cars, setCars] = useState<Car[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [carForm, setCarForm] = useState({
    brand: "",
    model: "",
    color: "",
    plate: "",
  });

  // показывать ли форму добавления машины
  const [isCarFormOpen, setIsCarFormOpen] = useState(false);

  const userReviews = reviews
    .filter((review) => review.targetUserId === user?.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // загрузка сохранённых личных данных
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const stored =
      localStorage.getItem(getPersonalDataStorageKey(user.id)) ??
      localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PersonalData;
        setForm((prev) => ({
          ...prev,
          ...parsed,
          fullName: parsed.fullName || user.fullName,
          email: parsed.email || user.email,
          about: parsed.about || user.about || "",
          avatarUrl: parsed.avatarUrl || user.avatarUrl,
        }));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        about: user.about || "",
        avatarUrl: user.avatarUrl,
      }));
    }

    setUsers(readUsers());
    setReviews(readReviews());
    setIsLoading(false);
  }, [user]);

  // загрузка машин текущего пользователя
  useEffect(() => {
    if (!user) return;

    const stored = localStorage.getItem(CARS_STORAGE_KEY);
    if (!stored) {
      setCars([]);
      return;
    }

    try {
      const allCars = JSON.parse(stored) as Car[];
      setCars(allCars.filter((c) => c.ownerId === user.id));
    } catch {
      setCars([]);
    }
  }, [user]);

  if (!user) {
    return <p>Для просмотра личных данных нужно войти в аккаунт.</p>;
  }

  const handleChange = (field: keyof PersonalData, value: string) => {
    if (!isEditing) return;

    setStatusMessage("");
    setErrorMessage("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (file: File | null) => {
    if (!isEditing) return;

    setStatusMessage("");
    setErrorMessage("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Выберите файл изображения.");
      return;
    }

    if (file.size > AVATAR_MAX_SIZE) {
      setErrorMessage("Размер изображения должен быть не больше 2 МБ.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.onerror = () => {
      setErrorMessage("Не удалось загрузить изображение для предпросмотра.");
    };
    reader.readAsDataURL(file);
  };

  const handleCarChange = (field: keyof typeof carForm, value: string) => {
    if (!isEditing) return;

    setCarForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCar = (e: FormEvent) => {
    e.preventDefault();
    if (!user || !isEditing) return;

    if (!carForm.brand.trim() || !carForm.model.trim()) {
      alert("Марка и модель обязательны.");
      return;
    }

    const newCar: Car = {
      id: Date.now().toString(),
      ownerId: user.id,
      brand: carForm.brand.trim(),
      model: carForm.model.trim(),
      color: carForm.color.trim() || undefined,
      plate: carForm.plate.trim() || undefined,
    };

    const stored = localStorage.getItem(CARS_STORAGE_KEY);
    let allCars: Car[] = [];
    if (stored) {
      try {
        allCars = JSON.parse(stored) as Car[];
      } catch {
        allCars = [];
      }
    }

    const updatedAllCars = [...allCars, newCar];
    localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(updatedAllCars));

    setCars((prev) => [...prev, newCar]);

    setCarForm({
      brand: "",
      model: "",
      color: "",
      plate: "",
    });

    // после добавления можно сразу скрыть форму
    setIsCarFormOpen(false);
  };

  const handleDeleteCar = (carId: string) => {
    if (!user || !isEditing) return;

    // удаляем из локального списка пользователя
    const updatedUserCars = cars.filter((c) => c.id !== carId);
    setCars(updatedUserCars);

    // обновляем общий список в localStorage
    const stored = localStorage.getItem(CARS_STORAGE_KEY);
    let allCars: Car[] = [];
    if (stored) {
      try {
        allCars = JSON.parse(stored) as Car[];
      } catch {
        allCars = [];
      }
    }

    const updatedAllCars = allCars.filter((c) => c.id !== carId);
    localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(updatedAllCars));
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsSaving(true);

    try {
      localStorage.setItem(
        getPersonalDataStorageKey(user.id),
        JSON.stringify(form),
      );

      const updatedUser: User = {
        ...user,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        about: form.about.trim() || undefined,
        avatarUrl: form.avatarUrl,
      };

      login(updatedUser);
      setStatusMessage("Изменения сохранены.");
      setIsEditing(false);
    } catch {
      setErrorMessage("Не удалось сохранить данные. Попробуйте ещё раз.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="profile-datacontent profile-datacontent--flat">
        <section className="profile-card personal-data-loading">
          <div className="personal-data-skeleton personal-data-skeleton--avatar" />
          <div className="personal-data-loading-lines">
            <div className="personal-data-skeleton" />
            <div className="personal-data-skeleton personal-data-skeleton--short" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`profile-datacontent profile-datacontent--flat${
        isEditing ? " profile-datacontent--editing" : ""
      }`}
    >
      {/* Блок личных данных */}
      <section className="profile-card">
        <form onSubmit={handleSubmit} className="personal-data-form">
          <h1 className="support-title">Личные данные</h1>

          <div className="profile-avatar-editor">
            <div className="profile-avatar-preview">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt={form.fullName || "Аватар"} />
              ) : (
                <People aria-hidden="true" />
              )}
            </div>
            <div className="profile-avatar-actions">
              <label
                className={`avatar-upload-button${
                  !isEditing || isSaving
                    ? " avatar-upload-button--disabled"
                    : ""
                }`}
              >
                <EditIcon aria-hidden="true" />
                Изменить аватар
                <input
                  type="file"
                  accept="image/*"
                  disabled={!isEditing || isSaving}
                  onChange={(e) =>
                    handleAvatarChange(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              <p className="hint-text">
                Можно выбрать изображение до 2 МБ. Пока серверной загрузки нет,
                аватар сохраняется локально вместе с профилем.
              </p>
            </div>
          </div>

          <div className="form-row">
            <label className="form-field">
              Имя
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                disabled={!isEditing || isSaving}
                required
              />
            </label>
          </div>

          <div className="form-row form-row_2">
            <label className="form-field">
              Номер телефона
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+7"
                disabled={!isEditing || isSaving}
              />
            </label>

            <label className="form-field">
              Электронная почта
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!isEditing || isSaving}
                required
              />
            </label>
          </div>

          <label className="form-field">
            О себе
            <textarea
              value={form.about}
              onChange={(e) =>
                handleChange("about", e.target.value.slice(0, ABOUT_MAX_LENGTH))
              }
              maxLength={ABOUT_MAX_LENGTH}
              rows={5}
              placeholder="Расскажите коротко о себе, стиле поездок или важных деталях для попутчиков."
              disabled={!isEditing || isSaving}
            />
            <span className="field-counter">
              {form.about.length}/{ABOUT_MAX_LENGTH}
            </span>
          </label>

          <p className="hint-text">
            Контактные данные используются для связи между водителем
            и пассажиром, а также для уведомлений сервиса.
          </p>
        </form>
      </section>

      {/* Регион для поиска */}
      <section className="profile-card">
        <form onSubmit={handleSubmit} className="personal-data-form">
          <h2 className="profile-card__title">Регион для поиска</h2>

          <div className="form-row">
            <label className="form-field">
              Город/населённый пункт
              <input
                type="text"
                placeholder="Город/населённый пункт"
                disabled={!isEditing || isSaving}
              />
            </label>
          </div>
        </form>
      </section>

      {/* Документы (паспорт) */}
      <section className="profile-card">
        <form onSubmit={handleSubmit} className="personal-data-form">
          <h2 className="profile-card__title">Документы</h2>
          <p className="profile-card__subtitle">Данные паспорта РФ</p>

          <div className="form-row form-row_3">
            <label className="form-field">
              Фамилия
              <input type="text" disabled={!isEditing || isSaving} />
            </label>

            <label className="form-field">
              Имя
              <input type="text" disabled={!isEditing || isSaving} />
            </label>

            <label className="form-field">
              Отчество
              <input type="text" disabled={!isEditing || isSaving} />
            </label>
          </div>

          <div className="form-row form-row_2">
            <label className="form-field">
              Дата рождения
              <input type="date" disabled={!isEditing || isSaving} />
            </label>

            <label className="form-field">
              Серия и номер
              <input
                type="text"
                value={form.passport}
                onChange={(e) => handleChange("passport", e.target.value)}
                placeholder="0000 000000"
                disabled={!isEditing || isSaving}
              />
            </label>
          </div>

          <p className="hint-text">
            Паспортные данные используются только для проверки личности
            и не отображаются другим пользователям сервиса.
          </p>
        </form>
      </section>

      {/* Мои машины */}
      <section className="profile-card">
        <h2 className="profile-card__title">Мои машины</h2>

        {cars.length > 0 && (
          <ul className="cars-list">
            {cars.map((car) => (
              <li key={car.id} className="cars-list__item">
                <span className="cars-list__text">
                  {car.brand} {car.model}
                  {car.color ? `, цвет: ${car.color}` : ""}
                  {car.plate ? `, номер: ${car.plate}` : ""}
                </span>
                <button
                  type="button"
                  className="car-delete-button"
                  onClick={() => handleDeleteCar(car.id)}
                  disabled={!isEditing || isSaving}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="hint-text">
          Информация об автомобиле и его номере отображается пассажиру для
          идентификации машины при поездке.
        </p>

        {!isCarFormOpen ? (
          <button
            type="button"
            className="primary-outline-button"
            onClick={() => setIsCarFormOpen(true)}
            disabled={!isEditing || isSaving}
          >
            Добавить машину
          </button>
        ) : (
          <form className="car-form" onSubmit={handleAddCar}>
            <div className="form-row form-row_2">
              <label className="form-field">
                Марка
                <input
                  type="text"
                  placeholder="Lada"
                  value={carForm.brand}
                  onChange={(e) => handleCarChange("brand", e.target.value)}
                  disabled={!isEditing || isSaving}
                  required
                />
              </label>

              <label className="form-field">
                Модель
                <input
                  type="text"
                  placeholder="Kalina"
                  value={carForm.model}
                  onChange={(e) => handleCarChange("model", e.target.value)}
                  disabled={!isEditing || isSaving}
                  required
                />
              </label>
            </div>
            <div className="form-row form-row_2">
              <label className="form-field">
                Цвет
                <input
                  type="text"
                  placeholder="Серый"
                  value={carForm.color}
                  onChange={(e) => handleCarChange("color", e.target.value)}
                  disabled={!isEditing || isSaving}
                />
              </label>
              <label className="form-field">
                Госномер
                <input
                  type="text"
                  placeholder="2ОРУ67"
                  value={carForm.plate}
                  onChange={(e) => handleCarChange("plate", e.target.value)}
                  disabled={!isEditing || isSaving}
                />
              </label>
            </div>

            <p className="hint-text">
              Загружая данные об автомобиле, вы подтверждаете, что являетесь его
              владельцем или имеете право использовать его для поездок в
              сервисе.
            </p>

            <div className="car-form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={!isEditing || isSaving}
              >
                Сохранить машину
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsCarFormOpen(false)}
                disabled={!isEditing || isSaving}
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="profile-card personal-reviews-card">
        <div className="personal-section-heading">
          <MessageIcon aria-hidden="true" />
          <h2 className="profile-card__title">Отзывы</h2>
        </div>

        {userReviews.length === 0 ? (
          <div className="personal-empty-state">У вас пока нет отзывов.</div>
        ) : (
          <div className="personal-reviews-list">
            {userReviews.map((review) => {
              const author = users.find((item) => item.id === review.authorId);

              return (
                <article className="personal-review-card" key={review.id}>
                  <div className="personal-review-header">
                    {author ? (
                      <Link
                        to={`/user/${author.id}`}
                        className="personal-review-author"
                      >
                        <span className="personal-review-avatar">
                          {author.avatarUrl ? (
                            <img src={author.avatarUrl} alt={author.fullName} />
                          ) : (
                            <People aria-hidden="true" />
                          )}
                        </span>
                        <span>{author.fullName}</span>
                      </Link>
                    ) : (
                      <div className="personal-review-author">
                        <span className="personal-review-avatar">
                          <People aria-hidden="true" />
                        </span>
                        <span>Пользователь удален</span>
                      </div>
                    )}

                    <span className="personal-review-rating">
                      <StarFilledIcon aria-hidden="true" />
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <p>{review.text}</p>
                  <time dateTime={review.createdAt}>
                    <CalendarIcon aria-hidden="true" />
                    {formatReviewDate(review.createdAt)}
                  </time>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Общая кнопка сохранить всё */}
      <div className="profile-footer">
        {statusMessage && (
          <div className="profile-save-message profile-save-message--success">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="profile-save-message profile-save-message--error">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          onClick={handleSubmit}
          className="primary-button"
          disabled={isSaving}
        >
          {!isEditing && <EditIcon aria-hidden="true" />}
          {!isEditing ? "Изменить" : isSaving ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </main>
  );
};

export default ProfilePersonalData;
