import React, { useEffect, useState } from "react";
import {
  Trip,
  Booking,
  BookingStatus,
  BOOKINGS_STORAGE_KEY,
} from "../../types";
import { useAuth } from "../../context/AuthContext";
import TripCard from "../TripCard";
import "../../styles/triphistory.css";
import CargoTripCard from "../CargoTripCard";
import { readTrips } from "../../utils/tripsStorage";

type BookedTripItem = {
  trip: Trip;
  bookingStatus: BookingStatus;
};

const ProfileHistory: React.FC = () => {
  const { user } = useAuth();
  console.log("ProfilePage: current user", user);
  const [myCreatedTrips, setMyCreatedTrips] = useState<Trip[]>([]);
  const [myBookedTrips, setMyBookedTrips] = useState<BookedTripItem[]>([]);

  useEffect(() => {
    if (!user) return;

    console.log("ProfileHistory: user.id =", user.id);

    const trips = readTrips();

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

    const bookedTrips: BookedTripItem[] = myBookings
      .map((booking) => {
        const trip = trips.find((t) => t.id === booking.tripId);
        if (!trip) return null;

        return {
          trip,
          bookingStatus: booking.status ?? "pending",
        };
      })
      .filter((item): item is BookedTripItem => Boolean(item));

    console.log("ProfileHistory: booked trips =", bookedTrips);
    setMyBookedTrips(bookedTrips);
  }, [user]);

  if (!user) {
    return <p>Для просмотра истории нужно войти в профиль.</p>;
  }

  return (
    <div className="profile-history">
      <h1 className="support-title">История поездок</h1>

      {/* Созданные мной */}
      <section className="history-section">
        <h3>Созданные мной поездки</h3>
        <div className="history-trips-list">
          {myCreatedTrips.map((trip) =>
            trip.type === "cargo" ? (
              <CargoTripCard
                key={trip.id}
                id={trip.id}
                date={trip.date}
                departureTime={trip.departureTime}
                fromCity={trip.fromCity}
                toCity={trip.toCity}
                carTitle={trip.driver.carName ?? "Автомобиль"}
                cargoTypes={trip.cargoTypes ?? []}
                cargoLength={trip.cargoLength}
                cargoHeight={trip.cargoHeight}
                cargoWidth={trip.cargoWidth}
                cargoWeight={trip.cargoWeight}
                cargoVehicleType={trip.cargoVehicleType}
                cargoServices={trip.cargoServices}
                pricePerCar={trip.pricePerCar ?? trip.pricePerSeat}
              />
            ) : (
              <TripCard
                key={trip.id}
                id={trip.id}
                time={trip.departureTime}
                date={trip.date}
                fromCity={trip.fromCity}
                toCity={trip.toCity}
                driverName={trip.driver.fullName}
                carName={trip.driver.carName}
                price={trip.pricePerSeat}
                seatsLeft={trip.freeSeats}
                context="history-driver"
              />
            ),
          )}
        </div>
      </section>

      <section className="history-section">
        <h3>Мои бронирования</h3>
        {myBookedTrips.length === 0 && <p>Вы ещё не бронировали поездок.</p>}
        <div className="history-trips-list">
          {myBookedTrips.map(({ trip, bookingStatus }) =>
            trip.type === "cargo" ? (
              <CargoTripCard
                key={trip.id}
                id={trip.id}
                date={trip.date}
                departureTime={trip.departureTime}
                fromCity={trip.fromCity}
                toCity={trip.toCity}
                carTitle={trip.driver.carName ?? "Автомобиль"}
                cargoTypes={trip.cargoTypes ?? []}
                cargoLength={trip.cargoLength}
                cargoHeight={trip.cargoHeight}
                cargoWidth={trip.cargoWidth}
                cargoWeight={trip.cargoWeight}
                cargoVehicleType={trip.cargoVehicleType}
                cargoServices={trip.cargoServices}
                pricePerCar={trip.pricePerCar ?? trip.pricePerSeat}
                bookingStatus={bookingStatus}
              />
            ) : (
              <TripCard
                key={trip.id}
                id={trip.id}
                time={trip.departureTime}
                date={trip.date}
                fromCity={trip.fromCity}
                toCity={trip.toCity}
                driverName={trip.driver.fullName}
                carName={trip.driver.carName}
                price={trip.pricePerSeat}
                seatsLeft={trip.freeSeats}
                context="history-passenger"
                bookingStatus={bookingStatus}
              />
            ),
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileHistory;
