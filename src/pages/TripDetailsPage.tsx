import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Trip,
  User,
  BOOKINGS_STORAGE_KEY,
  TRIPS_STORAGE_KEY,
  Booking,
  CHATS_STORAGE_KEY,
  Chat,
} from "../types";
import PageHeader from "../components/layout/PageHeader";
import {
  EditIcon,
  KidIcon,
  LuggageIcon,
  PawIcon,
  People,
  SmokingIcon,
  StarFilledIcon,
  MessageIcon,
} from "../icons/IconsIndex";
import { useToast } from "../context/ToastContext";
import { readTrips } from "../utils/tripsStorage";
import { getCurrentReturnPath, getSafeReturnTo } from "../utils/returnTo";
import { notifyBookingRequestsChanged } from "../utils/bookingNotifications";
import { getReviewWord, getUserReviewStats } from "../utils/reviewsStorage";
import { getUserById, readUsers } from "../utils/usersStorage";

const getPlaceWord = (n: number) => {
  const value = Math.abs(n) % 100;
  const num = value % 10;

  if (value > 10 && value < 20) return "мест";
  if (num > 1 && num < 5) return "места";
  if (num === 1) return "место";
  return "мест";
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

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [seatsToBook, setSeatsToBook] = useState<number>(1);
  const [confirmedPassengers, setConfirmedPassengers] = useState<
    Array<{ booking: Booking; passenger: User }>
  >([]);
  const [currentUserBooking, setCurrentUserBooking] = useState<Booking | null>(
    null,
  );

  const returnTo = useMemo(
    () => getSafeReturnTo(new URLSearchParams(location.search).get("returnTo")),
    [location.search],
  );
  const currentReturnPath = getCurrentReturnPath(location);
  const locationState = location.state as { from?: unknown } | null;
  const logicalReturnPath =
    typeof locationState?.from === "string" &&
    locationState.from.startsWith("/") &&
    !locationState.from.startsWith("//")
      ? locationState.from
      : currentReturnPath;
  const driverProfilePath = trip ? `/user/${trip.driver.id}` : "";

  const calcDuration = (from: string, to: string): string => {
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    let start = fh * 60 + fm;
    let end = th * 60 + tm;

    if (end < start) {
      end += 24 * 60;
    }

    const diff = end - start;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (minutes === 0) return `${hours} ч`;
    if (hours === 0) return `${minutes} мин`;
    return `${hours} ч ${minutes} мин`;
  };

  useEffect(() => {
    const found = readTrips().find((t) => t.id === id);
    if (found) {
      setTrip(found);

      const users = readUsers();
      const bookings = readBookings();
      const confirmed = bookings
        .filter((booking) => booking.tripId === found.id)
        .filter((booking) => booking.status === "confirmed")
        .map((booking) => {
          const passenger = users.find((u) => u.id === booking.userId);
          if (!passenger) return null;

          return { booking, passenger };
        })
        .filter(
          (
            item,
          ): item is {
            booking: Booking;
            passenger: User;
          } => Boolean(item),
        );

      setConfirmedPassengers(confirmed);
      setCurrentUserBooking(
        user
          ? (bookings.find(
              (booking) =>
                booking.tripId === found.id && booking.userId === user.id,
            ) ?? null)
          : null,
      );

      return;
    }

    setTrip(null);
    setConfirmedPassengers([]);
    setCurrentUserBooking(null);
  }, [id, user]);

  if (!trip) {
    return (
      <div className="trip-details-layout">Загрузка деталей поездки...</div>
    );
  }

  const formattedDate = trip.date
    ? (() => {
        const raw = new Intl.DateTimeFormat("ru-RU", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }).format(new Date(trip.date)); // например: "пятница, 14 марта"

        // Первая буква всей строки с заглавной
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      })()
    : "";
  const driverReviewStats = getUserReviewStats(
    trip.driver.id,
    trip.driver.rating,
  );
  const driver = getUserById(trip.driver.id) ?? trip.driver;
  const driverRatingLabel =
    driverReviewStats.rating !== null
      ? driverReviewStats.rating.toFixed(1)
      : "нет рейтинга";
  const driverReviewsLabel = `${driverReviewStats.reviewsCount} ${getReviewWord(
    driverReviewStats.reviewsCount,
  )}`;

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
    if (trip.status === "cancelled") {
      alert("Эта поездка отменена водителем.");
      return;
    }
    if (user.id === trip.driver.id) {
      alert("Вы не можете отправить заявку на собственную поездку.");
      return;
    }

    const bookings = readBookings();
    const existingBooking = bookings.find(
      (booking) => booking.tripId === trip.id && booking.userId === user.id,
    );

    if (existingBooking?.status === "pending") {
      showToast({
        type: "info",
        title: "Заявка уже отправлена",
        message: "Водитель увидит её в уведомлениях и сможет ответить.",
      });
      return;
    }

    if (existingBooking?.status === "confirmed") {
      showToast({
        type: "info",
        title: "Вы уже в поездке",
        message: "Водитель подтвердил вашу заявку.",
      });
      return;
    }

    const newBooking: Booking = {
      id: `${Date.now()}`,
      tripId: trip.id,
      userId: user.id,
      seats: seatsToBook,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const canReplaceExisting =
      existingBooking?.status === "rejected" ||
      existingBooking?.status === "cancelled_by_driver" ||
      existingBooking?.status === "cancelled_by_passenger";

    const updatedBookings = canReplaceExisting
      ? bookings.map((booking) =>
          booking.id === existingBooking.id ? newBooking : booking,
        )
      : [...bookings, newBooking];

    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    setCurrentUserBooking(newBooking);
    notifyBookingRequestsChanged();

    showToast({
      type: "success",
      title: "Заявка отправлена",
      message: "Водитель получил запрос и подтвердит или отклонит его.",
    });
  };

  const updateBookingCancellation = (
    status: Booking["status"],
    message: string,
  ) => {
    if (!currentUserBooking) return;

    const reason = requestCancellationReason(message);
    if (!reason) return;

    const bookings = readBookings();
    const updatedBookings = bookings.map((booking) =>
      booking.id === currentUserBooking.id
        ? {
            ...booking,
            status,
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
          }
        : booking,
    );
    const trips = readTrips();
    const updatedTrips =
      currentUserBooking.status === "confirmed"
        ? trips.map((item) =>
            item.id === trip.id
              ? {
                  ...item,
                  freeSeats: item.freeSeats + currentUserBooking.seats,
                }
              : item,
          )
        : trips;

    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
    setCurrentUserBooking({
      ...currentUserBooking,
      status,
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
    });
    setTrip((prev) =>
      prev && currentUserBooking.status === "confirmed"
        ? { ...prev, freeSeats: prev.freeSeats + currentUserBooking.seats }
        : prev,
    );
    notifyBookingRequestsChanged();

    showToast({
      type: "success",
      title:
        status === "cancelled_by_passenger"
          ? "Участие отменено"
          : "Заявка отменена",
      message:
        currentUserBooking.status === "pending"
          ? "Водитель больше не увидит заявку как новую."
          : "Водитель получит уведомление об отказе от поездки.",
    });
  };

  const cancelTripByDriver = () => {
    if (!user || user.id !== trip.driver.id) return;

    const reason = requestCancellationReason(
      "Вы действительно хотите отменить поездку? Все пассажиры с принятыми заявками получат уведомление. Частые отмены могут повлиять на рейтинг.",
    );

    if (!reason) return;

    const bookings = readBookings();
    const updatedBookings = bookings.map((booking) =>
      booking.tripId === trip.id && booking.status === "confirmed"
        ? {
            ...booking,
            status: "trip_cancelled" as const,
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
          }
        : booking,
    );
    const trips = readTrips();
    const updatedTrips = trips.map((item) =>
      item.id === trip.id
        ? {
            ...item,
            status: "cancelled" as const,
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
          }
        : item,
    );

    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
    setTrip((prev) =>
      prev
        ? {
            ...prev,
            status: "cancelled",
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
          }
        : prev,
    );
    setConfirmedPassengers([]);
    notifyBookingRequestsChanged();

    showToast({
      type: "success",
      title: "Поездка отменена",
      message: "Принятые пассажиры получат уведомление об отмене.",
    });
  };

  const cancelPassengerBookingByDriver = (bookingToCancel: Booking) => {
    if (!user || user.id !== trip.driver.id) return;

    const reason = requestCancellationReason(
      "Вы действительно хотите отменить бронь пассажира? Пассажир получит уведомление. Частые отмены могут повлиять на рейтинг.",
    );

    if (!reason) return;

    const bookings = readBookings();
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingToCancel.id
        ? {
            ...booking,
            status: "cancelled_by_driver" as const,
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
          }
        : booking,
    );
    const trips = readTrips();
    const updatedTrips = trips.map((item) =>
      item.id === trip.id
        ? { ...item, freeSeats: item.freeSeats + bookingToCancel.seats }
        : item,
    );

    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
    setConfirmedPassengers((prev) =>
      prev.filter(({ booking }) => booking.id !== bookingToCancel.id),
    );
    setTrip((prev) =>
      prev
        ? { ...prev, freeSeats: prev.freeSeats + bookingToCancel.seats }
        : prev,
    );
    notifyBookingRequestsChanged();

    showToast({
      type: "success",
      title: "Бронь пассажира отменена",
      message: "Пассажир получит уведомление об отмене.",
    });
  };

  const handleOpenChat = () => {
    if (!user) {
      alert("Сначала войдите в профиль.");
      return;
    }
    if (user.id === trip.driver.id) {
      alert("Это ваша поездка, вы уже являетесь водителем.");
      return;
    }

    const stored = localStorage.getItem(CHATS_STORAGE_KEY);
    let allChats: Chat[] = [];
    if (stored) {
      try {
        allChats = JSON.parse(stored) as Chat[];
      } catch {
        allChats = [];
      }
    }

    let chat =
      allChats.find(
        (c) =>
          c.tripId === trip.id &&
          c.driverId === trip.driver.id &&
          c.passengerId === user.id,
      ) || null;

    if (!chat) {
      chat = {
        id: Date.now().toString(),
        driverId: trip.driver.id,
        passengerId: user.id,
        tripId: trip.id,
        lastMessage: "",
        lastMessageAt: new Date().toISOString(),
      };
      const updated = [...allChats, chat];
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updated));
    }

    navigate("/profile", {
      state: {
        section: "messenger",
        chatId: chat.id,
        from: currentReturnPath,
      },
    });
  };

  const maxSeatsUserCanBook = Math.min(trip.freeSeats, 3);
  const totalPrice = trip.pricePerSeat * seatsToBook;
  const isDriver = user?.id === trip.driver.id;
  const isTripCancelled = trip.status === "cancelled";
  const canBookTrip = trip.freeSeats > 0 && !isDriver && !isTripCancelled;

  const amenityItems = [
    {
      key: "childSeat",
      label: "Есть детское кресло",
      forbiddenLabel: "Нет детского кресла",
      Icon: KidIcon,
      enabled: trip.amenities?.childSeat ?? false,
    },
    {
      key: "petsAllowed",
      label: "Можно с животными",
      forbiddenLabel: "Нельзя с животными",
      Icon: PawIcon,
      enabled: trip.amenities?.petsAllowed ?? false,
    },
    {
      key: "smokingAllowed",
      label: "Можно курить",
      forbiddenLabel: "Нельзя курить",
      Icon: SmokingIcon,
      enabled: trip.amenities?.smokingAllowed ?? false,
    },
    {
      key: "luggageAllowed",
      label: "Можно с багажом",
      forbiddenLabel: "Нельзя с багажом",
      Icon: LuggageIcon,
      enabled: trip.amenities?.luggageAllowed ?? false,
    },
  ];
  return (
    <div className="trip-details-layout">
      <PageHeader
        title="Детали поездки"
        subtitle={formattedDate}
        fallback={returnTo ?? "/"}
      />

      <div className="trip-details-content">
        {/* левая колонка */}
        <div className="trip-details-left">
          {/* карточка маршрута */}
          <section className="trip-details-card main-trip-card">
            <div className="trip-main-rows">
              {/* строка отправления */}
              <div className="trip-row">
                <div className="trip-row-time">{trip.departureTime}</div>
                <div className="trip-row-city">
                  <div className="trip-row-city-name">{trip.fromCity}</div>
                  <div className="trip-row-city-sub">Точка отправления</div>
                </div>
              </div>

              {/* строка прибытия */}
              <div className="trip-row">
                <div className="trip-row-time">{trip.arrivalTime}</div>
                <div className="trip-row-city">
                  <div className="trip-row-city-name">{trip.toCity}</div>
                  <div className="trip-row-city-sub">Точка прибытия</div>
                </div>
              </div>
            </div>

            <div className="trip-main-duration">
              {trip.arrivalTime && (
                <>
                  <div className="trip-main-duration-label">Время в пути</div>
                  <div className="trip-main-duration-value">
                    {calcDuration(trip.departureTime, trip.arrivalTime)}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* водитель */}
          <section className="trip-details-card trip-details-driver-card">
            <h2>Водитель</h2>

            <div
              className="trip-details-driver-row trip-details-clickable"
              onClick={() =>
                navigate(driverProfilePath, {
                  state: {
                    from: currentReturnPath,
                    fromState: location.state,
                  },
                })
              }
            >
              <div className="trip-details-avatar">
                {driver.avatarUrl ? (
                  <img src={driver.avatarUrl} alt={driver.fullName} />
                ) : (
                  <People aria-hidden="true" />
                )}
              </div>
              <div className="trip-details-driver-main">
                <div className="trip-details-driver-name">
                  {driver.fullName}
                </div>
                <div className="trip-details-driver-rating">
                  <StarFilledIcon aria-hidden="true" />
                  <span>
                    {driverRatingLabel} · {driverReviewsLabel}
                  </span>
                </div>
                <div className="trip-details-driver-status">
                  Профиль подтверждён
                </div>
              </div>
            </div>

            {driver.carName && (
              <div className="trip-details-info-row">
                <span className="trip-details-label">Автомобиль</span>
                <span className="trip-details-value">{driver.carName}</span>
              </div>
            )}

            {trip.type === "passenger" && (
              <div className="trip-details-amenities-row">
                {amenityItems.map(
                  ({ Icon, enabled, forbiddenLabel, key, label }) => (
                    <span
                      key={key}
                      className={
                        enabled
                          ? "trip-amenity trip-amenity--allowed"
                          : "trip-amenity trip-amenity--forbidden"
                      }
                      title={enabled ? "Разрешено" : "Запрещено"}
                    >
                      <Icon aria-hidden="true" />
                      {enabled ? label : forbiddenLabel}
                    </span>
                  ),
                )}
              </div>
            )}

            <button
              type="button"
              className="trip-details-secondary-btn"
              onClick={handleOpenChat}
            >
              <MessageIcon aria-hidden="true" />
              Чат с водителем
            </button>
          </section>

          {trip.comment && (
            <section className="trip-details-card">
              <h2>Комментарий водителя</h2>
              <p className="trip-driver-comment">{trip.comment}</p>
            </section>
          )}

          <section className="trip-details-card">
            <h2>Пассажиры</h2>
            {confirmedPassengers.length > 0 ? (
              <div className="trip-details-passengers-list">
                {confirmedPassengers.map(({ booking, passenger }) => (
                  <div className="trip-details-passenger-item" key={booking.id}>
                    <button
                      type="button"
                      className="trip-details-passenger-row trip-details-clickable"
                      onClick={() =>
                        navigate(`/user/${passenger.id}`, {
                          state: {
                            from: currentReturnPath,
                            fromState: location.state,
                          },
                        })
                      }
                    >
                      <div className="trip-details-avatar">
                        {passenger.avatarUrl ? (
                          <img
                            src={passenger.avatarUrl}
                            alt={passenger.fullName}
                          />
                        ) : (
                          <People aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <div className="trip-details-passenger-name">
                          {passenger.fullName}
                        </div>
                        <div className="trip-details-passenger-sub">
                          {booking.seats} {getPlaceWord(booking.seats)}
                        </div>
                      </div>
                    </button>
                    {isDriver && !isTripCancelled && (
                      <button
                        type="button"
                        className="trip-details-passenger-cancel-btn"
                        onClick={() => cancelPassengerBookingByDriver(booking)}
                      >
                        Отменить бронь
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="trip-details-passenger-row">
                <div className="trip-details-avatar" />
                <div>
                  <div className="trip-details-passenger-name">
                    Пассажиров пока нет
                  </div>
                  <div className="trip-details-passenger-sub">
                    Они появятся здесь после подтверждения водителем
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* правая колонка — карточка бронирования */}
        <aside className="trip-details-right">
          <section className="trip-details-card booking-card">
            <div className="booking-card-date">{formattedDate}</div>
            {isTripCancelled && (
              <div className="trip-cancelled-notice">
                Поездка отменена
                {trip.cancellationReason ? `: ${trip.cancellationReason}` : "."}
              </div>
            )}

            <div className="trip-right-rows">
              <div className="trip-row">
                <div className="trip-row-time">{trip.departureTime}</div>
                <div className="trip-row-city">
                  <div className="trip-row-city-name">{trip.fromCity}</div>
                  <div className="trip-row-city-sub">Точка отправления</div>
                </div>
              </div>

              <div className="trip-row">
                <div className="trip-row-time">{trip.arrivalTime}</div>
                <div className="trip-row-city">
                  <div className="trip-row-city-name">{trip.toCity}</div>
                  <div className="trip-row-city-sub">Точка прибытия</div>
                </div>
              </div>
            </div>

            <div
              className="booking-card-driver"
              onClick={() =>
                navigate(driverProfilePath, {
                  state: {
                    from: currentReturnPath,
                    fromState: location.state,
                  },
                })
              }
            >
              <div className="trip-details-avatar">
                {driver.avatarUrl ? (
                  <img src={driver.avatarUrl} alt={driver.fullName} />
                ) : (
                  <People aria-hidden="true" />
                )}
              </div>
              <div>
                <div className="trip-details-driver-name">
                  {driver.fullName}
                </div>
                <div className="trip-details-driver-rating">
                  <StarFilledIcon aria-hidden="true" />
                  <span>
                    {driverRatingLabel} · {driverReviewsLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* новый, более понятный блок выбора мест */}
            <div className="booking-card-seats-row">
              <div className="booking-card-seats-info">
                <span className="booking-seats-left">
                  Осталось мест: <strong>{trip.freeSeats}</strong>
                </span>
                <span className="booking-price">
                  Итого за поездку: {totalPrice} ₽
                </span>
              </div>

              <div className="booking-card-passengers">
                <span className="booking-passengers-label">Пассажиров</span>
                <div className="booking-passengers-control">
                  <button
                    type="button"
                    onClick={() => setSeatsToBook((v) => Math.max(1, v - 1))}
                    disabled={seatsToBook <= 1}
                  >
                    −
                  </button>
                  <span className="booking-passengers-value">
                    {seatsToBook}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSeatsToBook((v) =>
                        Math.min(maxSeatsUserCanBook, v + 1),
                      )
                    }
                    disabled={seatsToBook >= maxSeatsUserCanBook}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              className="booking-card-btn"
              onClick={handleBook}
              disabled={
                !canBookTrip ||
                currentUserBooking?.status === "pending" ||
                currentUserBooking?.status === "confirmed"
              }
            >
              <span>
                {currentUserBooking?.status === "pending"
                  ? "Заявка на рассмотрении"
                  : currentUserBooking?.status === "confirmed"
                    ? "Заявка принята"
                    : isTripCancelled
                      ? "Поездка отменена"
                      : isDriver
                        ? "Это ваша поездка"
                        : trip.freeSeats > 0
                          ? `Отправить заявку на ${seatsToBook} ${getPlaceWord(seatsToBook)}`
                          : "Мест нет"}
              </span>
              <span className="booking-card-price">{totalPrice} ₽</span>
            </button>
            {currentUserBooking?.status === "pending" && (
              <button
                type="button"
                className="booking-card-secondary-danger-btn"
                onClick={() =>
                  updateBookingCancellation(
                    "cancelled_by_passenger",
                    "Вы действительно хотите отозвать заявку? Водитель больше не увидит ее как новую.",
                  )
                }
              >
                Отозвать заявку
              </button>
            )}
            {currentUserBooking?.status === "confirmed" && (
              <button
                type="button"
                className="booking-card-secondary-danger-btn"
                onClick={() =>
                  updateBookingCancellation(
                    "cancelled_by_passenger",
                    "Вы действительно хотите отказаться от поездки? Водитель получит уведомление. Частые отмены могут повлиять на рейтинг.",
                  )
                }
              >
                Отказаться от поездки
              </button>
            )}
            {isDriver && !isTripCancelled && (
              <button
                type="button"
                className="booking-card-secondary-danger-btn"
                onClick={cancelTripByDriver}
              >
                Отменить поездку
              </button>
            )}
            {isDriver && !isTripCancelled && (
              <button
                type="button"
                className="trip-details-edit-btn"
                onClick={() =>
                  navigate(`/trip/${trip.id}/edit`, {
                    state: { from: logicalReturnPath },
                  })
                }
              >
                <EditIcon aria-hidden="true" />
                Редактировать
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default TripDetailsPage;
