import React, { ReactNode, useEffect, useMemo, useState } from "react";
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
import { Arrow } from "../../icons/IconsIndex";

type BookedTripItem = {
  bookingId: string;
  trip: Trip;
  bookingStatus: BookingStatus;
};

type HistoryGroupProps = {
  title: string;
  count: number;
  emptyText: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

const completedBookingStatuses: BookingStatus[] = [
  "rejected",
  "cancelled_by_driver",
  "cancelled_by_passenger",
  "trip_cancelled",
];

const isTripCompleted = (trip: Trip) => {
  if (trip.status === "archived" || trip.status === "cancelled") {
    return true;
  }

  const tripEndDate = new Date(`${trip.date}T${trip.arrivalTime || "23:59"}`);
  if (Number.isNaN(tripEndDate.getTime())) {
    return false;
  }

  return tripEndDate < new Date();
};

const HistoryGroup: React.FC<HistoryGroupProps> = ({
  title,
  count,
  emptyText,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <div className="history-group">
      <button
        type="button"
        className="history-group-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className="history-group-meta">
          {count}
          <span
            className={
              "history-group-chevron" +
              (isOpen ? " history-group-chevron--open" : "")
            }
            aria-hidden="true"
          >
            <Arrow />
          </span>
        </span>
      </button>

      {isOpen && (
        <div className="history-group-content">
          {count === 0 ? <p className="history-empty">{emptyText}</p> : children}
        </div>
      )}
    </div>
  );
};

const ProfileHistory: React.FC = () => {
  const { user } = useAuth();
  const [myCreatedTrips, setMyCreatedTrips] = useState<Trip[]>([]);
  const [myBookedTrips, setMyBookedTrips] = useState<BookedTripItem[]>([]);

  useEffect(() => {
    if (!user) return;

    const trips = readTrips();

    const created = trips.filter((trip) => trip.driver.id === user.id);
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
          bookingId: booking.id,
          trip,
          bookingStatus: booking.status ?? "pending",
        };
      })
      .filter((item): item is BookedTripItem => Boolean(item));

    setMyBookedTrips(bookedTrips);
  }, [user]);

  const createdGroups = useMemo(() => {
    const activeTrips = myCreatedTrips.filter((trip) => !isTripCompleted(trip));

    return {
      passenger: activeTrips.filter((trip) => trip.type === "passenger"),
      cargo: activeTrips.filter((trip) => trip.type === "cargo"),
      completed: myCreatedTrips.filter(isTripCompleted),
    };
  }, [myCreatedTrips]);

  const bookedGroups = useMemo(() => {
    const isCompletedBooking = (item: BookedTripItem) =>
      isTripCompleted(item.trip) ||
      completedBookingStatuses.includes(item.bookingStatus);

    const activeBookings = myBookedTrips.filter(
      (item) => !isCompletedBooking(item),
    );

    return {
      passenger: activeBookings.filter((item) => item.trip.type === "passenger"),
      cargo: activeBookings.filter((item) => item.trip.type === "cargo"),
      completed: myBookedTrips.filter(isCompletedBooking),
    };
  }, [myBookedTrips]);

  if (!user) {
    return <p>Для просмотра истории нужно войти в профиль.</p>;
  }

  const renderTrip = (trip: Trip, bookingStatus?: BookingStatus) =>
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
        context={bookingStatus ? "history-passenger" : "history-driver"}
        bookingStatus={bookingStatus}
      />
    );

  const renderCreatedList = (trips: Trip[]) => (
    <div className="history-trips-list">{trips.map((trip) => renderTrip(trip))}</div>
  );

  const renderBookedList = (items: BookedTripItem[]) => (
    <div className="history-trips-list">
      {items.map(({ bookingId, trip, bookingStatus }) => (
        <React.Fragment key={bookingId}>
          {renderTrip(trip, bookingStatus)}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="profile-history">
      <h1 className="support-title">История поездок</h1>

      {/* Созданные мной */}
      <section className="history-section">
        <h3>Созданные мной поездки</h3>
        <HistoryGroup
          title="Пассажирские поездки"
          count={createdGroups.passenger.length}
          emptyText="У вас пока нет созданных пассажирских поездок."
          defaultOpen={createdGroups.passenger.length > 0}
        >
          {renderCreatedList(createdGroups.passenger)}
        </HistoryGroup>
        <HistoryGroup
          title="Грузовые поездки"
          count={createdGroups.cargo.length}
          emptyText="У вас пока нет созданных грузовых поездок."
        >
          {renderCreatedList(createdGroups.cargo)}
        </HistoryGroup>
        <HistoryGroup
          title="Завершенные поездки"
          count={createdGroups.completed.length}
          emptyText="Завершенных созданных поездок пока нет."
        >
          {renderCreatedList(createdGroups.completed)}
        </HistoryGroup>
      </section>

      <section className="history-section">
        <h3>Мои бронирования</h3>
        <HistoryGroup
          title="Пассажирские бронирования"
          count={bookedGroups.passenger.length}
          emptyText="У вас пока нет пассажирских бронирований."
          defaultOpen={bookedGroups.passenger.length > 0}
        >
          {renderBookedList(bookedGroups.passenger)}
        </HistoryGroup>
        <HistoryGroup
          title="Грузовые бронирования"
          count={bookedGroups.cargo.length}
          emptyText="У вас пока нет грузовых бронирований."
        >
          {renderBookedList(bookedGroups.cargo)}
        </HistoryGroup>
        <HistoryGroup
          title="Завершенные бронирования"
          count={bookedGroups.completed.length}
          emptyText="Завершенных бронирований пока нет."
        >
          {renderBookedList(bookedGroups.completed)}
        </HistoryGroup>
      </section>
    </div>
  );
};

export default ProfileHistory;
