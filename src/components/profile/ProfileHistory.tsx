import React, { useEffect, useState } from "react";
import {
  Trip,
  TRIPS_STORAGE_KEY,
  Booking,
  BOOKINGS_STORAGE_KEY,
} from "../../types";
import { useAuth } from "../../context/AuthContext";

const ProfileHistory: React.FC = () => {
  const { user } = useAuth();
  console.log("ProfilePage: current user", user);
  const [myCreatedTrips, setMyCreatedTrips] = useState<Trip[]>([]);
  const [myBookedTrips, setMyBookedTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!user) return;

    console.log("ProfileHistory: user.id =", user.id);

    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    let trips: Trip[] = [];
    if (storedTrips) {
      try {
        trips = JSON.parse(storedTrips) as Trip[];
      } catch {
        trips = [];
      }
    }

    console.log("ProfileHistory: trips =", trips);

    const created = trips.filter((trip) => trip.driver.id === user.id);
    console.log("ProfileHistory: created trips =", created);
    setMyCreatedTrips(created);

    const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    let bookings: Booking[] = [];
    if (storedBookings) {
      try {
        bookings = JSON.parse(storedBookings) as Booking[];
      } catch {
        bookings = [];
      }
    }

    const myBookings = bookings.filter((b) => b.userId === user.id);

    const bookedTrips: Trip[] = myBookings
      .map((b) => trips.find((t) => t.id === b.tripId))
      .filter((t): t is Trip => Boolean(t));

    console.log("ProfileHistory: booked trips =", bookedTrips);
    setMyBookedTrips(bookedTrips);
  }, [user?.id]);

  if (!user) {
    return <p>Для просмотра истории нужно войти в профиль.</p>;
  }

  return (
    <div className="profile-history">
      <h2>История поездок</h2>

      {/* Созданные мной */}
      <section className="history-section">
        <h3>Созданные мной поездки</h3>
        {myCreatedTrips.map((trip) => (
          <div key={trip.id} className="history-item">
            <div className="history-item-main">
              <div className="history-route">
                {trip.fromCity} → {trip.toCity}
              </div>
              <div className="history-date">
                {trip.date} · {trip.departureTime}
              </div>
            </div>
            <div className="history-item-meta">
              <span>Роль: водитель</span>
              <span>Цена за место: {trip.pricePerSeat} ₽</span>
              <span>Свободных мест: {trip.freeSeats}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Мои бронирования */}
      <section className="history-section">
        <h3>Мои бронирования</h3>
        {myBookedTrips.length === 0 && <p>Вы ещё не бронировали поездок.</p>}
        {myBookedTrips.map((trip) => (
          <div key={trip.id} className="history-item">
            <div className="history-item-main">
              <div className="history-route">
                {trip.fromCity} → {trip.toCity}
              </div>
              <div className="history-date">
                {trip.date} · {trip.departureTime}
              </div>
            </div>
            <div className="history-item-meta">
              <span>Роль: пассажир</span>
              <span>Цена за место: {trip.pricePerSeat} ₽</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ProfileHistory;
