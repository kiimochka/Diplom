import React, { useState, useEffect } from "react";
import SearchForm from "../components/SearchForm";
import { TRIPS_STORAGE_KEY, Trip, User } from "../types";
import { Link } from "react-router-dom";

const mockDriver: User = {
  id: "1",
  fullName: "Иван Петров",
  email: "ivan@example.com",
  rating: 4.8,
  carName: "Skoda Octavia",
};

const mockTrips: Trip[] = [
  {
    id: "trip1",
    fromCity: "Барнаул",
    toCity: "Новосибирск",
    date: "2026-02-20",
    departureTime: "08:00",
    arrivalTime: "12:00",
    driver: mockDriver,
    pricePerSeat: 800,
    freeSeats: 3,
  },
  // при желании добавь ещё поездки
];

const HomePage: React.FC = () => {
  // ВОТ ЗДЕСЬ твой код состояния и useEffect
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (stored) {
      try {
        const trips = JSON.parse(stored) as Trip[];
        setAllTrips(trips);
        return;
      } catch {
        // если что-то сломано — перезаписываем
      }
    }

    // если ничего нет — кладём начальные мок-данные
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(mockTrips));
    setAllTrips(mockTrips);
  }, []);

  const handleSearch = (params: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  }) => {
    const { from, to } = params;

    const results = allTrips.filter((trip: Trip) => {
      const matchesFrom =
        !from || trip.fromCity.toLowerCase().includes(from.toLowerCase());
      const matchesTo =
        !to || trip.toCity.toLowerCase().includes(to.toLowerCase());
      return matchesFrom && matchesTo;
    });

    setFilteredTrips(results);
  };

  return (
    <div className="home-page">
      {/* Блок поиска */}
      <section className="home-search">
        <h1>Найдите попутку или грузоперевозку</h1>
        <SearchForm onSearch={handleSearch} />
      </section>

      {/* Результаты поиска под формой, только если что-то найдено */}
      {filteredTrips.length > 0 && (
        <section className="home-results">
          <h2>Найденные поездки</h2>
          <div className="results-list">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-time">{trip.departureTime}</div>
                <div className="trip-route">
                  {trip.fromCity} → {trip.toCity}
                </div>
                <div className="trip-driver">
                  {trip.driver.fullName} · {trip.driver.carName}
                </div>
                <div className="trip-price">{trip.pricePerSeat} ₽ за место</div>
                <div className="trip-seats">
                  Свободных мест: {trip.freeSeats}
                </div>
                <Link to={`/trip/${trip.id}`}>Подробнее</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Популярные маршруты */}
      <section className="home-popular-routes">
        <h2>Популярные маршруты</h2>
        {/* позже вставишь реальные карточки по Figma */}
      </section>

      {/* Скорые события */}
      <section className="home-events">
        <h2>Скорые события</h2>
        {/* позже вставишь события: концерты, театр, спорт */}
      </section>
    </div>
  );
};

export default HomePage;
