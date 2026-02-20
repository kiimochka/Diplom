import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TRIPS_STORAGE_KEY, Trip } from "../types";

interface CreateTripForm {
  fromCity: string;
  toCity: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  pricePerSeat: number;
  freeSeats: number;
  comment: string;
}

const CreateTripPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateTripForm>({
    fromCity: "",
    toCity: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
    pricePerSeat: 0,
    freeSeats: 1,
    comment: "",
  });

  // Промежуточные остановки
  const [stops, setStops] = useState<string[]>([""]);

  // Машина
  interface Car {
    id: string;
    brand: string;
    model: string;
    color?: string;
    plate?: string;
  }

  const [cars] = useState<Car[]>([]); // пока пустой список; позже подставишь реальные машины
  const [selectedCarId, setSelectedCarId] = useState<string>("");

  // Удобства
  const [amenities, setAmenities] = useState({
    childSeat: false,
    petsAllowed: false,
    smokingAllowed: false,
    luggageAllowed: false,
  });

  // если не залогинен — показываем заглушку и выходим
  if (!user) {
    return (
      <div className="create-trip-page">
        <h1>Создать поездку</h1>
        <p>Для создания поездки необходимо войти в личный кабинет.</p>
      </div>
    );
  }

  const handleChange = <K extends keyof CreateTripForm>(
    field: K,
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? Number(value) : value,
    }));
  };

  // ОСТАНОВКИ — ВНЕ handleSubmit
  const handleStopChange = (index: number, value: string) => {
    setStops((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addStop = () => {
    setStops((prev) => [...prev, ""]);
  };

  const removeStop = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  // УДОБСТВА — ВНЕ handleSubmit
  const toggleAmenity = (key: keyof typeof amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Для создания поездки необходимо войти в профиль.");
      return;
    }

    // 1. Города не должны совпадать
    if (
      form.fromCity.trim().toLowerCase() === form.toCity.trim().toLowerCase()
    ) {
      alert("Города отправления и прибытия не могут совпадать.");
      return;
    }

    // 2. Цена > 0
    if (form.pricePerSeat <= 0) {
      alert("Цена за место должна быть больше нуля.");
      return;
    }

    // 3. Количество мест от 1 до 8
    if (form.freeSeats < 1 || form.freeSeats > 8) {
      alert("Количество мест должно быть от 1 до 8.");
      return;
    }

    // 4. Дата не в прошлом
    if (form.date) {
      const tripDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (tripDate < today) {
        alert("Дата поездки не может быть в прошлом.");
        return;
      }
    }

    // 5. Ограничение длины комментария
    if (form.comment.length > 500) {
      alert("Комментарий не должен быть длиннее 500 символов.");
      return;
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      fromCity: form.fromCity,
      toCity: form.toCity,
      stops: stops.map((s) => s.trim()).filter((s) => s !== ""),
      date: form.date,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      carId: selectedCarId || undefined,
      driver: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        rating: user.rating,
        carName: user.carName,
      },
      pricePerSeat: form.pricePerSeat,
      freeSeats: form.freeSeats,
      amenities,
    };

    // читаем уже сохранённые поездки
    const stored = localStorage.getItem(TRIPS_STORAGE_KEY);
    let trips: Trip[] = [];
    if (stored) {
      try {
        trips = JSON.parse(stored) as Trip[];
      } catch {
        trips = [];
      }
    }

    // добавляем новую и сохраняем ОДИН РАЗ
    const updatedTrips = [...trips, newTrip];
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips)); // [web:116]

    alert("Поездка создана (MVP, без отправки на сервер).");
    navigate("/");
  };

  return (
    <div className="create-trip-page">
      <h1>Создать поездку</h1>
      <form className="create-trip-form" onSubmit={handleSubmit}>
        <label>
          Откуда
          <input
            type="text"
            value={form.fromCity}
            onChange={(e) => handleChange("fromCity", e.target.value)}
            required
          />
        </label>

        <label>
          Куда
          <input
            type="text"
            value={form.toCity}
            onChange={(e) => handleChange("toCity", e.target.value)}
            required
          />
        </label>

        {/* Промежуточные остановки */}
        <div className="form-group">
          <label>Промежуточные остановки</label>
          {stops.map((stop, index) => (
            <div key={index} className="stop-row">
              <input
                type="text"
                placeholder={`Остановка ${index + 1}`}
                value={stop}
                onChange={(e) => handleStopChange(index, e.target.value)}
              />
              {stops.length > 1 && (
                <button type="button" onClick={() => removeStop(index)}>
                  Удалить
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addStop}>
            Добавить остановку
          </button>
        </div>

        <label>
          Дата
          <input
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />
        </label>

        <label>
          Время выезда
          <input
            type="time"
            value={form.departureTime}
            onChange={(e) => handleChange("departureTime", e.target.value)}
            required
          />
        </label>

        <label>
          Время прибытия
          <input
            type="time"
            value={form.arrivalTime}
            onChange={(e) => handleChange("arrivalTime", e.target.value)}
          />
        </label>

        {/* Машина */}
        <div className="form-group">
          <label>Машина для поездки</label>
          {cars.length === 0 ? (
            <p>У вас ещё нет добавленных машин.</p>
          ) : (
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
            >
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} {car.color ? `(${car.color})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <label>
          Цена за место (₽)
          <input
            type="number"
            min={0}
            value={form.pricePerSeat}
            onChange={(e) => handleChange("pricePerSeat", e.target.value)}
            required
          />
        </label>

        <label>
          Свободных мест
          <input
            type="number"
            min={1}
            max={8}
            value={form.freeSeats}
            onChange={(e) => handleChange("freeSeats", e.target.value)}
            required
          />
        </label>

        {/* Удобства */}
        <div className="form-group">
          <label>Удобства для пассажиров</label>
          <div className="amenities">
            <label>
              <input
                type="checkbox"
                checked={amenities.childSeat}
                onChange={() => toggleAmenity("childSeat")}
              />
              Есть детское кресло
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.petsAllowed}
                onChange={() => toggleAmenity("petsAllowed")}
              />
              Можно с животными
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.smokingAllowed}
                onChange={() => toggleAmenity("smokingAllowed")}
              />
              Можно курить
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.luggageAllowed}
                onChange={() => toggleAmenity("luggageAllowed")}
              />
              Можно с багажом
            </label>
          </div>
        </div>

        <label>
          Комментарий для пассажиров
          <textarea
            value={form.comment}
            onChange={(e) => handleChange("comment", e.target.value)}
            placeholder="Например: еду с ребёнком, можно с животными, курение только на остановках."
          />
        </label>

        <button type="submit">Опубликовать поездку</button>
      </form>
    </div>
  );
};

export default CreateTripPage;
