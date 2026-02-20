import React from "react";
import { useLocation, Link } from "react-router-dom";
import SearchForm from "../components/SearchForm";
import { Trip, User } from "../types";

// Временные мок-данные
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
];

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResultsPage: React.FC = () => {
  const query = useQuery();
  const from = query.get("from") || "";
  const to = query.get("to") || "";
  const date = query.get("date") || "";
  const passengers = Number(query.get("passengers") || "1");

  // В будущем здесь будет запрос на backend, пока — фильтр по mockTrips
  const trips = mockTrips.filter((trip) => {
    return (
      (!from || trip.fromCity.toLowerCase().includes(from.toLowerCase())) &&
      (!to || trip.toCity.toLowerCase().includes(to.toLowerCase()))
    );
  });

  return (
    <div className="results-page">
      <SearchForm
        initialFromCity={from}
        initialToCity={to}
        initialDate={date}
        initialPassengers={passengers}
      />

      <div className="results-list">
        {trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <div className="trip-time">{trip.departureTime}</div>
            <div className="trip-route">
              {trip.fromCity} → {trip.toCity}
            </div>
            <div className="trip-driver">
              {trip.driver.fullName} · {trip.driver.carName}
            </div>
            <div className="trip-price">{trip.pricePerSeat} ₽ за место</div>
            <div className="trip-seats">Свободных мест: {trip.freeSeats}</div>
            <Link to={`/trip/${trip.id}`}>Подробнее</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
