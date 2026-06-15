import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Trip,
  BOOKINGS_STORAGE_KEY,
  Booking,
  CHATS_STORAGE_KEY,
  Chat,
  TRIPS_STORAGE_KEY,
} from "../types";
import PageHeader from "../components/layout/PageHeader";
import {
  EditIcon,
  MessageIcon,
  People,
  StarFilledIcon,
  TruckIcon,
} from "../icons/IconsIndex";
import { useToast } from "../context/ToastContext";
import { readTrips } from "../utils/tripsStorage";
import { getCurrentReturnPath, getSafeReturnTo } from "../utils/returnTo";
import { notifyBookingRequestsChanged } from "../utils/bookingNotifications";
import { getReviewWord, getUserReviewStats } from "../utils/reviewsStorage";
import { getUserById } from "../utils/usersStorage";

const cancellationReasons = [
  "изменились планы",
  "сломалась машина",
  "заболел/не могу выполнить перевозку",
  "заказчик не отвечает",
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

const calcDuration = (from: string, to: string): string => {
  const [fromHours, fromMinutes] = from.split(":").map(Number);
  const [toHours, toMinutes] = to.split(":").map(Number);
  const start = fromHours * 60 + fromMinutes;
  let end = toHours * 60 + toMinutes;

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

const CargoTripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const returnTo = useMemo(
    () => getSafeReturnTo(new URLSearchParams(location.search).get("returnTo")),
    [location.search],
  );

  useEffect(() => {
    const found = readTrips().find((t) => t.id === id);
    setTrip(found ?? null);
  }, [id]);

  if (!trip) {
    return (
      <div className="trip-details-layout">Загрузка деталей поездки...</div>
    );
  }

  const isDriver = user?.id === trip.driver.id;
  const isTripCancelled = trip.status === "cancelled";

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
  const currentReturnPath = getCurrentReturnPath(location);
  const locationState = location.state as { from?: unknown } | null;
  const logicalReturnPath =
    typeof locationState?.from === "string" &&
    locationState.from.startsWith("/") &&
    !locationState.from.startsWith("//")
      ? locationState.from
      : currentReturnPath;
  const driverProfilePath = `/user/${trip.driver.id}`;
  const cargoPrice = trip.pricePerCar ?? trip.pricePerSeat;
  const cargoTypes = trip.cargoTypes?.length ? trip.cargoTypes : ["уточняется"];
  const cargoWeight =
    trip.cargoWeight !== undefined ? `до ${trip.cargoWeight} кг` : "уточняется";
  const cargoLength =
    trip.cargoLength !== undefined ? `${trip.cargoLength} м` : "уточняется";
  const cargoHeight =
    trip.cargoHeight !== undefined ? `${trip.cargoHeight} м` : "уточняется";
  const cargoWidth =
    trip.cargoWidth !== undefined ? `${trip.cargoWidth} м` : "уточняется";
  const driver = getUserById(trip.driver.id) ?? trip.driver;
  const driverReviewStats = getUserReviewStats(
    trip.driver.id,
    trip.driver.rating,
  );
  const driverRatingLabel =
    driverReviewStats.rating !== null
      ? driverReviewStats.rating.toFixed(1)
      : "нет рейтинга";
  const driverReviewsLabel = `${driverReviewStats.reviewsCount} ${getReviewWord(
    driverReviewStats.reviewsCount,
  )}`;

  const handleOpenChat = () => {
    if (!user) {
      alert("Сначала войдите в профиль.");
      return;
    }
    if (user.id === trip.driver.id) {
      alert("Это ваша поездка.");
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

  const handleBook = () => {
    if (!user) {
      alert("Для бронирования необходимо войти в профиль.");
      return;
    }
    if (isDriver || isTripCancelled) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      tripId: trip.id,
      userId: user.id,
      seats: 1, // для грузовой бронируем машину целиком
      createdAt: new Date().toISOString(),
      status: "pending",
    };

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

    showToast({
      type: "success",
      title: "Грузовая поездка забронирована",
      message: "Водитель получил запрос. Ожидайте ответа.",
    });
  };

  const cancelTripByDriver = () => {
    if (!user || user.id !== trip.driver.id || isTripCancelled) return;

    const reason = requestCancellationReason(
      "Вы действительно хотите отменить грузовую поездку? Заказчики с принятыми заявками получат уведомление.",
    );
    if (!reason) return;

    const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    let bookings: Booking[] = [];
    if (storedBookings) {
      try {
        bookings = JSON.parse(storedBookings) as Booking[];
      } catch {
        bookings = [];
      }
    }

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
    const updatedTrips = readTrips().map((item) =>
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
    notifyBookingRequestsChanged();

    showToast({
      type: "success",
      title: "Грузовая поездка отменена",
      message: "Заказчики получат уведомление об отмене.",
    });
  };

  return (
    <div className="trip-details-layout">
      <PageHeader
        title="Детали поездки"
        subtitle={formattedDate}
        fallback={returnTo ?? "/"}
      />

      <div className="trip-details-content">
        {/* левая колонка */}
        <div className="cargo-details-left">
          <div className="cargo-details-main-image">
            <TruckIcon aria-hidden="true" />
          </div>

          <section className="trip-details-card cargo-main-card">
            <h2>Маршрут</h2>
            <div className="trip-main-rows">
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

          <section className="trip-details-card">
            <h2>Допустимый груз</h2>
            <div className="cargo-allowance-grid">
              <div className="cargo-param-item cargo-param-item--types">
                <span className="cargo-param-label">Тип груза</span>
                <span className="cargo-param-value cargo-param-list">
                  {cargoTypes.map((type) => (
                    <span key={type}>{type}</span>
                  ))}
                </span>
              </div>
              <div className="cargo-dimensions-column">
                <div className="cargo-param-item">
                  <span className="cargo-param-label">Длина груза</span>
                  <span className="cargo-param-value">{cargoLength}</span>
                </div>
                <div className="cargo-param-item">
                  <span className="cargo-param-label">Ширина груза</span>
                  <span className="cargo-param-value">{cargoWidth}</span>
                </div>
                <div className="cargo-param-item">
                  <span className="cargo-param-label">Высота груза</span>
                  <span className="cargo-param-value">{cargoHeight}</span>
                </div>
              </div>
              <div className="cargo-param-item">
                <span className="cargo-param-label">Допустимый вес</span>
                <span className="cargo-param-value">{cargoWeight}</span>
              </div>
            </div>
          </section>

          <section className="trip-details-card">
            <h2>Транспорт</h2>
            <div className="cargo-params-grid">
              <div className="cargo-param-item">
                <span className="cargo-param-label">Автомобиль</span>
                <span className="cargo-param-value">
                  {driver.carName ?? "Грузовой автомобиль"}
                </span>
              </div>
              <div className="cargo-param-item">
                <span className="cargo-param-label">Тип транспорта</span>
                <span className="cargo-param-value">
                  {trip.cargoVehicleType ?? "уточняется"}
                </span>
              </div>
            </div>
          </section>

          <section className="trip-details-card">
            <h2>Дополнительные услуги</h2>
            <p className="cargo-multiline">
              {trip.cargoServices?.length
                ? trip.cargoServices.join(", ")
                : "Дополнительные услуги не указаны."}
            </p>
          </section>

          {trip.comment && (
            <section className="trip-details-card">
              <h2>Комментарий водителя</h2>
              <p className="trip-driver-comment">{trip.comment}</p>
            </section>
          )}
        </div>

        {/* правая колонка — водитель и бронирование */}
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

            <div className="cargo-driver-card">
              <h2>Водитель</h2>
              <Link
                to={driverProfilePath}
                state={{
                  from: currentReturnPath,
                  fromState: location.state,
                }}
                className="cargo-driver-profile-link"
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
                  <div className="trip-details-driver-rating cargo-driver-rating">
                    <StarFilledIcon aria-hidden="true" />
                    <span>
                      {driverRatingLabel} · {driverReviewsLabel}
                    </span>
                  </div>
                </div>
              </Link>

              {!isDriver && (
                <button
                  type="button"
                  className="trip-details-secondary-btn cargo-driver-chat-btn"
                  onClick={handleOpenChat}
                  disabled={isTripCancelled}
                >
                  <MessageIcon aria-hidden="true" />
                  Чат с водителем
                </button>
              )}
            </div>

            <div className="cargo-booking-section">
              <h2>Стоимость</h2>
              <div className="cargo-booking-price-chip">
                <span className="cargo-booking-price-label">За машину</span>
                <span className="cargo-booking-price-value">
                  {cargoPrice} ₽
                </span>
              </div>
            </div>

            <div className="cargo-booking-section">
              {isDriver ? (
                <>
                  {!isTripCancelled && (
                    <>
                      <button
                        type="button"
                        className="booking-card-secondary-danger-btn"
                        onClick={cancelTripByDriver}
                      >
                        Отменить поездку
                      </button>
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
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    className="booking-card-btn booking-card-btn--cargo"
                    onClick={handleBook}
                    disabled={isTripCancelled}
                  >
                    <span>
                      {isTripCancelled ? "Поездка отменена" : "Забронировать"}
                    </span>
                    <span className="booking-card-price">{cargoPrice} ₽</span>
                  </button>
                </>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default CargoTripDetailsPage;
