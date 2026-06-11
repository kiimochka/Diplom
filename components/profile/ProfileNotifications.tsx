import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Booking,
  BOOKINGS_STORAGE_KEY,
  TRIPS_STORAGE_KEY,
  Trip,
  User,
  USERS_STORAGE_KEY,
} from "../../types";
import { mockUsers } from "../../mockData";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { readTrips } from "../../utils/tripsStorage";
import { notifyBookingRequestsChanged } from "../../utils/bookingNotifications";
import { getCurrentReturnPath } from "../../utils/returnTo";

type BookingView = {
  booking: Booking;
  trip: Trip;
  passenger: User | null;
};

type ProfileNotificationsProps = {
  onRequestsChanged?: () => void;
};

const readBookings = (): Booking[] => {
  const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);

  if (!storedBookings) return [];

  try {
    const parsed = JSON.parse(storedBookings);
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch {
    return [];
  }
};

const readUsers = (): User[] => {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);

  if (!storedUsers) return mockUsers;

  try {
    const parsed = JSON.parse(storedUsers);
    return Array.isArray(parsed) ? (parsed as User[]) : mockUsers;
  } catch {
    return mockUsers;
  }
};

const formatTripDate = (date: string) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const getPlaceWord = (n: number) => {
  const value = Math.abs(n) % 100;
  const num = value % 10;

  if (value > 10 && value < 20) return "мест";
  if (num > 1 && num < 5) return "места";
  if (num === 1) return "место";
  return "мест";
};

const cancellationReasons = [
  "изменились планы",
  "сломалась машина",
  "заболел/не могу поехать",
  "пассажир не отвечает",
  "другая причина",
];

const requestCancellationReason = (message: string): string | null => {
  const confirmed = window.confirm(message);
  if (!confirmed) return null;

  const reason = window.prompt(
    `Укажите причину отмены:\n${cancellationReasons
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n")}`,
    cancellationReasons[0],
  );

  if (reason === null) return null;

  return reason.trim() || "другая причина";
};

const getPassengerNotificationTitle = (status: Booking["status"]) => {
  switch (status) {
    case "pending":
      return "Заявка ожидает ответа водителя";
    case "confirmed":
      return "Ваша заявка принята";
    case "rejected":
      return "Ваша заявка отклонена";
    case "cancelled_by_driver":
      return "Водитель отменил вашу бронь";
    case "cancelled_by_passenger":
      return "Вы отказались от поездки";
    case "trip_cancelled":
      return "Водитель отменил поездку";
    default:
      return "Статус заявки обновлен";
  }
};

const ProfileNotifications: React.FC<ProfileNotificationsProps> = ({
  onRequestsChanged,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentReturnPath = getCurrentReturnPath(location);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const refresh = () => {
    setBookings(readBookings());
    setTrips(readTrips());
    setUsers(readUsers());
  };

  useEffect(() => {
    refresh();
  }, []);

  const bookingViews = useMemo<BookingView[]>(() => {
    return bookings
      .map((booking) => {
        const trip = trips.find((item) => item.id === booking.tripId);
        if (!trip) return null;

        return {
          booking,
          trip,
          passenger: users.find((item) => item.id === booking.userId) ?? null,
        };
      })
      .filter((item): item is BookingView => Boolean(item));
  }, [bookings, trips, users]);

  if (!user) {
    return <p>Для просмотра уведомлений нужно войти в профиль.</p>;
  }

  const driverRequests = bookingViews.filter(
    ({ booking, trip }) =>
      trip.driver.id === user.id && booking.status === "pending",
  );
  const driverConfirmedBookings = bookingViews.filter(
    ({ booking, trip }) =>
      trip.driver.id === user.id && booking.status === "confirmed",
  );
  const passengerNotifications = bookingViews.filter(
    ({ booking }) => booking.userId === user.id,
  );

  const updateBookingStatus = (
    bookingToUpdate: Booking,
    status: Booking["status"],
    cancellationReason?: string,
  ) => {
    const allBookings = readBookings();
    const allTrips = readTrips();
    const relatedTrip = allTrips.find(
      (trip) => trip.id === bookingToUpdate.tripId,
    );

    if (!relatedTrip) return;

    if (
      status === "confirmed" &&
      relatedTrip.freeSeats < bookingToUpdate.seats
    ) {
      showToast({
        type: "error",
        title: "Недостаточно мест",
        message: "В поездке уже нет нужного количества свободных мест.",
      });
      return;
    }

    const updatedBookings = allBookings.map((booking) =>
      booking.id === bookingToUpdate.id
        ? {
            ...booking,
            status,
            cancellationReason,
            cancelledAt: cancellationReason
              ? new Date().toISOString()
              : booking.cancelledAt,
          }
        : booking,
    );
    const updatedTrips =
      status === "confirmed"
        ? allTrips.map((trip) =>
            trip.id === bookingToUpdate.tripId
              ? { ...trip, freeSeats: trip.freeSeats - bookingToUpdate.seats }
              : trip,
          )
        : status === "cancelled_by_driver" ||
            status === "cancelled_by_passenger"
          ? allTrips.map((trip) =>
              trip.id === bookingToUpdate.tripId &&
              bookingToUpdate.status === "confirmed"
                ? { ...trip, freeSeats: trip.freeSeats + bookingToUpdate.seats }
                : trip,
            )
          : allTrips;

    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
    setBookings(updatedBookings);
    setTrips(updatedTrips);
    notifyBookingRequestsChanged();
    onRequestsChanged?.();

    showToast({
      type: "success",
      title:
        status === "confirmed"
          ? "Заявка принята"
          : status === "rejected"
            ? "Заявка отклонена"
            : "Бронь отменена",
      message:
        status === "confirmed"
          ? "Пассажир добавлен в поездку."
          : status === "rejected"
            ? "Пассажир получит уведомление об отказе."
            : "Пассажир получит уведомление об отмене.",
    });
  };

  const cancelConfirmedBookingByDriver = (booking: Booking) => {
    const reason = requestCancellationReason(
      "Вы действительно хотите отменить бронь пассажира? Пассажир получит уведомление. Частые отмены могут повлиять на рейтинг.",
    );

    if (!reason) return;

    updateBookingStatus(booking, "cancelled_by_driver", reason);
  };

  const cancelBookingByPassenger = (booking: Booking) => {
    const reason = requestCancellationReason(
      booking.status === "pending"
        ? "Вы действительно хотите отозвать заявку? Водитель больше не увидит ее как новую."
        : "Вы действительно хотите отказаться от поездки? Водитель получит уведомление. Частые отмены могут повлиять на рейтинг.",
    );

    if (!reason) return;

    updateBookingStatus(
      booking,
      booking.status === "pending"
        ? "cancelled_by_passenger"
        : "cancelled_by_passenger",
      reason,
    );
  };

  return (
    <div className="profile-notifications">
      <h1 className="support-title">Уведомления</h1>

      <section className="notifications-section">
        <h3>Заявки на мои поездки</h3>
        {driverRequests.length === 0 && (
          <p className="notifications-empty">Новых заявок пока нет.</p>
        )}

        <div className="notifications-list">
          {driverRequests.map(({ booking, trip, passenger }) => (
            <article className="notification-card" key={booking.id}>
              <div className="notification-card-main">
                <div className="notification-title">
                  {passenger?.fullName ?? "Пассажир"} хочет поехать с вами
                </div>
                <div className="notification-meta">
                  {trip.fromCity} - {trip.toCity}, {formatTripDate(trip.date)} в{" "}
                  {trip.departureTime}
                </div>
                <div className="notification-meta">
                  Запрошено: {booking.seats} {getPlaceWord(booking.seats)}
                </div>
              </div>

              <div className="notification-actions">
                {passenger && (
                  <button
                    type="button"
                    className="notification-secondary-btn"
                    onClick={() =>
                      navigate(`/user/${passenger.id}`, {
                        state: { from: currentReturnPath },
                      })
                    }
                  >
                    Профиль
                  </button>
                )}
                <button
                  type="button"
                  className="notification-secondary-btn"
                  onClick={() => updateBookingStatus(booking, "rejected")}
                >
                  Отклонить
                </button>
                <button
                  type="button"
                  className="notification-primary-btn"
                  onClick={() => updateBookingStatus(booking, "confirmed")}
                >
                  Принять
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="notifications-section">
        <h3>Принятые брони</h3>
        {driverConfirmedBookings.length === 0 && (
          <p className="notifications-empty">
            Подтвержденных пассажиров пока нет.
          </p>
        )}

        <div className="notifications-list">
          {driverConfirmedBookings.map(({ booking, trip, passenger }) => (
            <article
              className="notification-card notification-card--confirmed"
              key={booking.id}
            >
              <div className="notification-card-main">
                <div className="notification-title">
                  {passenger?.fullName ?? "Пассажир"} едет с вами
                </div>
                <div className="notification-meta">
                  {trip.fromCity} - {trip.toCity}, {formatTripDate(trip.date)} в{" "}
                  {trip.departureTime}
                </div>
                <div className="notification-meta">
                  Забронировано: {booking.seats} {getPlaceWord(booking.seats)}
                </div>
              </div>

              <div className="notification-actions">
                {passenger && (
                  <button
                    type="button"
                    className="notification-secondary-btn"
                    onClick={() =>
                      navigate(`/user/${passenger.id}`, {
                        state: { from: currentReturnPath },
                      })
                    }
                  >
                    Профиль
                  </button>
                )}
                <button
                  type="button"
                  className="notification-danger-btn"
                  onClick={() => cancelConfirmedBookingByDriver(booking)}
                >
                  Отменить бронь пассажира
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="notifications-section">
        <h3>Мои заявки</h3>
        {passengerNotifications.length === 0 && (
          <p className="notifications-empty">
            Здесь появятся ваши заявки и ответы водителей.
          </p>
        )}

        <div className="notifications-list">
          {passengerNotifications.map(({ booking, trip }) => (
            <article
              className={`notification-card notification-card--${booking.status}`}
              key={booking.id}
            >
              <div className="notification-card-main">
                <div className="notification-title">
                  {getPassengerNotificationTitle(booking.status)}
                </div>
                <div className="notification-meta">
                  {trip.fromCity} - {trip.toCity}, {formatTripDate(trip.date)} в{" "}
                  {trip.departureTime}
                </div>
                <div className="notification-meta">
                  Водитель: {trip.driver.fullName}
                </div>
                {booking.cancellationReason && (
                  <div className="notification-meta">
                    Причина: {booking.cancellationReason}
                  </div>
                )}
              </div>

              <div className="notification-actions">
                <button
                  type="button"
                  className="notification-secondary-btn"
                  onClick={() =>
                    navigate(`/trip/${trip.id}`, {
                      state: { from: currentReturnPath },
                    })
                  }
                >
                  Поездка
                </button>
                {booking.status === "pending" && (
                  <button
                    type="button"
                    className="notification-danger-btn"
                    onClick={() => cancelBookingByPassenger(booking)}
                  >
                    Отозвать заявку
                  </button>
                )}
                {booking.status === "confirmed" && (
                  <button
                    type="button"
                    className="notification-danger-btn"
                    onClick={() => cancelBookingByPassenger(booking)}
                  >
                    Отказаться от поездки
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfileNotifications;
