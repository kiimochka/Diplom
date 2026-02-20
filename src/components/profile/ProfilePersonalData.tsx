import React, { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, CARS_STORAGE_KEY, Car } from "../../types";

interface PersonalData {
  fullName: string;
  passport: string;
  phone: string;
  email: string;
}

const STORAGE_KEY = "rideshare-personal-data";

const ProfilePersonalData: React.FC = () => {
  const { user, login } = useAuth();

  const [form, setForm] = useState<PersonalData>({
    fullName: user?.fullName || "",
    passport: "",
    phone: "",
    email: user?.email || "",
  });

  const [cars, setCars] = useState<Car[]>([]);
  const [carForm, setCarForm] = useState({
    brand: "",
    model: "",
    color: "",
    plate: "",
  });

  // показывать ли форму добавления машины
  const [isCarFormOpen, setIsCarFormOpen] = useState(false);

  // загрузка сохранённых личных данных
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: PersonalData = JSON.parse(stored);
        setForm((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

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
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCarChange = (field: keyof typeof carForm, value: string) => {
    setCarForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCar = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
    localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(updatedAllCars)); // [web:116][web:188]

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));

    const updatedUser: User = {
      ...user,
      fullName: form.fullName,
      email: form.email,
    };
    login(updatedUser);
    alert("Личные данные сохранены");
  };

  return (
    <div className="profile-personal-data">
      <h2>Личные данные</h2>

      <form onSubmit={handleSubmit} className="personal-data-form">
        <label>
          ФИО
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
        </label>

        <label>
          Паспорт (серия и номер)
          <input
            type="text"
            value={form.passport}
            onChange={(e) => handleChange("passport", e.target.value)}
            placeholder="0000 000000"
          />
        </label>

        <label>
          Телефон
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+7"
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </label>

        <button type="submit">Сохранить</button>
      </form>

      {/* Мои машины */}
      <section className="profile-cars">
        <h3>Мои машины</h3>

        {cars.length > 0 && (
          <ul className="cars-list">
            {cars.map((car) => (
              <li key={car.id}>
                {car.brand} {car.model}
                {car.color ? `, цвет: ${car.color}` : ""}
                {car.plate ? `, номер: ${car.plate}` : ""}
              </li>
            ))}
          </ul>
        )}

        {/* Кнопка показать/скрыть форму */}
        {!isCarFormOpen ? (
          <button type="button" onClick={() => setIsCarFormOpen(true)}>
            Добавить машину
          </button>
        ) : (
          <form className="car-form" onSubmit={handleAddCar}>
            <h4>Добавить машину</h4>
            <input
              type="text"
              placeholder="Марка"
              value={carForm.brand}
              onChange={(e) => handleCarChange("brand", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Модель"
              value={carForm.model}
              onChange={(e) => handleCarChange("model", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Цвет (необязательно)"
              value={carForm.color}
              onChange={(e) => handleCarChange("color", e.target.value)}
            />
            <input
              type="text"
              placeholder="Госномер (необязательно)"
              value={carForm.plate}
              onChange={(e) => handleCarChange("plate", e.target.value)}
            />

            <div className="car-form-actions">
              <button type="submit">Сохранить машину</button>
              <button type="button" onClick={() => setIsCarFormOpen(false)}>
                Отмена
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProfilePersonalData;
