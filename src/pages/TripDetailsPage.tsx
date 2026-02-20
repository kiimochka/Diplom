import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Trip,
  User,
  TRIPS_STORAGE_KEY,
  BOOKINGS_STORAGE_KEY,
  Booking,
} from "../types";

const mockDriver: User = {
  id: "1",
  fullName: "Иван Петров",
  email: "ivan@example.com",
  rating: 4.8,
  carName: "Toyota Camry",
};

const mockTrip: Trip = {
  id: "trip1",
  fromCity: "Барнаул",
  toCity: "Новосибирск",
  date: "2026-02-20",
  departureTime: "08:00",
  arrivalTime: "12:00",
  driver: mockDriver,
  pricePerSeat: 800,
  freeSeats: 3,
};

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [seatsToBook, setSeatsToBook] = useState<number>(1);

  useEffect(() => {
    // В MVP: если есть сохранённые поездки — ищем по id, иначе используем mockTrip
    const stored = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (stored) {
      try {
        const trips = JSON.parse(stored) as Trip[];
        const found = trips.find((t) => t.id === id);
        if (found) {
          setTrip(found);
          return;
        } else {
          // если нет поездки с таким id — добавим mockTrip
          const updated = [...trips, mockTrip];
          localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updated));
          setTrip(mockTrip);
          return;
        }
      } catch {
        // игнорируем и упадём на mockTrip
      }
    }
    // если ничего не нашли — используем макетную поездку
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify([mockTrip]));
    setTrip(mockTrip);
  }, [id]);

  if (!trip) {
    return <div>Загрузка деталей поездки...</div>;
  }

  const formattedDate = "Пятница, 20 февраля 2026";

  const handleBook = () => {
    if (!user) {
      alert("Для бронирования необходимо войти в профиль.");
      return;
    }

    if (seatsToBook < 1) {
      alert("Количество мест должно быть не меньше 1.");
      return;
    }

    if (trip.freeSeats < seatsToBook) {
      alert("Недостаточно свободных мест.");
      return;
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      tripId: trip.id,
      userId: user.id,
      seats: seatsToBook,
      createdAt: new Date().toISOString(),
    };

    // бронирования
    const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    let bookings: Booking[] = [];
    if (storedBookings) {
      try {
        bookings = JSON.parse(storedBookings) as Booking[];
      } catch {
        bookings = [];
      }
    }
    const updatedBookings = [...bookings, newBooking];
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));

    // обновляем поездку в списке всех поездок
    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (storedTrips) {
      try {
        const trips = JSON.parse(storedTrips) as Trip[];
        const updatedTrips = trips.map((t) =>
          t.id === trip.id ? { ...t, freeSeats: t.freeSeats - seatsToBook } : t,
        );
        localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
      } catch {
        // можно проигнорировать в MVP
      }
    }

    // обновляем локальное состояние
    setTrip((prev) =>
      prev
        ? {
            ...prev,
            freeSeats: prev.freeSeats - seatsToBook,
          }
        : prev,
    );

    alert("Места забронированы (MVP).");
  };

  return (
    <div className="trip-details-page">
      <div className="trip-details-main">
        <h1>Детали поездки</h1>

        <section className="trip-details-header">
          <div className="trip-details-date">{formattedDate}</div>
          <div className="trip-details-time">
            Отъезд: {trip.departureTime} · Прибытие: {trip.arrivalTime}
          </div>
          <div className="trip-details-route">
            {trip.fromCity} → {trip.toCity}
          </div>
        </section>

        <section className="trip-details-driver">
          <h2>Водитель</h2>
          <div className="driver-name">
            {trip.driver.fullName} · {trip.driver.carName}
          </div>
          <div className="driver-rating">
            Рейтинг: {trip.driver.rating ?? "—"}
          </div>
          <button>Перейти в профиль</button>
        </section>

        <section className="trip-details-comment">
          <h2>Комментарий водителя</h2>
          <p>
            Еду с сыном, багаж поместится в багажник, животных беру, но без
            крупных собак. Курение только на остановках.
          </p>
        </section>

        <section className="trip-details-vehicle">
          <h2>Автомобиль и удобства</h2>
          <ul>
            <li>Модель: {trip.driver.carName}</li>
            <li>Можно с детьми</li>
            <li>Можно с животными</li>
            <li>Курение только на остановках</li>
          </ul>
        </section>

        <section className="trip-details-passengers">
          <h2>Пассажиры</h2>
          <ul>
            <li>
              Анна · рейтинг 5.0 · <button>Профиль и отзывы</button>
            </li>
            <li>
              Сергей · рейтинг 4.7 · <button>Профиль и отзывы</button>
            </li>
          </ul>
        </section>

        <section className="trip-details-chat">
          <button>Написать водителю</button>
        </section>
      </div>

      <aside className="trip-details-sidebar">
        <div className="trip-summary">
          <div>{formattedDate}</div>
          <div>
            {trip.fromCity} → {trip.toCity}
          </div>
          <div>Водитель: {trip.driver.fullName}</div>

          <div className="trip-summary-price">
            {trip.pricePerSeat} ₽ за место
          </div>

          <div className="trip-summary-seats">
            Свободных мест: {trip.freeSeats}
          </div>

          <label>
            Количество мест:
            <select
              value={seatsToBook}
              onChange={(e) => setSeatsToBook(Number(e.target.value))}
              disabled={trip.freeSeats <= 0}
            >
              {Array.from(
                { length: Math.min(trip.freeSeats, 3) },
                (_, index) => {
                  const value = index + 1;
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                },
              )}
            </select>
          </label>

          <button
            className="trip-summary-book-button"
            onClick={handleBook}
            disabled={trip.freeSeats <= 0}
          >
            {trip.freeSeats > 0 ? "Забронировать" : "Мест нет"}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default TripDetailsPage;
